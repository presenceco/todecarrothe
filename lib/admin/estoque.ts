import "server-only";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import type { StatusVeiculo } from "@/lib/status";
import { POR_PAGINA, termoBusca, type FiltrosLista } from "./filtros";
import { exigirAdmin } from "./sessao";

export const STATUS_ESTOQUE = ["disponivel", "reservado", "vendido"] as const satisfies readonly StatusVeiculo[];

export type LinhaEstoque = {
  id: string;
  slug: string;
  marca: string;
  modelo: string;
  versao: string;
  anoFabricacao: number;
  anoModelo: number;
  km: number;
  preco: number;
  status: StatusVeiculo;
  publicado: boolean;
  capa: string | null;
};

/** Busca por marca, modelo, versão e final da placa (dúvida 4 do briefing). Cada palavra precisa bater. */
function aplicarBusca<T extends { or: (filtro: string) => T }>(consulta: T, q: string) {
  const termo = termoBusca(q);
  if (!termo) return consulta;
  let c = consulta;
  for (const palavra of termo.split(" ").slice(0, 5)) {
    const placa = /^\d$/.test(palavra) ? `,final_placa.eq.${palavra}` : "";
    c = c.or(`marca.ilike.%${palavra}%,modelo.ilike.%${palavra}%,versao.ilike.%${palavra}%${placa}`);
  }
  return c;
}

/**
 * Estoque do admin (12/27): todos os veículos, do cadastro mais recente para o mais antigo, com busca,
 * filtro de status e 20 por página (dúvida 5). Também devolve as contagens das abas e do subtítulo.
 */
export async function listarEstoque(f: FiltrosLista<StatusVeiculo>) {
  const { supabase } = await exigirAdmin();
  const contar = (status?: StatusVeiculo, comBusca = true) => {
    let c = supabase.from("veiculos").select("id", { count: "exact", head: true });
    if (status) c = c.eq("status", status);
    return comBusca ? aplicarBusca(c, f.q) : c;
  };

  const inicio = (f.pagina - 1) * POR_PAGINA;
  let lista = supabase
    .from("veiculos")
    .select("id, slug, marca, modelo, versao, ano_fabricacao, ano_modelo, km, preco, status, publicado, veiculo_fotos (path, ordem)", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("ordem", { referencedTable: "veiculo_fotos", ascending: true })
    .limit(1, { referencedTable: "veiculo_fotos" })
    .range(inicio, inicio + POR_PAGINA - 1);
  if (f.status) lista = lista.eq("status", f.status);
  lista = aplicarBusca(lista, f.q);

  const [res, todos, disponivel, reservado, vendido, totalGeral, disponiveisGeral] = await Promise.all([
    lista,
    contar(),
    contar("disponivel"),
    contar("reservado"),
    contar("vendido"),
    f.q ? contar(undefined, false) : null,
    f.q ? contar("disponivel", false) : null,
  ]);
  // Página além da última (link antigo): lista vazia em vez de erro; a paginação mostra o intervalo certo.
  if (res.error && res.error.code !== "PGRST103") throw new Error(`Falha ao ler o estoque: ${res.error.message}`);

  const linhas: LinhaEstoque[] = (res.data ?? []).map((v) => ({
    id: v.id,
    slug: v.slug,
    marca: v.marca,
    modelo: v.modelo,
    versao: v.versao,
    anoFabricacao: v.ano_fabricacao,
    anoModelo: v.ano_modelo,
    km: v.km,
    preco: Number(v.preco),
    status: v.status as StatusVeiculo,
    publicado: v.publicado,
    capa: v.veiculo_fotos[0] ? urlFotoVeiculo(v.veiculo_fotos[0].path) : null,
  }));

  const contagens = { todos: todos.count ?? 0, disponivel: disponivel.count ?? 0, reservado: reservado.count ?? 0, vendido: vendido.count ?? 0 };
  return {
    linhas,
    total: res.count ?? 0,
    contagens,
    geral: { total: totalGeral?.count ?? contagens.todos, disponiveis: disponiveisGeral?.count ?? contagens.disponivel },
  };
}
