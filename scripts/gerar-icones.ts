/**
 * Baixa do Google Fonts o subconjunto da Material Symbols Rounded com os ícones de lib/icones.ts.
 * Mantém os mesmos eixos da fonte usada nas referências (FILL 0–1, opsz 20–48, wght 300–600; GRAD fixo em 0, o valor usado nas telas).
 *
 * Uso: npm run icones
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ICONES } from "../lib/icones.ts";

const destino = fileURLToPath(new URL("../app/fonts/material-symbols-rounded.woff2", import.meta.url));

const nomes = [...ICONES].sort();
const repetidos = nomes.filter((nome, i) => nomes.indexOf(nome) !== i);
if (repetidos.length) throw new Error(`Ícones repetidos em lib/icones.ts: ${repetidos.join(", ")}`);

const css = new URL("https://fonts.googleapis.com/css2");
css.searchParams.set("family", "Material Symbols Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0");
css.searchParams.set("icon_names", nomes.join(","));
css.searchParams.set("display", "block");

// Um user-agent de navegador atual faz o Google Fonts responder com woff2.
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const resposta = await fetch(css, { headers: { "User-Agent": userAgent } });
if (!resposta.ok) {
  throw new Error(`Google Fonts respondeu ${resposta.status}. Confira se todos os nomes existem: ${await resposta.text()}`);
}

const urlFonte = (await resposta.text()).match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)?.[1];
if (!urlFonte) throw new Error("Não encontrei a URL woff2 no CSS do Google Fonts.");

const fonte = await fetch(urlFonte);
if (!fonte.ok) throw new Error(`Falha ao baixar a fonte: ${fonte.status}`);

const bytes = Buffer.from(await fonte.arrayBuffer());
await writeFile(destino, bytes);
console.log(`${nomes.length} ícones · ${(bytes.length / 1024).toFixed(1)} KB → ${destino}`);
