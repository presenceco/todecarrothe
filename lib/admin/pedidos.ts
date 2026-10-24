import "server-only";
import { dataHora, moeda, telefone } from "@/lib/formato";
import { FAIXAS_PRECO } from "@/lib/formularios/esquemas";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/status";
import { POR_PAGINA, termoBusca, type FiltrosLista } from "./filtros";
import { exigirAdmin } from "./sessao";

export const STATUS_PEDIDOS = Object.keys(STATUS_PEDIDO) as StatusPedido[];

export type Pedido = {
  id: string;
  nome: string;
  whatsapp: string;
  marcaModelo: string;
  anoMinimo: number;
  faixa: string;
  pagamento: "a_vista" | "financiado";
  /** Só no financiado (opcionais): quantidade de parcelas, entrada e valor de parcela que busca. */
  prazo: number | null;
  entrada: number | null;
  parcela: number | null;
  temTroca: boolean;
  trocaModelo: string | null;
  trocaAno: number | null;
  anotacoes: string;
  status: StatusPedido;
  criadoEm: string;
};

const CAMPOS = "id, nome, whatsapp, marca_modelo, ano_minimo, faixa_preco, pagamento, prazo_meses, entrada, parcela_desejada, tem_troca, troca_modelo, troca_ano, anotacoes, status, created_at";

type Linha = {
  id: string;
  nome: string;
  whatsapp: string;
  marca_modelo: string;
  ano_minimo: number;
  faixa_preco: string;
  pagamento: string;
  prazo_meses: number | null;
  entrada: number | null;
  parcela_desejada: number | null;
  tem_troca: boolean;
  troca_modelo: string | null;
  troca_ano: number | null;
  anotacoes: string;
  status: string;
  created_at: string;
};

function paraPedido(l: Linha): Pedido {
  return {
    id: l.id,
    nome: l.nome,
    whatsapp: l.whatsapp,
    marcaModelo: l.marca_modelo,
    anoMinimo: l.ano_minimo,
    faixa: l.faixa_preco,
    pagamento: l.pagamento as Pedido["pagamento"],
    prazo: l.prazo_meses,
    entrada: l.entrada === null ? null : Number(l.entrada),
    parcela: l.parcela_desejada === null ? null : Number(l.parcela_desejada),
    temTroca: l.tem_troca,
    trocaModelo: l.troca_modelo,
    trocaAno: l.troca_ano,
    anotacoes: l.anotacoes,
    status: l.status as StatusPedido,
    criadoEm: l.created_at,
  };
}

/** Faixa como no formulário e no detalhe ("R$ 150 a 200 mil"). */
export const rotuloFaixa = (f: string) => FAIXAS_PRECO.find((x) => x.value === f)?.label ?? f;
/** Faixa curta do cartão mobile (16): "R$ 150–200 mil". */
export const rotuloFaixaCurta = (f: string) => rotuloFaixa(f).replace(/R\$ (\d+) a (\d+) mil/, "R$ $1–$2 mil");
export const rotuloPagamento = (p: string) => (p === "a_vista" ? "À vista" : "Financiado");

/** Busca por nome, carro ou WhatsApp (só dígitos). Cada palavra precisa bater. */
function aplicarBusca<T extends { or: (filtro: string) => T }>(consulta: T, q: string) {
  const termo = termoBusca(q);
  if (!termo) return consulta;
  let c = consulta;
  for (const palavra of termo.split(" ").slice(0, 5)) {
    const numeros = palavra.replace(/\D/g, "");
    const fone = numeros.length >= 3 ? `,whatsapp.ilike.%${numeros}%` : "";
    c = c.or(`nome.ilike.%${palavra}%,marca_modelo.ilike.%${palavra}%${fone}`);
  }
  return c;
}

/** Pedidos de busca (16/29): mais recentes primeiro, com busca, status e contagens das abas. */
export async function listarPedidos(f: FiltrosLista<StatusPedido>) {
  const { supabase } = await exigirAdmin();
  const inicio = (f.pagina - 1) * POR_PAGINA;
  let lista = supabase.from("pedidos_busca").select(CAMPOS, { count: "exact" }).order("created_at", { ascending: false }).range(inicio, inicio + POR_PAGINA - 1);
  if (f.status) lista = lista.eq("status", f.status);
  lista = aplicarBusca(lista, f.q);
  const contar = (status?: StatusPedido) => {
    let c = supabase.from("pedidos_busca").select("id", { count: "exact", head: true });
    if (status) c = c.eq("status", status);
    return aplicarBusca(c, f.q);
  };
  const [res, todos, ...porStatus] = await Promise.all([lista, contar(), ...STATUS_PEDIDOS.map((s) => contar(s))]);
  // Página além da última (link antigo): lista vazia em vez de erro; a paginação mostra o intervalo certo.
  if (res.error && res.error.code !== "PGRST103") throw new Error(`Falha ao ler os pedidos: ${res.error.message}`);
  const contagens = Object.fromEntries(STATUS_PEDIDOS.map((s, i) => [s, porStatus[i].count ?? 0])) as Record<StatusPedido, number>;
  return { linhas: (res.data ?? []).map(paraPedido), total: res.count ?? 0, contagens: { todos: todos.count ?? 0, ...contagens } };
}

/** Pedido com as fotos do carro de entrada (URLs assinadas de 1 hora: o bucket "trocas" é privado). */
export async function obterPedido(id: string): Promise<(Pedido & { fotos: string[] }) | null> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("pedidos_busca").select(`${CAMPOS}, pedido_fotos (path, ordem)`).eq("id", id).maybeSingle();
  if (!data) return null;
  const caminhos = [...data.pedido_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => f.path);
  const { data: assinadas } = caminhos.length ? await supabase.storage.from("trocas").createSignedUrls(caminhos, 3600) : { data: [] };
  const fotos = (assinadas ?? []).map((a) => a.signedUrl).filter((u): u is string => !!u);
  return { ...paraPedido(data), fotos };
}

/** Texto do "Copiar dados" (todos os dados do pedido). */
export function textoPedido(p: Pedido & { fotos?: string[] }) {
  return [
    "Pedido de busca · Tô de Carro",
    `Recebido em ${dataHora(p.criadoEm)}`,
    `Status: ${STATUS_PEDIDO[p.status].rotulo}`,
    "",
    `Nome: ${p.nome}`,
    `WhatsApp: ${telefone(p.whatsapp)}`,
    "",
    `Carro desejado: ${p.marcaModelo}`,
    `Ano mínimo: ${p.anoMinimo}`,
    `Faixa de preço: ${rotuloFaixa(p.faixa)}`,
    `Pagamento: ${rotuloPagamento(p.pagamento)}`,
    ...(p.pagamento === "financiado"
      ? [
          `Parcelas: ${p.prazo ? `${p.prazo}x` : "não informado"}`,
          `Entrada: ${p.entrada ? moeda(p.entrada) : "não informada"}`,
          `Valor da parcela: ${p.parcela ? moeda(p.parcela) : "não informado"}`,
        ]
      : []),
    `Troca: ${p.temTroca ? `Sim, ${p.trocaModelo ?? ""}${p.trocaAno ? ` ${p.trocaAno}` : ""}`.trim() : "Não"}`,
    ...(p.temTroca && p.fotos ? [`Fotos do carro de entrada: ${p.fotos.length}`] : []),
    ...(p.anotacoes.trim() ? ["", `Anotações da loja: ${p.anotacoes.trim()}`] : []),
  ].join("\n");
}
