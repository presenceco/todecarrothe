/**
 * Compara telas inteiras do app com as pranchas de referencias/telas.html, com os dados do seed.
 * Precisa do app rodando (npm run dev) e da referência em http://localhost:4400.
 *
 * Uso: npm run comparar:telas [-- 01 03 21]   (sem argumentos, compara todas as telas cadastradas)
 * Relatório: relatorios/telas/index.html
 *
 * Diferenças esperadas (documentadas em cada caso): fotos (mascaradas), item novo "Venda seu carro" na
 * navegação, contagens reais no lugar das fictícias.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { abrirReferencia, compararCaso, esperarPronto, escreverRelatorio, VIEWPORTS, type Caso, type Resultado } from "./lib/comparacao.ts";

const REF_URL = process.env.REF_URL ?? "http://localhost:4400/telas.html";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const PASTA = path.resolve("relatorios/telas");

const NAV = "navegação: o app tem o item novo “Venda seu carro”";

async function clicar(page: Page, seletor: string) {
  await page.locator(seletor).first().click();
  await page.waitForTimeout(600); // animação de entrada do painel (280ms) com folga
}

type Tela = Caso & { tela: string };

const TELAS: Tela[] = [
  {
    tela: "01",
    nome: "01-estoque-mobile",
    viewport: "mobile",
    ref: "#n01 .dv-card",
    rota: "/",
    app: "body",
    mascararFotos: true,
    // Até o fim do 4º cartão: depois a prancha mostra a chamada; o app continua com os 31 carros.
    altura: 2514,
    nota: "Compara até o 4º cartão (a prancha tem 4 carros; o catálogo real tem 31).",
  },
  {
    tela: "02",
    nome: "02-filtros-mobile",
    viewport: "mobile",
    ref: "#n02 .dv-card > :nth-child(5)",
    rota: "/?marca=toyota,jeep&preco=50000-150000&ano=2020-2024&cambio=automatico&km=80000&combustivel=flex&tipo=seda,suv",
    app: "dialog[open] .sheet-painel",
    preparar: (p) => clicar(p, "button[aria-label^='Filtros']"),
    mascaras: [{ x: 120, y: 742, w: 150, h: 30, motivo: "contagem real no botão (a prancha diz 24; com esses filtros o seed tem outra quantidade)" }],
  },
  {
    tela: "03",
    nome: "03-detalhe-mobile",
    viewport: "mobile",
    ref: "#n03 .dv-card",
    rota: "/carros/toyota-corolla-xei-2-0-2023",
    app: "body",
    mascararFotos: true,
    paginaInteira: true,
  },
  {
    tela: "08",
    nome: "08-sem-resultado-mobile",
    viewport: "mobile",
    ref: "#n08 .dv-card",
    rota: "/?marca=jeep&preco=-60000&cambio=manual",
    app: "body",
    // Na prancha (altura fixa de 844px) a chamada fica presa no pé; no app ela segue logo abaixo.
    altura: 520,
    nota: "Compara até o botão “Limpar filtros”.",
  },
  {
    tela: "09",
    nome: "09-menu-mobile",
    viewport: "mobile",
    ref: "#n09 .dv-card > :nth-child(5)",
    rota: "/",
    app: "dialog[open] .sheet-painel",
    preparar: (p) => clicar(p, "button[aria-label='Abrir menu']"),
    mascaras: [{ x: 0, y: 259, w: 328, h: 121, motivo: `${NAV}: na prancha a 4ª linha é “A loja”; no app, “Venda seu carro” e “A loja” na 5ª` }],
  },
  {
    tela: "10",
    nome: "10-a-loja-mobile",
    viewport: "mobile",
    ref: "#n10 .dv-card",
    rota: "/a-loja",
    app: "body",
    mascararFotos: true,
  },
  {
    tela: "21",
    nome: "21-estoque-desktop",
    viewport: "desktop",
    ref: "#n21 .dv-card",
    rota: "/",
    app: "body",
    mascararFotos: true,
    mascaras: [{ x: 360, y: 0, w: 820, h: 84, motivo: NAV }],
    // Até o fim da 2ª linha de cartões (a 3ª linha da prancha tem a chamada no lugar do 9º carro).
    altura: 1400,
    nota: "Compara até a 2ª linha de cartões.",
  },
  {
    tela: "22",
    nome: "22-detalhe-desktop",
    viewport: "desktop",
    ref: "#n22 .dv-card",
    rota: "/carros/toyota-corolla-xei-2-0-2023",
    app: "body",
    mascararFotos: true,
    mascaras: [{ x: 360, y: 0, w: 820, h: 84, motivo: NAV }],
  },
  {
    tela: "25",
    nome: "25-a-loja-desktop",
    viewport: "desktop",
    ref: "#n25 .dv-card",
    rota: "/a-loja",
    app: "body",
    mascararFotos: true,
    mascaras: [{ x: 360, y: 0, w: 820, h: 84, motivo: NAV }],
  },
];

const escolhidas = process.argv.slice(2);
const casos = escolhidas.length ? TELAS.filter((t) => escolhidas.includes(t.tela)) : TELAS;

// Sem suavização LCD (colorida): o <dialog> fica em camada própria e usaria a cinza; no celular é sempre cinza.
const browser = await chromium.launch({ args: ["--disable-lcd-text"] });
try {
  await mkdir(PASTA, { recursive: true });
  const refPage = await abrirReferencia(browser, REF_URL);
  const resultados: Resultado[] = [];

  for (const caso of casos) {
    // Página nova por tela: estado limpo (painéis fechados, rolagem no topo).
    const appPage = await browser.newPage({ viewport: VIEWPORTS[caso.viewport], deviceScaleFactor: 1 });
    await appPage.goto(APP_URL + (caso.rota ?? "/"), { waitUntil: "load" });
    // Sem transições: elemento recém-animado fica numa camada própria do Chrome e o texto muda de antisserrilhado.
    await appPage.addStyleTag({ content: "*,*::before,*::after,::backdrop{transition:none!important;animation:none!important}" });
    await esperarPronto(appPage);
    const r = await compararCaso(refPage, appPage, caso, PASTA);
    resultados.push(r);
    const tam = r.tamanhoRef.join() === r.tamanhoApp.join() ? "tamanho igual" : `ref ${r.tamanhoRef.join("×")} · app ${r.tamanhoApp.join("×")}`;
    console.log(`${(r.diferenca * 100).toFixed(2).padStart(6)}%  ${caso.nome.padEnd(26)} ${tam}`);
    await appPage.close();
  }

  await escreverRelatorio(PASTA, "Comparação das telas", resultados);
  console.log(`\nRelatório: ${path.join(PASTA, "index.html")}`);
} finally {
  await browser.close();
}
