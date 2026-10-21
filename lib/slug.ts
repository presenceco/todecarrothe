/** "Toyota", "Corolla", "XEi 2.0", 2023 → "toyota-corolla-xei-2-0-2023" (sem acentos, só a-z, 0-9 e hífen). */
export function slugVeiculo(marca: string, modelo: string, versao: string, anoModelo: number) {
  return slugificar(`${marca} ${modelo} ${versao} ${anoModelo}`);
}

export function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

/** Primeiro slug livre: base, base-2, base-3… (`ocupados` são os slugs que já existem). */
export function slugLivre(base: string, ocupados: ReadonlySet<string>) {
  if (!ocupados.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidato = `${base}-${n}`;
    if (!ocupados.has(candidato)) return candidato;
  }
}
