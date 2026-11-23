/**
 * Regras do servidor MCP sobre o estoque: busca, resumo do estoque e o formato dos veículos nas respostas.
 * Funções puras (sem banco): recebem os veículos já lidos do Supabase.
 *
 * As respostas usam nomes em português e valores prontos para o agente repetir ao cliente
 * ("R$ 129.900", "2022/2023", "38.000 km"), além dos números puros para comparar.
 */
import { aplicarFiltros, FILTROS_VAZIOS, type Ordem } from "@/lib/catalogo/filtros";
import { urlVeiculo } from "@/lib/catalogo/interesse";
import { anoFabModelo, km as textoKm, moeda } from "@/lib/formato";
import { ETIQUETAS } from "@/lib/status";
import {
  ROTULO_CAMBIO,
  ROTULO_COMBUSTIVEL,
  ROTULO_TIPO,
  SELOS,
  type Cambio,
  type Combustivel,
  type TipoCarroceria,
  type VeiculoCatalogo,
  type VeiculoDetalhe,
} from "@/lib/tipos";

export type Busca = {
  texto?: string;
  marca?: string;
  modelo?: string;
  versao?: string;
  categoria?: TipoCarroceria;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  kmMax?: number;
  cambio?: Cambio;
  combustivel?: Combustivel;
  ordem?: Ordem;
};

/** Sem acento, minúsculas e espaços simples ("Sedã " → "seda"). */
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.,]+/g, " ")
    .trim();
}

/** Como o cliente costuma escrever a marca → como ela está cadastrada. */
const APELIDOS_MARCA: Record<string, string> = {
  vw: "volkswagen",
  gm: "chevrolet",
  chevy: "chevrolet",
};

const contem = (campo: string, procurado: string) => normalizar(campo).includes(procurado);

/** Busca no estoque: os filtros numéricos reaproveitam os do catálogo; marca, modelo e versão aceitam parte do nome. */
export function buscar(veiculos: readonly VeiculoCatalogo[], b: Busca) {
  const filtrados = aplicarFiltros(veiculos, {
    ...FILTROS_VAZIOS,
    precoMin: b.precoMin ?? null,
    precoMax: b.precoMax ?? null,
    anoDe: b.anoMin ?? null,
    anoAte: b.anoMax ?? null,
    kmMax: b.kmMax ?? null,
    cambio: b.cambio ?? null,
    combustiveis: b.combustivel ? [b.combustivel] : [],
    tipos: b.categoria ? [b.categoria] : [],
    ordem: b.ordem ?? "recentes",
  });

  const marca = b.marca ? normalizar(b.marca) : "";
  const marcaProcurada = APELIDOS_MARCA[marca] ?? marca;
  const modelo = b.modelo ? normalizar(b.modelo) : "";
  const versao = b.versao ? normalizar(b.versao) : "";
  const termos = b.texto ? normalizar(b.texto).split(" ").filter(Boolean) : [];

  return filtrados.filter((v) => {
    if (marcaProcurada && !contem(v.marca, marcaProcurada)) return false;
    if (modelo && !contem(v.modelo, modelo)) return false;
    if (versao && !contem(v.versao, versao)) return false;
    if (termos.length) {
      const nome = normalizar(`${v.marca} ${v.modelo} ${v.versao}`);
      if (!termos.every((t) => nome.includes(t))) return false;
    }
    return true;
  });
}

/**
 * Motorização a partir do nome da versão ("XEi 2.0 Flex" → "2.0"; "Highline 1.0 TSI" → "1.0 turbo").
 * O cadastro não tem um campo próprio para o motor: quando a versão não traz a cilindrada, devolve null.
 */
export function motorizacao(versao: string) {
  const cilindrada = versao.match(/(?<![\d.,])(\d)[.,](\d)(?![\d.,])/);
  if (!cilindrada) return null;
  const turbo = /turbo|\btsi\b|\btfsi\b|\bthp\b|\btb\b|ecoboost/i.test(versao);
  return `${cilindrada[1]}.${cilindrada[2]}${turbo ? " turbo" : ""}`;
}

/**
 * Identificador do veículo vindo do agente: o slug ("toyota-corolla-xei-2-0-2023") ou o link do anúncio
 * ("https://www.todecarrothe.com.br/carros/toyota-corolla-xei-2-0-2023"), que o cliente costuma colar no
 * WhatsApp (é o link da mensagem do "Tenho interesse"). Devolve o slug, ou null se não parecer um.
 */
export function slugDe(id: string) {
  const texto = id.trim();
  const doLink = texto.match(/\/carros\/([a-z0-9-]+)/i)?.[1];
  const slug = (doLink ?? texto).toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 140 ? slug : null;
}

function nomeCompleto(v: { marca: string; modelo: string; versao: string }) {
  return [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
}

function textoEtiqueta(v: VeiculoCatalogo) {
  if (v.etiqueta === "personalizada") return v.etiquetaTexto;
  if (v.etiqueta === "nenhuma") return null;
  return ETIQUETAS[v.etiqueta].rotulo;
}

/** Veículo nas listas (busca e estoque). */
export function resumoVeiculo(v: VeiculoCatalogo) {
  return {
    id: v.slug,
    nome: nomeCompleto(v),
    marca: v.marca,
    modelo: v.modelo,
    versao: v.versao,
    ano: anoFabModelo(v.anoFabricacao, v.anoModelo),
    ano_fabricacao: v.anoFabricacao,
    ano_modelo: v.anoModelo,
    km: v.km,
    km_texto: textoKm(v.km),
    cambio: ROTULO_CAMBIO[v.cambio].longo,
    combustivel: ROTULO_COMBUSTIVEL[v.combustivel],
    categoria: ROTULO_TIPO[v.tipo],
    cor: v.cor,
    preco: v.preco,
    preco_texto: moeda(v.preco),
    etiqueta: textoEtiqueta(v),
    foto_capa: v.capa?.src ?? null,
    link: urlVeiculo(v.slug),
  };
}

/** Ficha completa de um veículo. `ano` é o ano corrente (rótulo "IPVA 2026 pago"). */
export function detalheVeiculo(v: VeiculoDetalhe, ano: number) {
  const selos = [
    ...SELOS.filter((s) => v.selos.includes(s.chave)).map((s) => s.rotulo(ano)),
    ...v.selosExtras,
  ];
  return {
    ...resumoVeiculo(v),
    motorizacao: motorizacao(v.versao),
    final_placa: v.finalPlaca || null,
    equipamentos: v.opcionais,
    selos,
    fotos: v.fotos.map((f) => f.src),
    total_fotos: v.fotos.length,
    publicado_em: v.publicadoEm ? new Date(v.publicadoEm).toISOString() : null,
  };
}

/** Visão geral do estoque: contagens por marca e categoria e a faixa de preço. */
export function panoramaEstoque(veiculos: readonly VeiculoCatalogo[]) {
  const porMarca = new Map<string, number>();
  const porCategoria = new Map<string, number>();
  for (const v of veiculos) {
    porMarca.set(v.marca, (porMarca.get(v.marca) ?? 0) + 1);
    const categoria = ROTULO_TIPO[v.tipo];
    porCategoria.set(categoria, (porCategoria.get(categoria) ?? 0) + 1);
  }
  // Da que tem mais carros para a que tem menos; empate em ordem alfabética.
  const ordenar = (mapa: Map<string, number>) => [...mapa].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  const precos = veiculos.map((v) => v.preco);
  return {
    total: veiculos.length,
    marcas: ordenar(porMarca).map(([marca, total]) => ({ marca, total })),
    categorias: ordenar(porCategoria).map(([categoria, total]) => ({ categoria, total })),
    faixa_preco: precos.length
      ? { menor: Math.min(...precos), maior: Math.max(...precos), menor_texto: moeda(Math.min(...precos)), maior_texto: moeda(Math.max(...precos)) }
      : null,
  };
}
