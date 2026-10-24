import "server-only";
import { randomUUID } from "node:crypto";
import { anoFabModelo, km as formatarKm } from "@/lib/formato";
import { mascaraReais } from "@/lib/mascaras";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import type { CamposVeiculo } from "./esquema-veiculo";
import { CORES } from "./esquema-veiculo";
import { exigirAdmin } from "./sessao";

/** Foto no formulário: já do veículo (bucket público) ou vinda da consignação (privado, copiada ao salvar). */
export type FotoEditavel = { path: string; url: string; origem: "veiculo" | "consignacao" };

export type DadosFormVeiculo = {
  id: string;
  novo: boolean;
  titulo: string;
  slug: string | null;
  publicado: boolean;
  consignacaoId: string | null;
  campos: CamposVeiculo;
  fotos: FotoEditavel[];
};

export type Opcional = { id: string; nome: string };

const VAZIO: CamposVeiculo = {
  marca: "",
  modelo: "",
  versao: "",
  anoFabModelo: "",
  km: "",
  cambio: "",
  cor: "",
  combustivel: "",
  tipo: "",
  finalPlaca: "",
  preco: "",
  status: "disponivel",
  etiqueta: "nenhuma",
  selos: [],
  selosExtras: [],
  opcionais: [],
};

const nomeVeiculo = (v: { marca: string; modelo: string; versao: string }) => [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");

/** Cor da consignação no seletor: a da lista que bater (sem acento/caixa) ou "Outra". */
function corDaLista(cor: string) {
  const n = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  return CORES.find((c) => n(c) === n(cor)) ?? (cor.trim() ? "Outra" : "");
}

/** Veículo para editar (15/28), ou null se não existir. */
export async function carregarVeiculo(id: string): Promise<DadosFormVeiculo | null> {
  const { supabase } = await exigirAdmin();
  const { data: v } = await supabase
    .from("veiculos")
    .select("*, veiculo_fotos (path, ordem), veiculo_opcionais (opcional_id), veiculo_selos (selo_id)")
    .eq("id", id)
    .maybeSingle();
  if (!v) return null;
  return {
    id: v.id,
    novo: false,
    titulo: nomeVeiculo(v),
    slug: v.slug,
    publicado: v.publicado,
    consignacaoId: v.consignacao_id,
    campos: {
      marca: v.marca,
      modelo: v.modelo,
      versao: v.versao,
      anoFabModelo: anoFabModelo(v.ano_fabricacao, v.ano_modelo),
      km: formatarKm(v.km),
      cambio: v.cambio,
      cor: v.cor,
      combustivel: v.combustivel,
      tipo: v.tipo,
      finalPlaca: v.final_placa,
      preco: mascaraReais(String(Math.round(Number(v.preco)))),
      status: v.status,
      // Personalizada: o campo guarda o id dela (se a etiqueta sumiu da lista, fica sem etiqueta).
      etiqueta: v.etiqueta === "personalizada" ? (v.etiqueta_personalizada_id ?? "nenhuma") : v.etiqueta,
      selos: v.selos,
      selosExtras: v.veiculo_selos.map((s) => s.selo_id),
      opcionais: v.veiculo_opcionais.map((o) => o.opcional_id),
    },
    fotos: [...v.veiculo_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => ({ path: f.path, url: urlFotoVeiculo(f.path), origem: "veiculo" as const })),
  };
}

/**
 * Cadastro novo. O id é gerado aqui para as fotos já subirem na pasta certa do bucket.
 * Com `consignacaoId` (consignação em "Negócio fechado"), vem preenchido com o carro e as fotos enviadas.
 */
export async function novoVeiculo(consignacaoId?: string): Promise<DadosFormVeiculo> {
  const base: DadosFormVeiculo = { id: randomUUID(), novo: true, titulo: "Cadastrar veículo", slug: null, publicado: false, consignacaoId: null, campos: VAZIO, fotos: [] };
  if (!consignacaoId) return base;

  const { supabase } = await exigirAdmin();
  const { data: c } = await supabase
    .from("consignacoes")
    .select("id, status, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, cor, consignacao_fotos (path, ordem)")
    .eq("id", consignacaoId)
    .maybeSingle();
  if (!c || c.status !== "negocio_fechado") return base;

  const caminhos = [...c.consignacao_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => f.path);
  const { data: assinadas } = caminhos.length ? await supabase.storage.from("consignacoes").createSignedUrls(caminhos, 3600) : { data: [] };
  return {
    ...base,
    consignacaoId: c.id,
    campos: {
      ...VAZIO,
      marca: c.marca,
      modelo: c.modelo,
      versao: c.versao,
      anoFabModelo: anoFabModelo(c.ano_fabricacao, c.ano_modelo),
      km: formatarKm(c.km),
      cambio: c.cambio,
      cor: corDaLista(c.cor),
    },
    fotos: (assinadas ?? []).filter((a) => a.signedUrl && a.path).map((a) => ({ path: a.path!, url: a.signedUrl!, origem: "consignacao" as const })),
  };
}

/** Opcionais disponíveis para todos os veículos, na ordem das telas e depois os criados no painel. */
export async function listarOpcionais(): Promise<Opcional[]> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("opcionais").select("id, nome").order("ordem").order("nome");
  return data ?? [];
}

/** Etiquetas escritas no painel, na ordem em que foram criadas. */
export async function listarEtiquetas(): Promise<Opcional[]> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("etiquetas_personalizadas").select("id, nome").order("created_at");
  return data ?? [];
}

/** Selos escritos no painel, na ordem em que foram criados. */
export async function listarSelos(): Promise<Opcional[]> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("selos_personalizados").select("id, nome").order("created_at");
  return data ?? [];
}

/** Modelos já cadastrados por marca (sugestões do campo Modelo, dúvida 6). */
export async function modelosPorMarca(): Promise<Record<string, string[]>> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("veiculos").select("marca, modelo");
  const mapa: Record<string, Set<string>> = {};
  for (const v of data ?? []) (mapa[v.marca] ??= new Set()).add(v.modelo);
  return Object.fromEntries(Object.entries(mapa).map(([m, s]) => [m, [...s].sort((a, b) => a.localeCompare(b, "pt-BR"))]));
}
