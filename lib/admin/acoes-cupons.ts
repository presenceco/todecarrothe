"use server";

import { refresh } from "next/cache";
import { normalizarCupom, REGEX_CUPOM, sugerirCodigo } from "@/lib/cupom";
import { errosPorCampo, type ErrosCampos } from "@/lib/formularios/esquemas";
import { resumoErro } from "@/lib/log";
import { esquemaCupom, type CamposCupom } from "./esquema-cupom";
import { exigirAdmin } from "./sessao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNICO = "23505";
const JA_EXISTE = "Esse código já existe. Escolha outro.";
const FALHA = "Não foi possível salvar. Confira a conexão e tente de novo.";

export type RespostaCupom = { ok: true; id: string } | { ok: false; erros: ErrosCampos; geral?: string };
export type Resultado = { ok: true } | { ok: false; erro: string };

/** Quantas vezes o cupom foi usado (contatos e cliques). */
async function usos(id: string) {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("cupons_resumo").select("total_simulacoes, total_pedidos, total_consignacoes, total_cliques").eq("id", id).maybeSingle();
  return data ? (data.total_simulacoes ?? 0) + (data.total_pedidos ?? 0) + (data.total_consignacoes ?? 0) + (data.total_cliques ?? 0) : 0;
}

/** Sugestão de código a partir do primeiro nome, já livre: JOAO; se existir, JOAO2, JOAO3… */
export async function sugerirCodigoLivre(nome: string): Promise<string> {
  const { supabase } = await exigirAdmin();
  const base = sugerirCodigo(nome);
  if (base.length < 3) return "";
  const { data } = await supabase.from("cupons").select("codigo").like("codigo", `${base.slice(0, 13)}%`);
  const ocupados = new Set((data ?? []).map((c) => c.codigo));
  if (!ocupados.has(base)) return base;
  for (let n = 2; n < 100; n++) {
    const candidato = `${base.slice(0, 15 - String(n).length)}${n}`;
    if (!ocupados.has(candidato)) return candidato;
  }
  return "";
}

/** Confere se o código está livre, ao sair do campo. `id`: o cupom em edição. */
export async function codigoLivre(codigo: string, id: string | null): Promise<boolean> {
  const { supabase } = await exigirAdmin();
  const normalizado = normalizarCupom(codigo);
  if (!REGEX_CUPOM.test(normalizado)) return true;
  const { data } = await supabase.from("cupons").select("id").eq("codigo", normalizado).maybeSingle();
  return !data || data.id === id;
}

/** Cria ou edita um cupom. Cupom já usado mantém o código: trocá-lo quebraria os links já enviados. */
export async function salvarCupom(id: string | null, campos: CamposCupom): Promise<RespostaCupom> {
  const { supabase } = await exigirAdmin();
  if (id && !UUID.test(id)) return { ok: false, erros: {}, geral: "Pedido inválido." };
  const r = esquemaCupom.safeParse(campos);
  if (!r.success) return { ok: false, erros: errosPorCampo(r.error) };
  const d = r.data;
  const linha = { codigo: d.codigo, indicador_nome: d.indicadorNome, indicador_whatsapp: d.indicadorWhatsapp, observacao: d.observacao, ativo: d.ativo };

  if (id) {
    const { data: atual } = await supabase.from("cupons").select("codigo").eq("id", id).maybeSingle();
    if (!atual) return { ok: false, erros: {}, geral: "Cupom não encontrado." };
    if (atual.codigo !== d.codigo && (await usos(id)) > 0) {
      return { ok: false, erros: { codigo: "Cupons usados não podem trocar de código: os links já enviados deixariam de funcionar." } };
    }
    const { error } = await supabase.from("cupons").update(linha).eq("id", id);
    if (error) {
      if (error.code === UNICO) return { ok: false, erros: { codigo: JA_EXISTE } };
      console.error("salvarCupom", resumoErro(error));
      return { ok: false, erros: {}, geral: FALHA };
    }
    refresh();
    return { ok: true, id };
  }

  const { data, error } = await supabase.from("cupons").insert(linha).select("id").single();
  if (error || !data) {
    if (error?.code === UNICO) return { ok: false, erros: { codigo: JA_EXISTE } };
    console.error("salvarCupom", resumoErro(error));
    return { ok: false, erros: {}, geral: FALHA };
  }
  return { ok: true, id: data.id };
}

/** Ativa ou desativa. Inativo conta como inválido para o cliente; o histórico fica. */
export async function alterarAtivoCupom(id: string, ativo: boolean): Promise<Resultado> {
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from("cupons").update({ ativo }).eq("id", id);
  if (error) {
    console.error("alterarAtivoCupom", resumoErro(error));
    return { ok: false, erro: "Não foi possível alterar. Tente de novo." };
  }
  refresh();
  return { ok: true };
}

/** Exclui um cupom que nunca foi usado (o banco também recusa os usados: on delete restrict). */
export async function excluirCupom(id: string): Promise<Resultado> {
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  if ((await usos(id)) > 0) return { ok: false, erro: "Cupons usados não podem ser excluídos para manter o histórico." };
  const { error } = await supabase.from("cupons").delete().eq("id", id);
  if (error) {
    console.error("excluirCupom", resumoErro(error));
    return { ok: false, erro: "Não foi possível excluir. Tente de novo." };
  }
  refresh();
  return { ok: true };
}

/**
 * Pedido de exclusão do indicador (LGPD) num cupom usado: apaga nome, WhatsApp e observação e desativa o
 * cupom. O código e as contagens ficam, para manter o histórico dos contatos.
 */
export async function apagarDadosIndicador(id: string): Promise<Resultado> {
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from("cupons").update({ indicador_nome: "Indicador removido", indicador_whatsapp: null, observacao: "", ativo: false }).eq("id", id);
  if (error) {
    console.error("apagarDadosIndicador", resumoErro(error));
    return { ok: false, erro: "Não foi possível apagar. Tente de novo." };
  }
  refresh();
  return { ok: true };
}
