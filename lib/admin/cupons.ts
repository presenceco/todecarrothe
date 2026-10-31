import "server-only";
import { siteUrl } from "@/lib/env";
import { STATUS_CONSIGNACAO, STATUS_PEDIDO, STATUS_SIMULACAO } from "@/lib/status";
import { POR_PAGINA, termoBusca, type FiltrosLista } from "./filtros";
import { exigirAdmin } from "./sessao";

export const STATUS_CUPONS = ["ativo", "inativo"] as const;
export type StatusCupom = (typeof STATUS_CUPONS)[number];

export type Cupom = {
  id: string;
  codigo: string;
  indicadorNome: string;
  indicadorWhatsapp: string | null;
  observacao: string;
  ativo: boolean;
  totais: { simulacoes: number; pedidos: number; consignacoes: number; cliques: number };
  ultimoUso: string | null;
};

/** Contato indicado por um cupom, no detalhe do cupom. */
export type ContatoIndicado = { id: string; tipo: string; nome: string; criadoEm: string; status: string; href: string };

type LinhaResumo = {
  id: string | null;
  codigo: string | null;
  indicador_nome: string | null;
  indicador_whatsapp: string | null;
  observacao: string | null;
  ativo: boolean | null;
  total_simulacoes: number | null;
  total_pedidos: number | null;
  total_consignacoes: number | null;
  total_cliques: number | null;
  ultimo_uso: string | null;
};

function paraCupom(l: LinhaResumo): Cupom {
  return {
    id: l.id ?? "",
    codigo: l.codigo ?? "",
    indicadorNome: l.indicador_nome ?? "",
    indicadorWhatsapp: l.indicador_whatsapp,
    observacao: l.observacao ?? "",
    ativo: l.ativo ?? false,
    totais: { simulacoes: l.total_simulacoes ?? 0, pedidos: l.total_pedidos ?? 0, consignacoes: l.total_consignacoes ?? 0, cliques: l.total_cliques ?? 0 },
    ultimoUso: l.ultimo_uso,
  };
}

/** Usado = tem contato ou clique ligado a ele. Cupom usado não pode ser excluído nem trocar de código. */
export const cupomUsado = (c: Cupom) => c.totais.simulacoes + c.totais.pedidos + c.totais.consignacoes + c.totais.cliques > 0;

/** Link de indicação pronto para enviar. */
export const linkIndicacao = (codigo: string) => `${siteUrl}/?cupom=${codigo}`;

/** Busca por código ou nome do indicador. Cada palavra precisa bater. */
function aplicarBusca<T extends { or: (filtro: string) => T }>(consulta: T, q: string) {
  const termo = termoBusca(q);
  if (!termo) return consulta;
  let c = consulta;
  for (const palavra of termo.split(" ").slice(0, 5)) c = c.or(`codigo.ilike.%${palavra}%,indicador_nome.ilike.%${palavra}%`);
  return c;
}

/** Cupons de indicação: mais recentes primeiro, com busca, situação e os totais de uso. */
export async function listarCupons(f: FiltrosLista<StatusCupom>) {
  const { supabase } = await exigirAdmin();
  const inicio = (f.pagina - 1) * POR_PAGINA;
  let lista = supabase.from("cupons_resumo").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(inicio, inicio + POR_PAGINA - 1);
  if (f.status) lista = lista.eq("ativo", f.status === "ativo");
  lista = aplicarBusca(lista, f.q);
  const contar = (ativo?: boolean) => {
    let c = supabase.from("cupons").select("id", { count: "exact", head: true });
    if (ativo !== undefined) c = c.eq("ativo", ativo);
    return aplicarBusca(c, f.q);
  };
  const [res, todos, ativos, inativos] = await Promise.all([lista, contar(), contar(true), contar(false)]);
  // Página além da última (link antigo): lista vazia em vez de erro; a paginação mostra o intervalo certo.
  if (res.error && res.error.code !== "PGRST103") throw new Error(`Falha ao ler os cupons: ${res.error.message}`);
  return {
    linhas: (res.data ?? []).map(paraCupom),
    total: res.count ?? 0,
    contagens: { todos: todos.count ?? 0, ativo: ativos.count ?? 0, inativo: inativos.count ?? 0 },
  };
}

/** Cupom com os contatos indicados e os cliques no WhatsApp por carro. */
export async function obterCupom(id: string) {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("cupons_resumo").select("*").eq("id", id).maybeSingle();
  if (!data) return null;

  const campos = "id, nome, status, created_at";
  const [simulacoes, pedidos, consignacoes, cliques] = await Promise.all([
    supabase.from("simulacoes").select(campos).eq("cupom_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("pedidos_busca").select(campos).eq("cupom_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("consignacoes").select(campos).eq("cupom_id", id).order("created_at", { ascending: false }).limit(200),
    supabase.from("cupom_cliques").select("veiculo_nome").eq("cupom_id", id).limit(5000),
  ]);

  const contatos: ContatoIndicado[] = [
    ...(simulacoes.data ?? []).map((c) => ({ id: c.id, tipo: "Simulação", nome: c.nome, criadoEm: c.created_at, status: STATUS_SIMULACAO[c.status as keyof typeof STATUS_SIMULACAO]?.rotulo ?? c.status, href: `/admin/simulacoes/${c.id}` })),
    ...(pedidos.data ?? []).map((c) => ({ id: c.id, tipo: "Pedido", nome: c.nome, criadoEm: c.created_at, status: STATUS_PEDIDO[c.status as keyof typeof STATUS_PEDIDO]?.rotulo ?? c.status, href: `/admin/pedidos/${c.id}` })),
    ...(consignacoes.data ?? []).map((c) => ({ id: c.id, tipo: "Consignação", nome: c.nome, criadoEm: c.created_at, status: STATUS_CONSIGNACAO[c.status as keyof typeof STATUS_CONSIGNACAO]?.rotulo ?? c.status, href: `/admin/consignacoes/${c.id}` })),
  ].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  const porCarro = new Map<string, number>();
  for (const c of cliques.data ?? []) {
    const nome = c.veiculo_nome ?? "Carro não identificado";
    porCarro.set(nome, (porCarro.get(nome) ?? 0) + 1);
  }
  const cliquesPorCarro = [...porCarro].map(([carro, total]) => ({ carro, total })).sort((a, b) => b.total - a.total || a.carro.localeCompare(b.carro, "pt-BR"));

  return { cupom: paraCupom(data), contatos, cliquesPorCarro };
}
