import "server-only";
import { anoFabModelo, dataHora, km, moeda, telefone } from "@/lib/formato";
import { FORMAS_VENDA } from "@/lib/formularios/esquemas";
import type { NomeIcone } from "@/lib/icones";
import { STATUS_CONSIGNACAO, type StatusConsignacao } from "@/lib/status";
import { ROTULO_CAMBIO } from "@/lib/tipos";
import { POR_PAGINA, termoBusca, type FiltrosLista } from "./filtros";
import { exigirAdmin } from "./sessao";

export const STATUS_CONSIGNACOES = Object.keys(STATUS_CONSIGNACAO) as StatusConsignacao[];

export type FormaVenda = "venda_direta" | "troca" | "consignacao";

/** Etiqueta neutra da forma de venda, com ícone (dúvida 11 do plano). */
export const FORMA: Record<FormaVenda, { rotulo: string; icone: NomeIcone }> = {
  venda_direta: { rotulo: FORMAS_VENDA[0].label, icone: "payments" },
  troca: { rotulo: FORMAS_VENDA[1].label, icone: "swap_horiz" },
  consignacao: { rotulo: FORMAS_VENDA[2].label, icone: "handshake" },
};

export type Consignacao = {
  id: string;
  forma: FormaVenda;
  marca: string;
  modelo: string;
  versao: string;
  ano: string;
  km: number;
  cambio: string;
  cor: string;
  quitado: boolean;
  valorPretendido: number | null;
  detalhes: string;
  nome: string;
  whatsapp: string;
  anotacoes: string;
  status: StatusConsignacao;
  criadoEm: string;
  totalFotos: number;
  /** URL assinada (1 hora) da primeira foto: o bucket é privado. */
  capa: string | null;
};

const CAMPOS =
  "id, forma_venda, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, cor, quitado, valor_pretendido, detalhes, nome, whatsapp, anotacoes, status, created_at, consignacao_fotos (path, ordem)";

type Linha = {
  id: string;
  forma_venda: string;
  marca: string;
  modelo: string;
  versao: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  cambio: string;
  cor: string;
  quitado: boolean;
  valor_pretendido: number | null;
  detalhes: string;
  nome: string;
  whatsapp: string;
  anotacoes: string;
  status: string;
  created_at: string;
  consignacao_fotos: { path: string; ordem: number }[];
};

const fotosOrdenadas = (l: Linha) => [...l.consignacao_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => f.path);

function paraConsignacao(l: Linha, capa: string | null): Consignacao {
  return {
    id: l.id,
    forma: l.forma_venda as FormaVenda,
    marca: l.marca,
    modelo: l.modelo,
    versao: l.versao,
    ano: anoFabModelo(l.ano_fabricacao, l.ano_modelo),
    km: l.km,
    cambio: l.cambio,
    cor: l.cor,
    quitado: l.quitado,
    valorPretendido: l.valor_pretendido === null ? null : Number(l.valor_pretendido),
    detalhes: l.detalhes,
    nome: l.nome,
    whatsapp: l.whatsapp,
    anotacoes: l.anotacoes,
    status: l.status as StatusConsignacao,
    criadoEm: l.created_at,
    totalFotos: l.consignacao_fotos.length,
    capa,
  };
}

/** URLs assinadas de leitura (bucket privado), na mesma ordem dos caminhos. */
async function assinar(caminhos: string[]) {
  if (!caminhos.length) return [];
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.storage.from("consignacoes").createSignedUrls(caminhos, 3600);
  const porCaminho = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return caminhos.map((c) => porCaminho.get(c) ?? null);
}

function aplicarBusca<T extends { or: (filtro: string) => T }>(consulta: T, q: string) {
  const termo = termoBusca(q);
  if (!termo) return consulta;
  let c = consulta;
  for (const palavra of termo.split(" ").slice(0, 5)) {
    const numeros = palavra.replace(/\D/g, "");
    const fone = numeros.length >= 3 ? `,whatsapp.ilike.%${numeros}%` : "";
    c = c.or(`nome.ilike.%${palavra}%,marca.ilike.%${palavra}%,modelo.ilike.%${palavra}%${fone}`);
  }
  return c;
}

/** Consignações (35/38): mais recentes primeiro, com busca, status e contagens das abas. */
export async function listarConsignacoes(f: FiltrosLista<StatusConsignacao>) {
  const { supabase } = await exigirAdmin();
  const inicio = (f.pagina - 1) * POR_PAGINA;
  let lista = supabase.from("consignacoes").select(CAMPOS, { count: "exact" }).order("created_at", { ascending: false }).range(inicio, inicio + POR_PAGINA - 1);
  if (f.status) lista = lista.eq("status", f.status);
  lista = aplicarBusca(lista, f.q);
  const contar = (status?: StatusConsignacao) => {
    let c = supabase.from("consignacoes").select("id", { count: "exact", head: true });
    if (status) c = c.eq("status", status);
    return aplicarBusca(c, f.q);
  };
  const [res, todos, ...porStatus] = await Promise.all([lista, contar(), ...STATUS_CONSIGNACOES.map((s) => contar(s))]);
  // Página além da última (link antigo): lista vazia em vez de erro; a paginação mostra o intervalo certo.
  if (res.error && res.error.code !== "PGRST103") throw new Error(`Falha ao ler as consignações: ${res.error.message}`);
  const linhas = (res.data ?? []) as Linha[];
  const capas = await assinar(linhas.map((l) => fotosOrdenadas(l)[0]).filter(Boolean));
  let i = 0;
  const contagens = Object.fromEntries(STATUS_CONSIGNACOES.map((s, k) => [s, porStatus[k].count ?? 0])) as Record<StatusConsignacao, number>;
  return {
    linhas: linhas.map((l) => paraConsignacao(l, fotosOrdenadas(l)[0] ? (capas[i++] ?? null) : null)),
    total: res.count ?? 0,
    contagens: { todos: todos.count ?? 0, ...contagens },
  };
}

/** Consignação com todas as fotos (URLs assinadas) e o veículo cadastrado a partir dela, se houver. */
export async function obterConsignacao(id: string) {
  const { supabase } = await exigirAdmin();
  const [{ data }, { data: veiculo }] = await Promise.all([
    supabase.from("consignacoes").select(CAMPOS).eq("id", id).maybeSingle(),
    supabase.from("veiculos").select("id").eq("consignacao_id", id).limit(1).maybeSingle(),
  ]);
  if (!data) return null;
  const linha = data as Linha;
  const fotos = (await assinar(fotosOrdenadas(linha))).filter((u): u is string => !!u);
  return { consignacao: paraConsignacao(linha, fotos[0] ?? null), fotos, veiculoId: veiculo?.id ?? null };
}

export const nomeCarro = (c: Consignacao) => `${c.marca} ${c.modelo}`;
export const rotuloCambio = (c: string) => ROTULO_CAMBIO[c as keyof typeof ROTULO_CAMBIO]?.longo ?? c;
export const querReceber = (c: Consignacao) => (c.valorPretendido ? moeda(c.valorPretendido) : "Não informado");

/** Texto do "Copiar dados". */
export function textoConsignacao(c: Consignacao) {
  return [
    "Venda seu carro · Tô de Carro",
    `Recebida em ${dataHora(c.criadoEm)}`,
    `Status: ${STATUS_CONSIGNACAO[c.status].rotulo}`,
    `Forma de venda: ${FORMA[c.forma].rotulo}`,
    "",
    `Carro: ${[c.marca, c.modelo, c.versao].filter(Boolean).join(" ")}`,
    `Ano: ${c.ano}`,
    `Quilometragem: ${km(c.km)}`,
    `Câmbio: ${rotuloCambio(c.cambio)}`,
    `Cor: ${c.cor}`,
    `Quitado: ${c.quitado ? "Sim" : "Não"}`,
    `Quer receber: ${querReceber(c)}`,
    ...(c.detalhes.trim() ? [`Detalhes: ${c.detalhes.trim()}`] : []),
    `Fotos enviadas: ${c.totalFotos}`,
    "",
    `Nome: ${c.nome}`,
    `WhatsApp: ${telefone(c.whatsapp)}`,
    ...(c.anotacoes.trim() ? ["", `Anotações da loja: ${c.anotacoes.trim()}`] : []),
  ].join("\n");
}
