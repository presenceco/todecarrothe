/** Formatação no padrão das telas. Fuso da loja: Teresina (UTC−3, sem horário de verão). */

const FUSO = "America/Fortaleza";

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const centavos = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 129900 → "129.900"; 249990.5 → "249.990,50" (o "R$" é desenhado à parte, menor, como nas telas). */
export function numeroPreco(valor: number) {
  return Number.isInteger(valor) ? inteiro.format(valor) : centavos.format(valor);
}

/** 129900 → "R$ 129.900"; 9500.5 → "R$ 9.500,50". Centavos só aparecem quando existem. */
export function moeda(valor: number) {
  return `R$ ${Number.isInteger(valor) ? inteiro.format(valor) : centavos.format(valor)}`;
}

/** 38000 → "38.000 km" */
export function km(valor: number) {
  return `${inteiro.format(valor)} km`;
}

/** (2022, 2023) → "2022/2023" */
export function anoFabModelo(fabricacao: number, modelo: number) {
  return `${fabricacao}/${modelo}`;
}

/** "17/10" */
export function diaMes(data: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: FUSO }).format(new Date(data));
}

/** "09:40" */
export function hora(data: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO }).format(new Date(data));
}

/** "17/10/2026 às 09:40" */
export function dataHora(data: Date | string) {
  const d = new Date(data);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: FUSO }).format(d);
  return `${dia} às ${hora(d)}`;
}

/** Ano corrente no fuso da loja (selo "IPVA {ano} pago", rodapé "© {ano}"). */
export function anoAtual() {
  return Number(new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: FUSO }).format(new Date()));
}

const grafemas = new Intl.Segmenter("pt-BR", { granularity: "grapheme" });

/** Primeiro caractere visível (não parte um emoji ou uma letra acentuada composta ao meio). */
function primeiroGrafema(palavra: string) {
  return grafemas.segment(palavra)[Symbol.iterator]().next().value?.segment ?? "";
}

/** "Raimundo Sá" → "RS" · "Jo" → "JO" · "Aleksandra Wiśniewska-Kowalczyk" → "AW" · "" → "?" */
export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return [...grafemas.segment(partes[0])].slice(0, 2).map((s) => s.segment).join("").toUpperCase();
  return (primeiroGrafema(partes[0]) + primeiroGrafema(partes.at(-1)!)).toUpperCase();
}
