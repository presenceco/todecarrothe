import { slugificar } from "./slug";

/**
 * Marcas do mercado brasileiro (seletores de marca e ordem dos chips/filtros do catálogo).
 * As 8 primeiras seguem a ordem das telas (01, 02, 21); as demais em ordem alfabética.
 */
export const MARCAS = [
  "Toyota",
  "Jeep",
  "Fiat",
  "Volkswagen",
  "Hyundai",
  "Chevrolet",
  "Honda",
  "Renault",
  "Audi",
  "BMW",
  "BYD",
  "Caoa Chery",
  "Citroën",
  "Dodge",
  "Ford",
  "GWM",
  "JAC",
  "Jaguar",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Peugeot",
  "Porsche",
  "RAM",
  "Subaru",
  "Suzuki",
  "Volvo",
] as const;

/**
 * Marcas com logo em public/marcas/<slug>.svg (copiadas do Simple Icons, na cor da marca), usadas nos filtros
 * do catálogo. As demais aparecem só com o nome.
 */
export const LOGOS_MARCAS: ReadonlySet<string> = new Set([
  "toyota", "jeep", "fiat", "volkswagen", "hyundai", "chevrolet", "honda", "renault", "audi", "bmw", "citroen",
  "ford", "kia", "mini", "mitsubishi", "nissan", "peugeot", "porsche", "ram", "subaru", "suzuki", "volvo",
]);

const ORDEM = new Map(MARCAS.map((m, i) => [slugificar(m), i]));

/** Ordena nomes de marca pela lista acima; marcas fora dela vão para o fim, em ordem alfabética. */
export function compararMarcas(a: string, b: string) {
  const ia = ORDEM.get(slugificar(a)) ?? Number.MAX_SAFE_INTEGER;
  const ib = ORDEM.get(slugificar(b)) ?? Number.MAX_SAFE_INTEGER;
  return ia - ib || a.localeCompare(b, "pt-BR");
}
