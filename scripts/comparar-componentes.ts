/**
 * Compara os componentes comuns da galeria (/dev/componentes) com as telas de referência.
 * Precisa do app rodando (npm run dev) e da referência servida em http://localhost:4400
 * (py -m http.server 4400 --directory referencias).
 *
 * Uso: npm run comparar:componentes
 * Relatório: relatorios/componentes/index.html
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { abrirReferencia, compararCaso, esperarPronto, escreverRelatorio, VIEWPORTS, type Caso, type Resultado } from "./lib/comparacao.ts";

const REF_URL = process.env.REF_URL ?? "http://localhost:4400/telas.html";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const PASTA = path.resolve("relatorios/componentes");

const GALERIA = "/dev/componentes";
const FOTO = "marcação de foto da referência (no app entra a foto real)";

const CASOS: Caso[] = [
  { nome: "header-mobile", viewport: "mobile", ref: "#n01 .dv-card > :nth-child(1)", app: '[data-cmp="header"] header' },
  {
    nome: "cartao-mobile",
    viewport: "mobile",
    ref: "#n01 .dv-card > :nth-child(7) > :nth-child(1)",
    app: '[data-cmp="card"] article',
    mascaras: [{ x: 69, y: 120, w: 220, h: 28, motivo: FOTO }],
  },
  { nome: "chamada-mobile", viewport: "mobile", ref: "#n01 .dv-card > :nth-child(7) > :nth-child(5)", app: '[data-cmp="cta"] > *' },
  { nome: "rodape-mobile", viewport: "mobile", ref: "#n01 .dv-card > :nth-child(8)", app: '[data-cmp="footer"] footer' },
  {
    nome: "admin-cabecalho-mobile",
    viewport: "mobile",
    ref: "#n12 .dv-card > :nth-child(1)",
    app: '[data-cmp="admin-header"] header',
    mascaras: [{ x: 382, y: 72, w: 8, h: 62, motivo: "a rolagem dos chips vai até a borda da tela (a tela corta 8px antes)" }],
  },
  {
    nome: "header-desktop",
    viewport: "desktop",
    ref: "#n21 .dv-card > :nth-child(1)",
    app: '[data-cmp="header"] header',
    mascaras: [{ x: 360, y: 0, w: 820, h: 84, motivo: "navegação: o app tem o item novo “Venda seu carro”" }],
  },
  {
    nome: "cartao-desktop",
    viewport: "desktop",
    ref: "#n21 .dv-card > :nth-child(3) > :nth-child(2) > :nth-child(2) > :nth-child(1)",
    app: '[data-cmp="card"] article',
    mascaras: [{ x: 76, y: 103, w: 160, h: 28, motivo: FOTO }],
  },
  {
    nome: "chamada-desktop",
    viewport: "desktop",
    ref: "#n21 .dv-card > :nth-child(3) > :nth-child(2) > :nth-child(2) > :nth-child(9)",
    app: '[data-cmp="cta"] > *',
  },
  { nome: "rodape-desktop", viewport: "desktop", ref: "#n21 .dv-card > :nth-child(4)", app: '[data-cmp="footer"] footer' },
  {
    nome: "admin-menu-lateral",
    viewport: "desktop",
    ref: "#n27 .dv-card > :nth-child(1)",
    app: '[data-cmp="sidebar"] aside',
    mascaras: [
      { x: 0, y: 120, w: 248, h: 54, motivo: "item ativo (na tela é Estoque; na galeria nenhuma rota do admin está aberta)" },
      { x: 0, y: 270, w: 248, h: 60, motivo: "item novo “Consignações”" },
    ],
  },
];

// Sem suavização LCD (colorida): o <dialog> fica em camada própria e usaria a cinza; no celular é sempre cinza.
const browser = await chromium.launch({ args: ["--disable-lcd-text"] });
try {
  await mkdir(PASTA, { recursive: true });
  const refPage = await abrirReferencia(browser, REF_URL);
  const resultados: Resultado[] = [];

  for (const viewport of ["mobile", "desktop"] as const) {
    const casos = CASOS.filter((c) => c.viewport === viewport);
    const appPage = await browser.newPage({ viewport: VIEWPORTS[viewport], deviceScaleFactor: 1 });
    for (const rota of new Set(casos.map((c) => c.rota ?? GALERIA))) {
      await appPage.goto(APP_URL + rota, { waitUntil: "load" });
      await esperarPronto(appPage);
      for (const caso of casos.filter((c) => (c.rota ?? GALERIA) === rota)) {
        const r = await compararCaso(refPage, appPage, caso, PASTA);
        resultados.push(r);
        const tam = r.tamanhoRef.join() === r.tamanhoApp.join() ? "tamanho igual" : `ref ${r.tamanhoRef.join("×")} ≠ app ${r.tamanhoApp.join("×")}`;
        console.log(`${(r.diferenca * 100).toFixed(2).padStart(6)}%  ${caso.nome.padEnd(24)} ${tam}`);
      }
    }
    await appPage.close();
  }

  await escreverRelatorio(PASTA, "Comparação dos componentes", resultados);
  console.log(`\nRelatório: ${path.join(PASTA, "index.html")}`);
} finally {
  await browser.close();
}
