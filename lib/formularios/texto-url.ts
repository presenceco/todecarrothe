/** Tamanho máximo do texto vindo da URL nas páginas de confirmação. */
const MAXIMO = 60;
const ANO = /^(19[5-9]\d|20\d\d)$/;

/**
 * Texto da URL das confirmações (/nao-encontrou/enviado, /venda-seu-carro/enviado), como o carro procurado.
 * A página pode ser aberta por um link montado por qualquer um: o texto é descartado (devolve "") se tiver
 * link ("http", "www."), "@" ou mais de 3 dígitos seguidos que não sejam um ano. Com "", a página mostra
 * só o título da confirmação.
 */
export function textoDaUrl(valor: unknown) {
  if (typeof valor !== "string") return "";
  const texto = valor.replace(/\s+/g, " ").trim();
  if (/http|www\.|@/i.test(texto)) return "";
  if ((texto.match(/\d{4,}/g) ?? []).some((digitos) => !ANO.test(digitos))) return "";
  return texto.slice(0, MAXIMO).trim();
}
