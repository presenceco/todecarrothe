import "server-only";
import { mascararCpf, formatarCpf } from "@/lib/cpf";
import { anoFabModelo, dataHora, km, moeda, telefone } from "@/lib/formato";
import { STATUS_SIMULACAO, type StatusSimulacao } from "@/lib/status";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import { POR_PAGINA, termoBusca, type FiltrosLista } from "./filtros";
import { exigirAdmin } from "./sessao";

export const STATUS_SIMULACOES = Object.keys(STATUS_SIMULACAO) as StatusSimulacao[];

/** Veículo da simulação: o atual do estoque (se ainda existir) e o retrato gravado no envio. */
export type VeiculoSimulacao = {
  /** Nome e preço do momento do envio (o veículo pode ter mudado ou sido excluído). */
  nome: string;
  preco: number;
  marca: string | null;
  modeloVersao: string | null;
  marcaModelo: string | null;
  anoKm: string | null;
  capa: string | null;
};

export type Simulacao = {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  renda: number;
  entrada: number;
  prazo: number;
  temTroca: boolean;
  trocaModelo: string | null;
  trocaAno: number | null;
  possuiCnh: boolean;
  consentimento: boolean;
  status: StatusSimulacao;
  criadoEm: string;
  veiculo: VeiculoSimulacao | null;
  valorAproximado: number | null;
};

const CAMPOS =
  "id, nome, cpf, nascimento, whatsapp, renda, entrada, prazo_meses, tem_troca, troca_modelo, troca_ano, possui_cnh, consentimento_em, status, created_at, veiculo_nome, veiculo_preco, valor_aproximado, veiculos (marca, modelo, versao, ano_fabricacao, ano_modelo, km, veiculo_fotos (path, ordem))";

type Linha = {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  renda: number;
  entrada: number;
  prazo_meses: number;
  tem_troca: boolean;
  troca_modelo: string | null;
  troca_ano: number | null;
  possui_cnh: boolean;
  consentimento_em: string | null;
  status: string;
  created_at: string;
  veiculo_nome: string | null;
  veiculo_preco: number | null;
  valor_aproximado: number | null;
  veiculos: {
    marca: string;
    modelo: string;
    versao: string;
    ano_fabricacao: number;
    ano_modelo: number;
    km: number;
    veiculo_fotos: { path: string; ordem: number }[];
  } | null;
};

function paraSimulacao(l: Linha): Simulacao {
  const v = l.veiculos;
  const capa = v?.veiculo_fotos.length ? [...v.veiculo_fotos].sort((a, b) => a.ordem - b.ordem)[0].path : null;
  return {
    id: l.id,
    nome: l.nome,
    cpf: l.cpf,
    nascimento: l.nascimento,
    whatsapp: l.whatsapp,
    renda: Number(l.renda),
    entrada: Number(l.entrada),
    prazo: l.prazo_meses,
    temTroca: l.tem_troca,
    trocaModelo: l.troca_modelo,
    trocaAno: l.troca_ano,
    possuiCnh: l.possui_cnh,
    consentimento: !!l.consentimento_em,
    status: l.status as StatusSimulacao,
    criadoEm: l.created_at,
    valorAproximado: l.valor_aproximado === null ? null : Number(l.valor_aproximado),
    veiculo:
      l.veiculo_nome && l.veiculo_preco !== null
        ? {
            nome: l.veiculo_nome,
            preco: Number(l.veiculo_preco),
            marca: v?.marca ?? null,
            modeloVersao: v ? [v.modelo, v.versao].filter(Boolean).join(" ") : null,
            marcaModelo: v ? `${v.marca} ${v.modelo}` : null,
            anoKm: v ? `${anoFabModelo(v.ano_fabricacao, v.ano_modelo)} · ${km(v.km)}` : null,
            capa: capa ? urlFotoVeiculo(capa) : null,
          }
        : null,
  };
}

/** "1991-03-12" → "12/03/1991" (data pura, sem fuso). */
export const dataNascimento = (iso: string) => iso.split("-").reverse().join("/");

function aplicarBusca<T extends { or: (filtro: string) => T }>(consulta: T, q: string) {
  const termo = termoBusca(q);
  if (!termo) return consulta;
  let c = consulta;
  for (const palavra of termo.split(" ").slice(0, 5)) {
    const numeros = palavra.replace(/\D/g, "");
    const fone = numeros.length >= 3 ? `,whatsapp.ilike.%${numeros}%` : "";
    c = c.or(`nome.ilike.%${palavra}%,veiculo_nome.ilike.%${palavra}%${fone}`);
  }
  return c;
}

/** Simulações (18/31): mais recentes primeiro, com busca por cliente ou veículo, status e contagens. */
export async function listarSimulacoes(f: FiltrosLista<StatusSimulacao>) {
  const { supabase } = await exigirAdmin();
  const inicio = (f.pagina - 1) * POR_PAGINA;
  let lista = supabase.from("simulacoes").select(CAMPOS, { count: "exact" }).order("created_at", { ascending: false }).range(inicio, inicio + POR_PAGINA - 1);
  if (f.status) lista = lista.eq("status", f.status);
  lista = aplicarBusca(lista, f.q);
  const contar = (status?: StatusSimulacao) => {
    let c = supabase.from("simulacoes").select("id", { count: "exact", head: true });
    if (status) c = c.eq("status", status);
    return aplicarBusca(c, f.q);
  };
  const [res, todos, ...porStatus] = await Promise.all([lista, contar(), ...STATUS_SIMULACOES.map((s) => contar(s))]);
  // Página além da última (link antigo): lista vazia em vez de erro; a paginação mostra o intervalo certo.
  if (res.error && res.error.code !== "PGRST103") throw new Error(`Falha ao ler as simulações: ${res.error.message}`);
  const contagens = Object.fromEntries(STATUS_SIMULACOES.map((s, i) => [s, porStatus[i].count ?? 0])) as Record<StatusSimulacao, number>;
  return { linhas: ((res.data ?? []) as unknown as Linha[]).map(paraSimulacao), total: res.count ?? 0, contagens: { todos: todos.count ?? 0, ...contagens } };
}

export async function obterSimulacao(id: string): Promise<Simulacao | null> {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("simulacoes").select(CAMPOS).eq("id", id).maybeSingle();
  return data ? paraSimulacao(data as unknown as Linha) : null;
}

export const cpfMascarado = (cpf: string) => mascararCpf(cpf);

/** "Copiar dados": inclui o CPF completo, que a loja precisa para simular com os bancos (item 5 da seção 9). */
export function textoSimulacao(s: Simulacao) {
  return [
    "Simulação de financiamento · Tô de Carro",
    `Recebida em ${dataHora(s.criadoEm)}`,
    `Status: ${STATUS_SIMULACAO[s.status].rotulo}`,
    "",
    s.veiculo ? `Veículo: ${s.veiculo.nome} (${moeda(s.veiculo.preco)})` : `Sem veículo escolhido · valor aproximado: ${moeda(s.valorAproximado ?? 0)}`,
    "",
    `Nome: ${s.nome}`,
    `CPF: ${formatarCpf(s.cpf)}`,
    `Nascimento: ${dataNascimento(s.nascimento)}`,
    `WhatsApp: ${telefone(s.whatsapp)}`,
    `Renda mensal: ${moeda(s.renda)}`,
    `Possui CNH: ${s.possuiCnh ? "Sim" : "Não"}`,
    "",
    `Entrada: ${moeda(s.entrada)}`,
    `Prazo: ${s.prazo} meses`,
    `Troca: ${s.temTroca ? `Sim, ${s.trocaModelo ?? ""}${s.trocaAno ? ` ${s.trocaAno}` : ""}`.trim() : "Não"}`,
    "",
    s.consentimento ? "Autorizou o uso dos dados para simulação de crédito." : "",
  ]
    .join("\n")
    .trim();
}
