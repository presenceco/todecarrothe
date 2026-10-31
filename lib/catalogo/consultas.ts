import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { clientePublico } from "@/lib/supabase/publico";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import { anoAtual } from "@/lib/formato";
import type { Selo, VeiculoCatalogo, VeiculoDetalhe } from "@/lib/tipos";

/**
 * Leituras do catálogo público, em cache. O admin invalida a tag "veiculos" ao salvar qualquer veículo;
 * a revalidação por tempo (de hora em hora) é só uma rede de segurança.
 * O RLS garante que só voltam veículos disponíveis e publicados.
 */

export const TAG_VEICULOS = "veiculos";

const CAMPOS =
  "id, slug, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, cor, combustivel, tipo, preco, etiqueta, publicado_em, etiquetas_personalizadas (nome)";

type LinhaFoto = { path: string; ordem: number };

function nomeCompleto(v: { marca: string; modelo: string; versao: string }) {
  return [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
}

/** Texto alternativo das fotos de carro: "Toyota Corolla XEi 2.0 – foto 1" (Google Imagens e leitores de tela). */
export function textoAltFoto(nome: string, indice: number) {
  return `${nome} – foto ${indice + 1}`;
}

function fotosOrdenadas(fotos: LinhaFoto[], nome: string) {
  return [...fotos]
    .sort((a, b) => a.ordem - b.ordem)
    .map((f, i) => ({ src: urlFotoVeiculo(f.path), alt: textoAltFoto(nome, i) }));
}

function paraCatalogo(v: {
  slug: string;
  marca: string;
  modelo: string;
  versao: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  cambio: string;
  cor: string;
  combustivel: string;
  tipo: string;
  preco: number;
  etiqueta: string;
  publicado_em: string | null;
  etiquetas_personalizadas: { nome: string } | null;
  veiculo_fotos: LinhaFoto[];
}): VeiculoCatalogo {
  const nome = nomeCompleto(v);
  const fotos = fotosOrdenadas(v.veiculo_fotos, nome);
  const etiquetaTexto = v.etiqueta === "personalizada" ? (v.etiquetas_personalizadas?.nome ?? null) : null;
  return {
    slug: v.slug,
    marca: v.marca,
    modelo: v.modelo,
    versao: v.versao,
    anoFabricacao: v.ano_fabricacao,
    anoModelo: v.ano_modelo,
    km: v.km,
    cambio: v.cambio as VeiculoCatalogo["cambio"],
    cor: v.cor,
    combustivel: v.combustivel as VeiculoCatalogo["combustivel"],
    tipo: v.tipo as VeiculoCatalogo["tipo"],
    preco: Number(v.preco),
    // Personalizada cuja etiqueta sumiu da lista: fica sem etiqueta.
    etiqueta: v.etiqueta === "personalizada" && !etiquetaTexto ? "nenhuma" : (v.etiqueta as VeiculoCatalogo["etiqueta"]),
    etiquetaTexto,
    publicadoEm: v.publicado_em ? Date.parse(v.publicado_em) : 0,
    totalFotos: fotos.length,
    capa: fotos[0] ?? null,
  };
}

/** Todos os veículos do catálogo, do mais recente para o mais antigo. */
export async function listarCatalogo(): Promise<VeiculoCatalogo[]> {
  "use cache";
  cacheTag(TAG_VEICULOS);
  cacheLife("hours");

  const { data, error } = await clientePublico()
    .from("veiculos")
    .select(`${CAMPOS}, veiculo_fotos (path, ordem)`)
    .eq("status", "disponivel")
    .eq("publicado", true)
    .order("publicado_em", { ascending: false });
  if (error) throw new Error(`Falha ao ler o catálogo: ${error.message}`);
  return data.map(paraCatalogo);
}

/**
 * Slugs que as páginas de carro geram no build. O Next exige pelo menos um: com o catálogo vazio, vai um slug
 * que não existe e cai no "não encontrado". Carro publicado depois é gerado na 1ª visita.
 */
export async function slugsDoBuild() {
  const veiculos = await listarCatalogo();
  return veiculos.length ? veiculos.map((v) => ({ slug: v.slug })) : [{ slug: "sem-veiculos" }];
}

/** Um veículo do catálogo pelo slug, ou null se não existir ou não estiver visível. */
export async function obterVeiculo(slug: string): Promise<VeiculoDetalhe | null> {
  "use cache";
  cacheTag(TAG_VEICULOS, `veiculo:${slug}`);
  cacheLife("hours");

  const { data, error } = await clientePublico()
    .from("veiculos")
    .select(
      `${CAMPOS}, final_placa, selos, veiculo_fotos (path, ordem), veiculo_opcionais (opcionais (nome, ordem)), veiculo_selos (selos_personalizados (nome, created_at))`,
    )
    .eq("slug", slug)
    .eq("status", "disponivel")
    .eq("publicado", true)
    .maybeSingle();
  if (error) throw new Error(`Falha ao ler o veículo ${slug}: ${error.message}`);
  if (!data) return null;

  const base = paraCatalogo(data);
  const opcionais = data.veiculo_opcionais
    .map((vo) => vo.opcionais)
    .filter((o): o is { nome: string; ordem: number } => !!o)
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((o) => o.nome);

  return {
    ...base,
    finalPlaca: data.final_placa,
    selos: data.selos as Selo[],
    // Na ordem em que foram criados no painel.
    selosExtras: data.veiculo_selos
      .map((vs) => vs.selos_personalizados)
      .filter((s): s is { nome: string; created_at: string } => !!s)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((s) => s.nome),
    opcionais,
    fotos: fotosOrdenadas(data.veiculo_fotos, nomeCompleto(data)),
  };
}

/** Ano corrente no fuso da loja (limite do filtro de ano). Em cache: refeito de hora em hora. */
export async function anoCorrente() {
  "use cache";
  cacheLife("hours");
  return anoAtual();
}
