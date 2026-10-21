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

/** Estado das pranchas 04/05b/23: troca e CNH "Sim", prazo 48 e (no mobile) o nome preenchido com foco. */
async function prepararSimulacao(page: Page, nome: boolean) {
  for (const [campo, valor] of [["prazo", "48"], ["temTroca", "sim"], ["possuiCnh", "sim"]]) {
    await page.locator(`label:has(input[name='${campo}'][value='${valor}'])`).click();
  }
  if (nome) await page.locator("#campo-nome").fill("Ana Paula Rocha");
  await page.waitForTimeout(300);
}

/** Estado das pranchas 07/24: "Financiado" escolhido; no mobile, nome e WhatsApp preenchidos e foco no modelo. */
async function prepararPedido(page: Page, preencher: boolean) {
  await page.locator("label:has(input[name='pagamento'][value='financiado'])").click();
  if (preencher) {
    await page.locator("#campo-nome").fill("Carlos Menezes");
    await page.locator("#campo-whatsapp").fill("86998124471");
    await page.locator("#campo-marcaModelo").focus();
  }
  await page.waitForTimeout(300);
}

/** As pranchas mostram o interruptor ligado sem os campos do carro da entrada; o app abre Modelo e Ano. */
const INTERRUPTOR = "interruptor: a prancha o mostra ligado sem os campos; no app ligado abre Modelo e Ano (comparado desligado)";

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
    tela: "04",
    nome: "04-simular-veiculo-mobile",
    viewport: "mobile",
    ref: "#n04 .dv-card",
    rota: "/simular/toyota-corolla-xei-2-0-2023",
    app: "body",
    mascararFotos: true,
    paginaInteira: true,
    preparar: (p) => prepararSimulacao(p, true),
  },
  {
    tela: "05",
    nome: "05-simular-lista-mobile",
    viewport: "mobile",
    ref: "#n05 .dv-card",
    rota: "/simular",
    app: "body",
    mascararFotos: true,
    // Até o 8º veículo: a prancha tem 8 e o "Ainda não escolhi"; o app lista os 31.
    altura: 934,
    nota: "Compara até o 8º veículo (a prancha lista 8; o catálogo real tem 31).",
  },
  {
    tela: "05b",
    nome: "05b-simular-sem-veiculo-mobile",
    viewport: "mobile",
    ref: "#n05b .dv-card",
    rota: "/simular/sem-veiculo",
    app: "body",
    paginaInteira: true,
    preparar: (p) => prepararSimulacao(p, true),
  },
  {
    tela: "06",
    nome: "06-simulacao-enviada-mobile",
    viewport: "mobile",
    ref: "#n06 .dv-card",
    rota: "/simular/enviado?veiculo=toyota-corolla-xei-2-0-2023",
    app: "body",
    mascararFotos: true,
  },
  {
    tela: "07",
    nome: "07-pedido-busca-mobile",
    viewport: "mobile",
    ref: "#n07 .dv-card",
    rota: "/nao-encontrou",
    app: "body",
    paginaInteira: true,
    preparar: (p) => prepararPedido(p, true),
    mascaras: [
      { x: 33, y: 391, w: 324, h: 52, motivo: "WhatsApp: a prancha escreve (86) 99812-4471; o app usa a máscara do placeholder, (86) 9 9812-4471" },
      { x: 300, y: 828, w: 62, h: 40, motivo: INTERRUPTOR },
    ],
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
    tela: "23",
    nome: "23-simular-veiculo-desktop",
    viewport: "desktop",
    ref: "#n23 .dv-card",
    rota: "/simular/toyota-corolla-xei-2-0-2023",
    app: "body",
    mascararFotos: true,
    mascaras: [{ x: 360, y: 0, w: 820, h: 84, motivo: NAV }],
    preparar: (p) => prepararSimulacao(p, false),
  },
  {
    tela: "24",
    nome: "24-pedido-busca-desktop",
    viewport: "desktop",
    ref: "#n24 .dv-card",
    rota: "/nao-encontrou",
    app: "body",
    preparar: (p) => prepararPedido(p, false),
    mascaras: [
      { x: 360, y: 0, w: 820, h: 84, motivo: NAV },
      { x: 951, y: 696, w: 62, h: 42, motivo: INTERRUPTOR },
    ],
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
