/** Cupom de indicação: só identifica quem indicou o cliente. Não dá desconto nem calcula prêmio. */

export const REGEX_CUPOM = /^[A-Z0-9]{3,15}$/;

/** " joão 1 " → "JOAO1": sem espaços nem acentos, em maiúsculas. */
export function normalizarCupom(valor: unknown) {
  if (typeof valor !== "string") return "";
  return valor.normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, "").toUpperCase();
}

/** Código sugerido a partir do primeiro nome do indicador: "João Silva" → "JOAO". */
export function sugerirCodigo(nome: string) {
  return normalizarCupom(nome.trim().split(/\s+/)[0] ?? "").replace(/[^A-Z0-9]/g, "").slice(0, 15);
}
