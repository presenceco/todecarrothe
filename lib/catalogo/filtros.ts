/**
 * Filtros do catálogo, guardados na URL (o link pode ser compartilhado).
 * Funções puras: rodam no servidor (página) e no navegador (contagem ao vivo do "Ver N veículos").
 *
 *   /?q=corolla&marca=toyota,jeep&preco=50000-150000&ano=2020-2024&cambio=automatico
 *     &km=80000&combustivel=flex&tipo=seda,suv&ordem=menor-preco
 */
import { numeroPreco } from "@/lib/formato";
import { slugificar } from "@/lib/slug";
import {
  ROTULO_CAMBIO,
  ROTULO_COMBUSTIVEL,
  ROTULO_TIPO,
  type Cambio,
  type Combustivel,
  type TipoCarroceria,
  type VeiculoCatalogo,
} from "@/lib/tipos";

export type Ordem = "recentes" | "menor-preco" | "maior-preco" | "menor-km";

export const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
  { valor: "menor-km", rotulo: "Menor km" },
];

/** Faixa do controle de preço (telas 02 e 21): R$ 30 mil a R$ 200 mil+, de 5 em 5 mil. */
export const PRECO = { min: 30000, max: 200000, passo: 5000 } as const;

/** Km máximo: 30 mil / 50 mil / 80 mil / Qualquer. */
export const KM_MAXIMOS = [30000, 50000, 80000] as const;

export const CAMBIOS: Cambio[] = ["automatico", "manual"];
export const COMBUSTIVEIS: Combustivel[] = ["flex", "gasolina", "diesel", "hibrido"];
export const TIPOS: TipoCarroceria[] = ["hatch", "seda", "suv", "picape"];

export type Filtros = {
  q: string;
  /** Slugs de marca ("volkswagen", "mercedes-benz"). */
  marcas: string[];
  precoMin: number | null;
  precoMax: number | null;
  anoDe: number | null;
  anoAte: number | null;
  cambio: Cambio | null;
  kmMax: number | null;
  combustiveis: Combustivel[];
  tipos: TipoCarroceria[];
  ordem: Ordem;
};

export const FILTROS_VAZIOS: Filtros = {
  q: "",
  marcas: [],
  precoMin: null,
  precoMax: null,
  anoDe: null,
  anoAte: null,
  cambio: null,
  kmMax: null,
  combustiveis: [],
  tipos: [],
  ordem: "recentes",
};

type Entrada = URLSearchParams | Record<string, string | string[] | undefined>;

function valor(sp: Entrada, chave: string) {
  const v = sp instanceof URLSearchParams ? sp.get(chave) : sp[chave];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

const lista = (sp: Entrada, chave: string) =>
  valor(sp, chave)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function faixa(sp: Entrada, chave: string, min: number, max: number) {
  const [a = "", b = ""] = valor(sp, chave).split("-");
  const n = (s: string) => (/^\d+$/.test(s) && Number(s) >= min && Number(s) <= max ? Number(s) : null);
  return [n(a), n(b)] as const;
}

export function lerFiltros(sp: Entrada): Filtros {
  const [precoMin, precoMax] = faixa(sp, "preco", PRECO.min, PRECO.max);
  const [anoDe, anoAte] = faixa(sp, "ano", 1950, 2100);
  const km = Number(valor(sp, "km"));
  const cambio = valor(sp, "cambio") as Cambio;
  const ordem = valor(sp, "ordem") as Ordem;
  return {
    q: valor(sp, "q").slice(0, 60),
    marcas: [...new Set(lista(sp, "marca").map(slugificar).filter(Boolean))],
    // Nos extremos do controle não há limite (R$ 30 mil e R$ 200 mil+).
    precoMin: precoMin !== null && precoMin > PRECO.min ? precoMin : null,
    precoMax: precoMax !== null && precoMax < PRECO.max ? precoMax : null,
    anoDe,
    anoAte,
    cambio: CAMBIOS.includes(cambio) ? cambio : null,
    kmMax: (KM_MAXIMOS as readonly number[]).includes(km) ? km : null,
    combustiveis: lista(sp, "combustivel").filter((c): c is Combustivel => COMBUSTIVEIS.includes(c as Combustivel)),
    tipos: lista(sp, "tipo").filter((t): t is TipoCarroceria => TIPOS.includes(t as TipoCarroceria)),
    ordem: ORDENS.some((o) => o.valor === ordem) ? ordem : "recentes",
  };
}

/** Query string canônica (sem "?"); vazia quando não há filtro nem ordenação. */
export function escreverFiltros(f: Filtros) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.marcas.length) p.set("marca", f.marcas.join(","));
  if (f.precoMin !== null || f.precoMax !== null) p.set("preco", `${f.precoMin ?? ""}-${f.precoMax ?? ""}`);
  if (f.anoDe !== null || f.anoAte !== null) p.set("ano", `${f.anoDe ?? ""}-${f.anoAte ?? ""}`);
  if (f.cambio) p.set("cambio", f.cambio);
  if (f.kmMax !== null) p.set("km", String(f.kmMax));
  if (f.combustiveis.length) p.set("combustivel", f.combustiveis.join(","));
  if (f.tipos.length) p.set("tipo", f.tipos.join(","));
  if (f.ordem !== "recentes") p.set("ordem", f.ordem);
  return p.toString().replaceAll("%2C", ",");
}

export function hrefFiltros(f: Filtros) {
  const qs = escreverFiltros(f);
  return qs ? `/?${qs}` : "/";
}

/** Quantos filtros estão ativos (o número no botão de filtros da tela 08). A ordenação não conta. */
export function totalAtivos(f: Filtros) {
  return chipsAtivos(f, new Map()).length;
}

export function temFiltro(f: Filtros) {
  return totalAtivos(f) > 0;
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Aplica os filtros e a ordenação. */
export function aplicarFiltros(veiculos: readonly VeiculoCatalogo[], f: Filtros) {
  const termos = normalizar(f.q).split(/\s+/).filter(Boolean);
  const resultado = veiculos.filter((v) => {
    if (termos.length) {
      const texto = normalizar(`${v.marca} ${v.modelo} ${v.versao}`);
      if (!termos.every((t) => texto.includes(t))) return false;
    }
    if (f.marcas.length && !f.marcas.includes(slugificar(v.marca))) return false;
    if (f.precoMin !== null && v.preco < f.precoMin) return false;
    if (f.precoMax !== null && v.preco > f.precoMax) return false;
    if (f.anoDe !== null && v.anoModelo < f.anoDe) return false;
    if (f.anoAte !== null && v.anoModelo > f.anoAte) return false;
    if (f.cambio && v.cambio !== f.cambio) return false;
    if (f.kmMax !== null && v.km > f.kmMax) return false;
    if (f.combustiveis.length && !f.combustiveis.includes(v.combustivel)) return false;
    if (f.tipos.length && !f.tipos.includes(v.tipo)) return false;
    return true;
  });

  const porData = (a: VeiculoCatalogo, b: VeiculoCatalogo) => b.publicadoEm - a.publicadoEm;
  const ordenadores: Record<Ordem, (a: VeiculoCatalogo, b: VeiculoCatalogo) => number> = {
    recentes: porData,
    "menor-preco": (a, b) => a.preco - b.preco || porData(a, b),
    "maior-preco": (a, b) => b.preco - a.preco || porData(a, b),
    "menor-km": (a, b) => a.km - b.km || porData(a, b),
  };
  return resultado.sort(ordenadores[f.ordem]);
}

/** "R$ 60 mil" */
export function milReais(valor: number) {
  return `R$ ${numeroPreco(valor / 1000)} mil`;
}

/** Texto da faixa de preço ("R$ 50 mil – R$ 150 mil", "Até R$ 60 mil", "R$ 30 mil – R$ 200 mil+"). */
export function rotuloPreco(min: number | null, max: number | null, extremos = false) {
  if (min === null && max === null) return extremos ? `${milReais(PRECO.min)} – ${milReais(PRECO.max)}+` : "";
  if (min === null) return extremos ? `${milReais(PRECO.min)} – ${milReais(max!)}` : `Até ${milReais(max!)}`;
  if (max === null) return extremos ? `${milReais(min)} – ${milReais(PRECO.max)}+` : `A partir de ${milReais(min)}`;
  return `${milReais(min)} – ${milReais(max)}`;
}

export type ChipFiltro = { chave: string; rotulo: string; semEste: Filtros };

/**
 * Filtros ativos como chips removíveis (tela 08: "Jeep", "Até R$ 60 mil", "Manual").
 * `nomesMarca` traduz o slug para o nome exibido; sem ele, usa o slug.
 */
export function chipsAtivos(f: Filtros, nomesMarca: ReadonlyMap<string, string>): ChipFiltro[] {
  const chips: ChipFiltro[] = [];
  if (f.q) chips.push({ chave: "q", rotulo: `“${f.q}”`, semEste: { ...f, q: "" } });
  for (const m of f.marcas) {
    chips.push({ chave: `marca:${m}`, rotulo: nomesMarca.get(m) ?? m, semEste: { ...f, marcas: f.marcas.filter((x) => x !== m) } });
  }
  if (f.precoMin !== null || f.precoMax !== null) {
    chips.push({ chave: "preco", rotulo: rotuloPreco(f.precoMin, f.precoMax), semEste: { ...f, precoMin: null, precoMax: null } });
  }
  if (f.anoDe !== null || f.anoAte !== null) {
    const rotulo =
      f.anoDe !== null && f.anoAte !== null
        ? f.anoDe === f.anoAte
          ? String(f.anoDe)
          : `${f.anoDe} a ${f.anoAte}`
        : f.anoDe !== null
          ? `A partir de ${f.anoDe}`
          : `Até ${f.anoAte}`;
    chips.push({ chave: "ano", rotulo, semEste: { ...f, anoDe: null, anoAte: null } });
  }
  if (f.cambio) chips.push({ chave: "cambio", rotulo: ROTULO_CAMBIO[f.cambio].longo, semEste: { ...f, cambio: null } });
  if (f.kmMax !== null) chips.push({ chave: "km", rotulo: `Até ${numeroPreco(f.kmMax / 1000)} mil km`, semEste: { ...f, kmMax: null } });
  for (const c of f.combustiveis) {
    chips.push({ chave: `combustivel:${c}`, rotulo: ROTULO_COMBUSTIVEL[c], semEste: { ...f, combustiveis: f.combustiveis.filter((x) => x !== c) } });
  }
  for (const t of f.tipos) {
    chips.push({ chave: `tipo:${t}`, rotulo: ROTULO_TIPO[t], semEste: { ...f, tipos: f.tipos.filter((x) => x !== t) } });
  }
  return chips;
}

/** Marcas presentes no catálogo, com a contagem (a contagem é calculada, não fixa). */
export function contarMarcas(veiculos: readonly VeiculoCatalogo[], comparar: (a: string, b: string) => number) {
  const mapa = new Map<string, { slug: string; nome: string; total: number }>();
  for (const v of veiculos) {
    const slug = slugificar(v.marca);
    const atual = mapa.get(slug);
    if (atual) atual.total++;
    else mapa.set(slug, { slug, nome: v.marca, total: 1 });
  }
  return [...mapa.values()].sort((a, b) => comparar(a.nome, b.nome));
}

/** Liga/desliga um valor numa lista (chips de várias escolhas). */
export function alternar<T>(lista: readonly T[], item: T) {
  return lista.includes(item) ? lista.filter((x) => x !== item) : [...lista, item];
}

/** Atributos que a contagem ao vivo precisa (vão para o navegador; sem fotos nem textos longos). */
export type AtributosFiltro = Pick<
  VeiculoCatalogo,
  "marca" | "modelo" | "versao" | "preco" | "anoModelo" | "cambio" | "km" | "combustivel" | "tipo" | "publicadoEm"
>;

export function atributosFiltro(veiculos: readonly VeiculoCatalogo[]): AtributosFiltro[] {
  return veiculos.map(({ marca, modelo, versao, preco, anoModelo, cambio, km, combustivel, tipo, publicadoEm }) => ({
    marca,
    modelo,
    versao,
    preco,
    anoModelo,
    cambio,
    km,
    combustivel,
    tipo,
    publicadoEm,
  }));
}

/** Contagem dos resultados com base só nos atributos (navegador). */
export function contarResultados(atributos: readonly AtributosFiltro[], f: Filtros) {
  return aplicarFiltros(atributos as VeiculoCatalogo[], f).length;
}
