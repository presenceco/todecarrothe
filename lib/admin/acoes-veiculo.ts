"use server";

import { randomUUID } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { TAG_VEICULOS } from "@/lib/catalogo/consultas";
import { errosPorCampo, type ErrosCampos } from "@/lib/formularios/esquemas";
import { slugLivre, slugVeiculo } from "@/lib/slug";
import { esquemaVeiculo, MAX_FOTOS_VEICULO, type CamposVeiculo } from "./esquema-veiculo";
import { exigirAdmin } from "./sessao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type FotoParaSalvar = { path: string; origem: "veiculo" | "consignacao" };

export type RespostaSalvar = { ok: true; id: string; slug: string; publicado: boolean } | { ok: false; erros: ErrosCampos; geral?: string };

const FALHA = "Não foi possível salvar. Confira a conexão e tente de novo.";

/**
 * Salva o veículo (15/28). "Salvar rascunho" grava fora do catálogo; "Publicar no catálogo" grava publicado.
 * As fotos já estão no bucket (enviadas pelo navegador na pasta do veículo); as da consignação são copiadas
 * agora. Fotos tiradas da lista saem também do Storage. O slug é refeito sem colisão (base, base-2…).
 */
export async function salvarVeiculo(entrada: {
  id: string;
  novo: boolean;
  campos: CamposVeiculo;
  fotos: FotoParaSalvar[];
  publicar: boolean;
  consignacaoId: string | null;
}): Promise<RespostaSalvar> {
  const { supabase } = await exigirAdmin();
  const { id, novo, publicar } = entrada;
  if (!UUID.test(id) || (entrada.consignacaoId && !UUID.test(entrada.consignacaoId))) return { ok: false, erros: {}, geral: "Pedido inválido." };

  const r = esquemaVeiculo.safeParse(entrada.campos);
  if (!r.success) return { ok: false, erros: errosPorCampo(r.error) };
  const d = r.data;
  if (entrada.fotos.length > MAX_FOTOS_VEICULO) return { ok: false, erros: { fotos: `No máximo ${MAX_FOTOS_VEICULO} fotos por veículo.` } };
  if (publicar && entrada.fotos.length === 0) return { ok: false, erros: { fotos: "Adicione pelo menos uma foto para publicar." } };

  // Slug: mantém o atual se ainda corresponde aos dados; senão, o primeiro livre.
  const base = slugVeiculo(d.marca, d.modelo, d.versao, d.anoModelo);
  const { data: parecidos } = await supabase.from("veiculos").select("id, slug").like("slug", `${base}%`);
  const atual = parecidos?.find((p) => p.id === id)?.slug;
  const ocupados = new Set((parecidos ?? []).filter((p) => p.id !== id).map((p) => p.slug));
  const slug = atual && (atual === base || new RegExp(`^${base}-\\d+$`).test(atual)) ? atual : slugLivre(base, ocupados);

  const linha = {
    slug,
    marca: d.marca,
    modelo: d.modelo,
    versao: d.versao,
    ano_fabricacao: d.anoFabricacao,
    ano_modelo: d.anoModelo,
    km: d.km,
    cambio: d.cambio,
    cor: d.cor,
    combustivel: d.combustivel,
    tipo: d.tipo,
    final_placa: d.finalPlaca,
    preco: d.preco,
    status: d.status,
    // Id no campo = etiqueta personalizada.
    etiqueta: UUID.test(d.etiqueta) ? "personalizada" : d.etiqueta,
    etiqueta_personalizada_id: UUID.test(d.etiqueta) ? d.etiqueta : null,
    selos: d.selos,
    publicado: publicar,
  };
  const gravacao = novo
    ? await supabase.from("veiculos").insert({ id, ...linha, consignacao_id: entrada.consignacaoId })
    : await supabase.from("veiculos").update(linha).eq("id", id);
  if (gravacao.error) {
    console.error("salvarVeiculo", gravacao.error);
    return { ok: false, erros: {}, geral: FALHA };
  }

  // Fotos: copia as da consignação para a pasta do veículo e valida as demais.
  const finais: string[] = [];
  for (const foto of entrada.fotos) {
    if (foto.origem === "veiculo") {
      if (foto.path.startsWith(`${id}/`)) finais.push(foto.path);
      continue;
    }
    if (!entrada.consignacaoId || !foto.path.startsWith(`${entrada.consignacaoId}/`)) continue;
    const destino = `${id}/${randomUUID()}.${foto.path.toLowerCase().endsWith(".png") ? "png" : "jpg"}`;
    const { error } = await supabase.storage.from("consignacoes").copy(foto.path, destino, { destinationBucket: "veiculos" });
    if (error) console.error("salvarVeiculo copiar foto", error);
    else finais.push(destino);
  }

  const apagadas = await supabase.from("veiculo_fotos").delete().eq("veiculo_id", id);
  const inseridas = finais.length
    ? await supabase.from("veiculo_fotos").insert(finais.map((path, ordem) => ({ veiculo_id: id, path, ordem })))
    : { error: null };
  if (apagadas.error || inseridas.error) {
    console.error("salvarVeiculo fotos", apagadas.error ?? inseridas.error);
    return { ok: false, erros: {}, geral: FALHA };
  }

  // Arquivos da pasta que não estão mais na lista (removidos ou envios abandonados).
  const { data: pasta } = await supabase.storage.from("veiculos").list(id, { limit: 100 });
  const sobras = (pasta ?? []).map((a) => `${id}/${a.name}`).filter((p) => !finais.includes(p));
  if (sobras.length) await supabase.storage.from("veiculos").remove(sobras);

  await supabase.from("veiculo_opcionais").delete().eq("veiculo_id", id);
  if (d.opcionais.length) {
    const { error } = await supabase.from("veiculo_opcionais").insert(d.opcionais.map((opcional_id) => ({ veiculo_id: id, opcional_id })));
    if (error) console.error("salvarVeiculo opcionais", error);
  }

  await supabase.from("veiculo_selos").delete().eq("veiculo_id", id);
  if (d.selosExtras.length) {
    const { error } = await supabase.from("veiculo_selos").insert(d.selosExtras.map((selo_id) => ({ veiculo_id: id, selo_id })));
    if (error) console.error("salvarVeiculo selos", error);
  }

  updateTag(TAG_VEICULOS);
  // No cadastro novo não atualiza a rota: /novo geraria outro id e o formulário recomeçaria.
  // O navegador segue para a edição ou para a lista, que já leem os dados novos.
  if (!novo) refresh();
  return { ok: true, id, slug, publicado: publicar };
}

export type RespostaCriarItem = { ok: true; id: string; nome: string } | { ok: false; erro: string };

/**
 * Cria um item de lista compartilhada (opcional, etiqueta ou selo), disponível para todos os veículos.
 * Se já existir um com o mesmo nome (sem diferenciar maiúsculas), devolve o existente.
 */
async function criarItem(
  tabela: "opcionais" | "etiquetas_personalizadas" | "selos_personalizados",
  nome: string,
  maximo: number,
): Promise<RespostaCriarItem> {
  const limpo = nome.replace(/\s+/g, " ").trim();
  if (limpo.length < 2 || limpo.length > maximo) return { ok: false, erro: `Use de 2 a ${maximo} caracteres.` };
  const { supabase } = await exigirAdmin();
  // % e _ são curingas no ilike: escapados para comparar o texto exato.
  const { data: existente } = await supabase.from(tabela).select("id, nome").ilike("nome", limpo.replace(/[\\%_]/g, "\\$&")).maybeSingle();
  if (existente) return { ok: true, ...existente };
  // Opcionais criados no painel entram depois dos da lista padrão.
  const insercao = tabela === "opcionais" ? supabase.from(tabela).insert({ nome: limpo, ordem: 2000 }) : supabase.from(tabela).insert({ nome: limpo });
  const { data, error } = await insercao.select("id, nome").single();
  if (error || !data) {
    console.error(`criarItem ${tabela}`, error);
    return { ok: false, erro: "Não foi possível criar. Tente de novo." };
  }
  return { ok: true, ...data };
}

/** "+ Adicionar opcional". */
export async function criarOpcional(nome: string) {
  return criarItem("opcionais", nome, 60);
}

/** "+ Criar etiqueta": etiqueta escrita pelo admin para o cartão do catálogo (curta, cabe sobre a foto). */
export async function criarEtiqueta(nome: string) {
  return criarItem("etiquetas_personalizadas", nome, 20);
}

/** "+ Adicionar selo": selo verificado escrito pelo admin para a página do veículo. */
export async function criarSelo(nome: string) {
  return criarItem("selos_personalizados", nome, 40);
}
