/** Filtros das listas do admin (na URL: ?q=&status=&pagina=&indicacao=1), lidos de forma tolerante. */

export const POR_PAGINA = 20;

export type FiltrosLista<S extends string> = {
  q: string;
  status: S | null;
  pagina: number;
  /** Só contatos que vieram com cupom de indicação (simulações, pedidos e consignações). */
  indicacao?: boolean;
};

type Params = Record<string, string | string[] | undefined>;

export function lerFiltrosLista<S extends string>(sp: Params, validos: readonly S[]): FiltrosLista<S> {
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const status = typeof sp.status === "string" && (validos as readonly string[]).includes(sp.status) ? (sp.status as S) : null;
  const pagina = typeof sp.pagina === "string" && /^\d{1,4}$/.test(sp.pagina) ? Math.max(1, Number(sp.pagina)) : 1;
  return { q, status, pagina, indicacao: sp.indicacao === "1" };
}

/** URL da lista com os filtros trocados (a página volta para 1 quando o filtro muda). */
export function hrefLista(base: string, atual: FiltrosLista<string>, troca: Partial<FiltrosLista<string>>) {
  const f = { ...atual, ...troca };
  if (troca.q !== undefined || troca.status !== undefined || troca.indicacao !== undefined) f.pagina = troca.pagina ?? 1;
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.status) p.set("status", f.status);
  if (f.indicacao) p.set("indicacao", "1");
  if (f.pagina > 1) p.set("pagina", String(f.pagina));
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/**
 * Termo de busca seguro para o filtro `or` do PostgREST: sem vírgulas, parênteses, aspas ou curingas
 * que mudariam a expressão. Devolve null quando não sobra nada.
 */
export function termoBusca(q: string) {
  const limpo = q.replace(/[,()"'\\%*_.:]/g, " ").replace(/\s+/g, " ").trim();
  return limpo || null;
}
