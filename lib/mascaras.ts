/** Máscaras dos campos (aplicadas enquanto a pessoa digita) e conversões de volta para valor. */

export const digitos = (s: string) => s.replace(/\D/g, "");

/** "12345678909" → "123.456.789-09" (parcial enquanto digita). */
export function mascaraCpf(valor: string) {
  const d = digitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/** "12031991" → "12/03/1991" */
export function mascaraData(valor: string) {
  const d = digitos(valor).slice(0, 8);
  return d.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

/**
 * WhatsApp com DDD, no formato do placeholder das telas: "(86) 9 9812-4471".
 * Com 10 dígitos (fixo): "(86) 3221-4471".
 */
export function mascaraWhatsapp(valor: string) {
  const d = digitos(valor).replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (d.length <= 10) {
    // Enquanto digita (ou fixo de 10 dígitos): (86) 3221-4471
    return `(${ddd}) ${resto.slice(0, 4)}${resto.length > 4 ? `-${resto.slice(4, 8)}` : ""}`;
  }
  return `(${ddd}) ${resto[0]} ${resto.slice(1, 5)}-${resto.slice(5, 9)}`;
}

/** Digitação de dinheiro empurrando os centavos: "12345" → "R$ 123,45". Vazio fica vazio. */
export function mascaraMoeda(valor: string) {
  const d = digitos(valor).replace(/^0+/, "").slice(0, 11);
  if (!d) return "";
  const centavos = d.padStart(3, "0");
  const inteiro = Number(centavos.slice(0, -2));
  return `R$ ${new Intl.NumberFormat("pt-BR").format(inteiro)},${centavos.slice(-2)}`;
}

/** "R$ 1.234,56" → 1234.56; vazio → null. */
export function moedaParaNumero(valor: string) {
  const d = digitos(valor);
  return d ? Number(d) / 100 : null;
}

/** "20192020" → "2019/2020" */
export function mascaraAnoFabModelo(valor: string) {
  const d = digitos(valor).slice(0, 8);
  return d.replace(/^(\d{4})(\d)/, "$1/$2");
}

/** "38000" → "38.000" (o "km" fica ao lado do campo). */
export function mascaraKm(valor: string) {
  const d = digitos(valor).replace(/^0+(?=\d)/, "").slice(0, 7);
  return d ? new Intl.NumberFormat("pt-BR").format(Number(d)) : "";
}

/** "2019" (só ano, 4 dígitos). */
export function mascaraAno(valor: string) {
  return digitos(valor).slice(0, 4);
}

/** "12/03/1991" → "1991-03-12", ou null se a data não existir. */
export function dataBrParaIso(valor: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  if (data.getUTCFullYear() !== Number(ano) || data.getUTCMonth() !== Number(mes) - 1 || data.getUTCDate() !== Number(dia)) return null;
  return `${ano}-${mes}-${dia}`;
}

/** Idade completa em anos numa data de referência. */
export function idade(nascimentoIso: string, hoje = new Date()) {
  const [a, m, d] = nascimentoIso.split("-").map(Number);
  let anos = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) anos--;
  return anos;
}

/** Reais inteiros, sem centavos (preço do veículo): "129900" → "129.900". */
export function mascaraReais(valor: string) {
  const d = digitos(valor).replace(/^0+(?=\d)/, "").slice(0, 9);
  return d ? new Intl.NumberFormat("pt-BR").format(Number(d)) : "";
}

/**
 * Quilometragem com o "km" no próprio campo (cadastro, telas 15/28): "38000" → "38.000 km".
 * Apagar o "m" do sufixo apaga o último dígito, para o campo não travar no backspace.
 */
export function mascaraKmSufixo(novo: string, anterior: string) {
  let d = digitos(novo);
  if (novo.length < anterior.length && d === digitos(anterior)) d = d.slice(0, -1);
  const numero = mascaraKm(d);
  return numero ? `${numero} km` : "";
}
