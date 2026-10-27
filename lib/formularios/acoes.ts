"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { obterVeiculo } from "@/lib/catalogo/consultas";
import { CONSENTIMENTO_VERSAO } from "@/lib/consentimento";
import { resumoErro } from "@/lib/log";
import { clienteServico } from "@/lib/supabase/servico";
import {
  errosPorCampo,
  esquemaConsignacao,
  FOTOS_CLIENTE,
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
    console.error("enviarSimulacao", resumoErro(error));
    return { erros: {}, geral: MENSAGEM_FALHA };
  }

  const params = new URLSearchParams();
  if (veiculo) params.set("veiculo", veiculo.slug);
  else if (d.valorAproximado) params.set("valor", String(Math.round(d.valorAproximado)));
  redirect(`/simular/enviado?${params}`);
}

/* ------------------------------------------------------------------ Fotos enviadas pelo cliente */

/** Envio com fotos: o registro já está gravado; o navegador sobe as fotos e segue para a confirmação. */
export type RespostaComFotos = { ok: true; id: string; assinatura: string; uploads: { path: string; token: string }[]; confirmacao: string };

type BucketCliente = "consignacoes" | "trocas";

/** Links assinados para o navegador enviar cada foto direto ao bucket privado, na pasta do registro. */
async function linksDeEnvio(bucket: BucketCliente, id: string, fotos: { tipo: string }[]) {
  const storage = clienteServico().storage.from(bucket);
  const uploads: { path: string; token: string }[] = [];
  for (const [i, foto] of fotos.entries()) {
    const extensao = foto.tipo === "image/png" ? "png" : "jpg";
    const path = `${id}/${String(i + 1).padStart(2, "0")}-${randomUUID()}.${extensao}`;
    const { data: assinado, error } = await storage.createSignedUploadUrl(path);
    if (error || !assinado) {
      console.error(`linksDeEnvio ${bucket}`, resumoErro(error));
      break;
    }
    uploads.push({ path, token: assinado.token });
  }
  return uploads;
}

/** Registra as fotos que chegaram. Só aceita caminhos da pasta do próprio registro que existam no Storage. */
async function registrarFotos(
  bucket: BucketCliente,
  entrada: { id: string; assinatura: string; paths: string[] },
  gravar: (validos: string[]) => PromiseLike<{ error: unknown }>,
) {
  if (!assinaturaValida(entrada.id, entrada.assinatura)) return { ok: false };
  const { data: arquivos } = await clienteServico().storage.from(bucket).list(entrada.id, { limit: 20 });
  const existentes = new Set((arquivos ?? []).map((a) => `${entrada.id}/${a.name}`));
  const validos = entrada.paths.filter((p) => p.startsWith(`${entrada.id}/`) && existentes.has(p)).slice(0, FOTOS_CLIENTE.maximo);
  if (validos.length) {
    const { error } = await gravar(validos);
    if (error) console.error(`registrarFotos ${bucket}`, resumoErro(error));
  }
  return { ok: true, total: validos.length };
}

/* ------------------------------------------------------------------ Pedido de busca */

/**
 * Grava o pedido. Sem fotos do carro de entrada, vai direto para a confirmação; com fotos, devolve links
 * assinados (bucket privado "trocas") e o navegador chama `confirmarFotosPedido` depois do envio.
 */
export async function enviarPedido(entrada: {
  campos: CamposPedido;
  fotos: { tipo: string; tamanho: number }[];
  iniciadoEm: number;
}): Promise<RespostaEnvio | RespostaComFotos> {
  const resumo = (c: { marcaModelo: string; anoMinimo: string | number; faixa: string }) =>
    `/nao-encontrou/enviado?${new URLSearchParams({ carro: c.marcaModelo.trim().slice(0, 80), ano: String(c.anoMinimo), faixa: c.faixa })}`;
  if (pareceRobo(entrada.campos.site, entrada.iniciadoEm)) redirect(resumo(entrada.campos));

  const resultado = esquemaPedido.safeParse({ ...entrada.campos, fotos: entrada.fotos });
  if (!resultado.success) return { erros: errosPorCampo(resultado.error) };
  if (!(await dentroDoLimite("pedido_busca"))) return { erros: {}, geral: MENSAGEM_LIMITE };

  const d = resultado.data;
  const { data, error } = await clienteServico()
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
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("enviarPedido", resumoErro(error));
    return { erros: {}, geral: MENSAGEM_FALHA };
  }
  if (!d.fotos.length) redirect(resumo(d));
  const uploads = await linksDeEnvio("trocas", data.id, d.fotos);
  return { ok: true, id: data.id, assinatura: assinar(data.id), uploads, confirmacao: resumo(d) };
}

/** Registra as fotos do carro de entrada que chegaram ao Storage. */
export async function confirmarFotosPedido(entrada: { id: string; assinatura: string; paths: string[] }) {
  return registrarFotos("trocas", entrada, (validos) =>
    clienteServico()
      .from("pedido_fotos")
      .insert(validos.map((path, ordem) => ({ pedido_id: entrada.id, path, ordem }))),
  );
}

/* ------------------------------------------------------------------ Venda seu carro */

export type RespostaConsignacao = RespostaEnvio | RespostaComFotos;

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
    console.error("enviarConsignacao", resumoErro(error));
    return { erros: {}, geral: MENSAGEM_FALHA };
  }

  const uploads = await linksDeEnvio("consignacoes", data.id, d.fotos);
  return { ok: true, id: data.id, assinatura: assinar(data.id), uploads, confirmacao: confirmacao(d) };
}

/** Registra as fotos enviadas. Só aceita caminhos da própria consignação que existam no Storage. */
export async function confirmarFotosConsignacao(entrada: { id: string; assinatura: string; paths: string[] }) {
  return registrarFotos("consignacoes", entrada, (validos) =>
    clienteServico()
      .from("consignacao_fotos")
      .insert(validos.map((path, ordem) => ({ consignacao_id: entrada.id, path, ordem }))),
  );
}
