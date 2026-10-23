"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { obterVeiculo } from "@/lib/catalogo/consultas";
import { CONSENTIMENTO_VERSAO } from "@/lib/consentimento";
import { clienteServico } from "@/lib/supabase/servico";
import {
  errosPorCampo,
  esquemaConsignacao,
  esquemaPedido,
  esquemaSimulacao,
  type CamposConsignacao,
  type CamposPedido,
  type CamposSimulacao,
  type ErrosCampos,
} from "./esquemas";
import { assinar, assinaturaValida, dentroDoLimite, MENSAGEM_FALHA, MENSAGEM_LIMITE, pareceRobo } from "./protecao";

/**
 * Envios públicos (Server Actions). Validam de novo no servidor (o navegador não é confiável),
 * gravam com a chave de serviço e redirecionam para a confirmação.
 * A URL da confirmação leva só dados do carro, nunca dados pessoais.
 */

export type RespostaEnvio = { erros: ErrosCampos; geral?: string };

/* ------------------------------------------------------------------ Simulação */

export async function enviarSimulacao(entrada: { veiculo: string | null; campos: CamposSimulacao; iniciadoEm: number }): Promise<RespostaEnvio> {
  const destino = entrada.veiculo ? `/simular/enviado?veiculo=${encodeURIComponent(entrada.veiculo)}` : "/simular/enviado";
  if (pareceRobo(entrada.campos.site, entrada.iniciadoEm)) redirect(destino);

  // O preço vem do banco (retrato no momento do envio), não do navegador.
  const veiculo = entrada.veiculo ? await obterVeiculo(entrada.veiculo) : null;
  if (entrada.veiculo && !veiculo) {
    return { erros: {}, geral: "Esse veículo não está mais disponível. Escolha outro ou simule sem veículo." };
  }

  const resultado = esquemaSimulacao(veiculo?.preco ?? null).safeParse(entrada.campos);
  if (!resultado.success) return { erros: errosPorCampo(resultado.error) };
  if (!(await dentroDoLimite("simulacao"))) return { erros: {}, geral: MENSAGEM_LIMITE };

  const d = resultado.data;
  const servico = clienteServico();
  // O id do veículo não vai para o navegador: é buscado aqui pelo slug.
  const { data: linhaVeiculo } = veiculo ? await servico.from("veiculos").select("id").eq("slug", veiculo.slug).maybeSingle() : { data: null };
  const { error } = await servico.from("simulacoes").insert({
    veiculo_id: linhaVeiculo?.id ?? null,
    veiculo_nome: veiculo ? [veiculo.marca, veiculo.modelo, veiculo.versao].filter(Boolean).join(" ") : null,
    veiculo_preco: veiculo?.preco ?? null,
    valor_aproximado: d.valorAproximado,
    nome: d.nome,
    cpf: d.cpf,
    nascimento: d.nascimento,
    whatsapp: d.whatsapp,
    renda: d.renda,
    entrada: d.entrada,
    prazo_meses: d.prazo,
    parcela_desejada: d.parcela,
    tem_troca: d.temTroca,
    troca_modelo: d.temTroca ? d.trocaModelo!.trim() : null,
    troca_ano: d.temTroca ? d.trocaAno : null,
    possui_cnh: d.possuiCnh,
    consentimento_em: new Date().toISOString(),
    consentimento_versao: CONSENTIMENTO_VERSAO,
  });
  if (error) {
    console.error("enviarSimulacao", error);
    return { erros: {}, geral: MENSAGEM_FALHA };
  }

  const params = new URLSearchParams();
  if (veiculo) params.set("veiculo", veiculo.slug);
  else if (d.valorAproximado) params.set("valor", String(Math.round(d.valorAproximado)));
  redirect(`/simular/enviado?${params}`);
}

/* ------------------------------------------------------------------ Pedido de busca */

export async function enviarPedido(entrada: { campos: CamposPedido; iniciadoEm: number }): Promise<RespostaEnvio> {
  const resumo = (c: { marcaModelo: string; anoMinimo: string | number; faixa: string }) =>
    `/nao-encontrou/enviado?${new URLSearchParams({ carro: c.marcaModelo.trim().slice(0, 80), ano: String(c.anoMinimo), faixa: c.faixa })}`;
  if (pareceRobo(entrada.campos.site, entrada.iniciadoEm)) redirect(resumo(entrada.campos));

  const resultado = esquemaPedido.safeParse(entrada.campos);
  if (!resultado.success) return { erros: errosPorCampo(resultado.error) };
  if (!(await dentroDoLimite("pedido_busca"))) return { erros: {}, geral: MENSAGEM_LIMITE };

  const d = resultado.data;
  const { error } = await clienteServico()
    .from("pedidos_busca")
    .insert({
      nome: d.nome,
      whatsapp: d.whatsapp,
      marca_modelo: d.marcaModelo,
      ano_minimo: d.anoMinimo,
      faixa_preco: d.faixa,
      pagamento: d.pagamento,
      prazo_meses: d.prazo,
      entrada: d.entrada,
      parcela_desejada: d.parcela,
      tem_troca: d.temTroca,
      troca_modelo: d.temTroca ? d.trocaModelo!.trim() : null,
      troca_ano: d.temTroca ? d.trocaAno : null,
      consentimento_em: new Date().toISOString(),
      consentimento_versao: CONSENTIMENTO_VERSAO,
    });
  if (error) {
    console.error("enviarPedido", error);
    return { erros: {}, geral: MENSAGEM_FALHA };
  }
  redirect(resumo(d));
}

/* ------------------------------------------------------------------ Venda seu carro */

export type RespostaConsignacao =
  | RespostaEnvio
  | { ok: true; id: string; assinatura: string; uploads: { path: string; token: string }[]; confirmacao: string };

/**
 * Grava a consignação e devolve links assinados para o navegador enviar as fotos direto ao Storage
 * (bucket privado; fotos de até 10 MB não passam pelo servidor). Depois do envio, o navegador chama
 * `confirmarFotosConsignacao`.
 */
export async function enviarConsignacao(entrada: {
  campos: CamposConsignacao;
  fotos: { tipo: string; tamanho: number }[];
  iniciadoEm: number;
}): Promise<RespostaConsignacao> {
  const confirmacao = (c: { marca: string; modelo: string; anoFabModelo: string; forma: string }) =>
    `/venda-seu-carro/enviado?${new URLSearchParams({ carro: `${c.marca} ${c.modelo}`.trim().slice(0, 80), ano: c.anoFabModelo, forma: c.forma })}`;
  if (pareceRobo(entrada.campos.site, entrada.iniciadoEm)) redirect(confirmacao(entrada.campos));

  const resultado = esquemaConsignacao.safeParse({ ...entrada.campos, fotos: entrada.fotos });
  if (!resultado.success) return { erros: errosPorCampo(resultado.error) };
  if (!(await dentroDoLimite("consignacao"))) return { erros: {}, geral: MENSAGEM_LIMITE };

  const d = resultado.data;
  const servico = clienteServico();
  const { data, error } = await servico
    .from("consignacoes")
    .insert({
      forma_venda: d.forma,
      marca: d.marca,
      modelo: d.modelo,
      versao: d.versao,
      ano_fabricacao: d.anoFabricacao,
      ano_modelo: d.anoModelo,
      km: d.km,
      cambio: d.cambio,
      cor: d.cor,
      quitado: d.quitado,
      valor_pretendido: d.valorPretendido,
      detalhes: d.detalhes,
      nome: d.nome,
      whatsapp: d.whatsapp,
      consentimento_em: new Date().toISOString(),
      consentimento_versao: CONSENTIMENTO_VERSAO,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("enviarConsignacao", error);
    return { erros: {}, geral: MENSAGEM_FALHA };
  }

  const uploads: { path: string; token: string }[] = [];
  for (const [i, foto] of d.fotos.entries()) {
    const extensao = foto.tipo === "image/png" ? "png" : "jpg";
    const path = `${data.id}/${String(i + 1).padStart(2, "0")}-${randomUUID()}.${extensao}`;
    const { data: assinado, error: e } = await servico.storage.from("consignacoes").createSignedUploadUrl(path);
    if (e || !assinado) {
      console.error("enviarConsignacao upload", e);
      break;
    }
    uploads.push({ path, token: assinado.token });
  }

  return { ok: true, id: data.id, assinatura: assinar(data.id), uploads, confirmacao: confirmacao(d) };
}

/** Registra as fotos enviadas. Só aceita caminhos da própria consignação que existam no Storage. */
export async function confirmarFotosConsignacao(entrada: { id: string; assinatura: string; paths: string[] }) {
  if (!assinaturaValida(entrada.id, entrada.assinatura)) return { ok: false };
  const servico = clienteServico();
  const { data: arquivos } = await servico.storage.from("consignacoes").list(entrada.id, { limit: 20 });
  const existentes = new Set((arquivos ?? []).map((a) => `${entrada.id}/${a.name}`));
  const validos = entrada.paths.filter((p) => p.startsWith(`${entrada.id}/`) && existentes.has(p)).slice(0, 8);
  if (validos.length) {
    const { error } = await servico.from("consignacao_fotos").insert(validos.map((path, ordem) => ({ consignacao_id: entrada.id, path, ordem })));
    if (error) console.error("confirmarFotosConsignacao", error);
  }
  return { ok: true, total: validos.length };
}
