"use server";

import { refresh } from "next/cache";
import { resumoErro } from "@/lib/log";
import { STATUS_CONSIGNACAO, STATUS_PEDIDO, STATUS_SIMULACAO } from "@/lib/status";
import { exigirAdmin } from "./sessao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LISTAS = {
  pedidos: { tabela: "pedidos_busca", status: STATUS_PEDIDO, anotacoes: true },
  simulacoes: { tabela: "simulacoes", status: STATUS_SIMULACAO, anotacoes: false },
  consignacoes: { tabela: "consignacoes", status: STATUS_CONSIGNACAO, anotacoes: true },
} as const;

export type Lista = keyof typeof LISTAS;

/** Muda o status com um toque (detalhe) ou na linha da tabela do desktop. Os contadores do menu acompanham. */
export async function mudarStatus(lista: Lista, id: string, status: string): Promise<{ ok: boolean }> {
  const def = LISTAS[lista];
  if (!def || !UUID.test(id) || !(status in def.status)) return { ok: false };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from(def.tabela).update({ status }).eq("id", id);
  if (error) {
    console.error("mudarStatus", lista, resumoErro(error));
    return { ok: false };
  }
  refresh();
  return { ok: true };
}

/** Fotos do cliente de cada lista: tabela, coluna do registro e bucket privado. Simulações não têm fotos. */
const FOTOS = {
  pedidos: { tabela: "pedido_fotos", coluna: "pedido_id", bucket: "trocas" },
  consignacoes: { tabela: "consignacao_fotos", coluna: "consignacao_id", bucket: "consignacoes" },
} as const;

/**
 * Exclusão a pedido do cliente (LGPD), sempre depois da confirmação no padrão da tela 14: apaga as fotos
 * do Storage (as registradas e as que sobraram na pasta) e depois o registro. Se o Storage falhar, o
 * registro continua e nada fica órfão no banco. Veículos cadastrados a partir de uma consignação não são
 * afetados: as fotos deles foram copiadas para o bucket dos veículos e o vínculo vira null.
 */
export async function excluirRegistro(lista: Lista, id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  const def = LISTAS[lista];
  if (!def || !UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const falha = { ok: false as const, erro: "Não foi possível excluir. Tente de novo." };

  if (lista !== "simulacoes") {
    const f = FOTOS[lista];
    const { data: registradas, error: erroFotos } =
      f.tabela === "pedido_fotos"
        ? await supabase.from("pedido_fotos").select("path").eq("pedido_id", id)
        : await supabase.from("consignacao_fotos").select("path").eq("consignacao_id", id);
    if (erroFotos) {
      console.error("excluirRegistro fotos", lista, resumoErro(erroFotos));
      return falha;
    }
    const caminhos = new Set((registradas ?? []).map((r) => r.path));
    const { data: pasta } = await supabase.storage.from(f.bucket).list(id, { limit: 100 });
    for (const arquivo of pasta ?? []) caminhos.add(`${id}/${arquivo.name}`);
    if (caminhos.size) {
      const { error } = await supabase.storage.from(f.bucket).remove([...caminhos]);
      if (error) {
        console.error("excluirRegistro storage", lista, resumoErro(error));
        return { ok: false, erro: "Não foi possível apagar as fotos. Tente de novo." };
      }
    }
  }

  const { error } = await supabase.from(def.tabela).delete().eq("id", id);
  if (error) {
    console.error("excluirRegistro", lista, resumoErro(error));
    return falha;
  }
  refresh();
  return { ok: true };
}

/** Anotações da loja (pedidos e consignações): salvas ao sair do campo. */
export async function salvarAnotacoes(lista: Lista, id: string, texto: string): Promise<{ ok: boolean }> {
  const def = LISTAS[lista];
  if (!def?.anotacoes || !UUID.test(id) || texto.length > 5000) return { ok: false };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from(def.tabela as "pedidos_busca" | "consignacoes").update({ anotacoes: texto }).eq("id", id);
  if (error) console.error("salvarAnotacoes", lista, resumoErro(error));
  return { ok: !error };
}
