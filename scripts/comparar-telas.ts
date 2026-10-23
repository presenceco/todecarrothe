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
  // Campo novo ("Parcela que você busca") fora das pranchas.
  await page.addStyleTag({ content: "[data-novo]{display:none!important}" });
  // Os cliques rolam a página; volta ao topo para a coluna fixa do veículo (23) ficar no lugar.
  await page.evaluate(() => scrollTo(0, 0));
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
  // Campos novos do financiado (parcelas e valor da parcela) fora das pranchas.
  await page.addStyleTag({ content: "[data-novo]{display:none!important}" });
  await page.waitForTimeout(300);
}

/** As pranchas mostram o interruptor ligado sem os campos do carro da entrada; o app abre Modelo e Ano. */
const INTERRUPTOR = "interruptor: a prancha o mostra ligado sem os campos; no app ligado abre Modelo e Ano (comparado desligado)";

/** Login (11/26): e-mail da prancha preenchido e com foco. A senha não é digitada (área mascarada). */
async function prepararLogin(page: Page) {
  await page.locator("#campo-email").fill("contato@todecarro.com.br");
  await page.waitForTimeout(300);
}

const SENHA = "senha: a prancha mostra 8 pontos; a comparação não digita senha";

/** Navegação nova do admin: barra inferior e menu lateral têm "Consignações", ausente nas pranchas antigas. */
const NAV_ADMIN = "navegação do admin: o app tem a aba nova “Consignações”";
const CONTADORES = "contadores de novos: vêm do banco (envios de teste somam aos do seed)";

/** Esconde os campos que não estão nas pranchas (marcados com data-novo), para não deslocar o resto. */
async function esconderNovos(page: Page) {
  await page.addStyleTag({ content: "[data-novo]{display:none!important}" });
  await page.waitForTimeout(200);
}

/** Id de um veículo pelo slug (rotas do painel usam o id). Lê pela API pública: o veículo precisa estar no catálogo. */
async function idVeiculo(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) throw new Error("Rode com o .env.local (npm run comparar:telas) para resolver o id do veículo.");
  const r = await fetch(`${url}/rest/v1/veiculos?select=id&slug=eq.${slug}`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } });
  const [linha] = (await r.json()) as { id: string }[];
  return linha.id;
}

/** Id de um item do painel pelo nome do cliente no seed (lê com a chave de serviço; só para a comparação local). */
async function idPorNome(tabela: "pedidos_busca" | "simulacoes", nome: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Rode com o .env.local (npm run comparar:telas) para resolver o id.");
  const r = await fetch(`${url}/rest/v1/${tabela}?select=id&nome=eq.${encodeURIComponent(nome)}&limit=1`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } });
  const [linha] = (await r.json()) as { id: string }[];
  return linha.id;
}

/** Abas e pílulas com contagem: vêm do banco (envios de teste somam aos do seed). */
const CONTAGEM = "contagens: vêm do banco (envios de teste somam aos do seed)";
const AVATAR = { x: 334, y: 12, w: 48, h: 48, motivo: "avatar: iniciais do usuário admin real" };
const RODAPE_MENU = { x: 0, y: 830, w: 248, h: 70, motivo: "rodapé do menu: nome e papel do usuário admin real" };

/** Esconde os envios de teste (nomes "Teste Automatizado" e "TESTE"), que não existem nas pranchas. */
async function esconderTestes(page: Page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("article, [role=row]")) {
      if (/Teste Automatizado|TESTE/.test(el.textContent ?? "")) (el as HTMLElement).style.display = "none";
    }
  });
  await page.waitForTimeout(200);
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
    tela: "11",
    nome: "11-login-mobile",
    viewport: "mobile",
    ref: "#n11 .dv-card",
    rota: "/admin/login",
    app: "body",
    preparar: prepararLogin,
    mascaras: [{ x: 37, y: 503, w: 260, h: 50, motivo: SENHA }],
  },
  {
    tela: "12",
    nome: "12-estoque-admin-mobile",
    viewport: "mobile",
    ref: "#n12 .dv-card",
    rota: "/admin/estoque",
    app: "body",
    mascararFotos: true,
    // Até o 8º cartão: a prancha mostra 8 e a barra inferior antiga (3 abas); o app lista 20 por página.
    altura: 1194,
    paginaInteira: true,
    mascaras: [{ x: 334, y: 12, w: 48, h: 48, motivo: "avatar: iniciais do usuário admin real" }],
    nota: "Compara cabeçalho e os 8 primeiros cartões.",
  },
  {
    tela: "13",
    nome: "13-acoes-veiculo-mobile",
    viewport: "mobile",
    ref: "#n13 .dv-card > :nth-child(4)",
    rota: "/admin/estoque",
    app: "dialog[open] .sheet-painel",
    mascararFotos: true,
    preparar: (p) => clicar(p, "article button[aria-label^='Ações de']"),
  },
  {
    tela: "14",
    nome: "14-excluir-veiculo-mobile",
    viewport: "mobile",
    ref: "#n14 .dv-card > :nth-child(4)",
    rota: "/admin/estoque",
    app: "dialog[open] .sheet-painel",
    preparar: async (p) => {
      await clicar(p, "article button[aria-label^='Ações de']");
      await clicar(p, "dialog[open] button:has-text('Excluir')");
    },
  },
  {
    tela: "15",
    nome: "15-editar-veiculo-mobile",
    viewport: "mobile",
    ref: "#n15 .dv-card",
    rota: "/admin/estoque/{corolla}",
    app: "body",
    mascararFotos: true,
    paginaInteira: true,
    preparar: esconderNovos,
    mascaras: [{ x: 17, y: 2088, w: 340, h: 50, motivo: "7º opcional: a prancha mobile pula para “Teto solar”; a desktop segue a ordem da lista" }],
    nota: "Campos novos (Etiqueta no catálogo, Carroceria) ficam ocultos na comparação.",
  },
  {
    tela: "16",
    nome: "16-pedidos-mobile",
    preparar: esconderTestes,
    viewport: "mobile",
    ref: "#n16 .dv-card",
    rota: "/admin/pedidos",
    app: "body",
    altura: 760,
    mascaras: [AVATAR, { x: 150, y: 20, w: 120, h: 32, motivo: CONTAGEM }, { x: 16, y: 72, w: 374, h: 48, motivo: CONTAGEM }],
    nota: "Compara até o 3º cartão (a prancha corta ali; a barra inferior antiga tem 3 abas).",
  },
  {
    tela: "17",
    nome: "17-pedido-mobile",
    viewport: "mobile",
    ref: "#n17 .dv-card",
    rota: "/admin/pedidos/{pedido}",
    app: "body",
    paginaInteira: true,
  },
  {
    tela: "18",
    nome: "18-simulacoes-mobile",
    preparar: esconderTestes,
    viewport: "mobile",
    ref: "#n18 .dv-card",
    rota: "/admin/simulacoes",
    app: "body",
    mascararFotos: true,
    altura: 760,
    mascaras: [
      AVATAR,
      { x: 16, y: 72, w: 374, h: 48, motivo: CONTAGEM },
      { x: 186, y: 20, w: 84, h: 32, motivo: "pílula “N novas”: a prancha 18 a omite, a 16 mostra; o app mostra nas duas" },
    ],
    nota: "Compara até o 3º cartão.",
  },
  {
    tela: "19",
    nome: "19-simulacao-mobile",
    viewport: "mobile",
    ref: "#n19 .dv-card",
    rota: "/admin/simulacoes/{simulacao}",
    app: "body",
    mascararFotos: true,
    paginaInteira: true,
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
  {
    tela: "26",
    nome: "26-login-desktop",
    viewport: "desktop",
    ref: "#n26 .dv-card",
    rota: "/admin/login",
    app: "body",
    preparar: prepararLogin,
    mascaras: [{ x: 871, y: 465, w: 360, h: 50, motivo: SENHA }],
  },
  {
    tela: "27",
    nome: "27-estoque-admin-desktop",
    viewport: "desktop",
    ref: "#n27 .dv-card",
    rota: "/admin/estoque",
    app: "body",
    mascararFotos: true,
    preparar: (p) => clicar(p, "[role=row] button[aria-label^='Mais ações']"),
    mascaras: [
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      { x: 0, y: 830, w: 248, h: 70, motivo: "rodapé do menu: nome e papel do usuário admin real" },
    ],
    // Até a 8ª linha: a prancha pagina de 8 em 8; o app, de 20 em 20 (dúvida 5).
    altura: 803,
    nota: "Compara até a 8ª linha da tabela.",
  },
  {
    tela: "28",
    nome: "28-editar-veiculo-desktop",
    viewport: "desktop",
    ref: "#n28 .dv-card",
    rota: "/admin/estoque/{corolla}",
    app: "body",
    mascararFotos: true,
    preparar: esconderNovos,
    mascaras: [
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      { x: 0, y: 700, w: 248, h: 800, motivo: "menu lateral: no app fica fixo na altura da tela; a prancha o estica até o fim da página" },
      { x: 313, y: 288, w: 698, h: 186, motivo: "fotos: a prancha mostra uma foto sendo arrastada" },
    ],
    nota: "Campos novos (Etiqueta no catálogo, Carroceria) ficam ocultos na comparação.",
  },
  {
    tela: "29",
    nome: "29-pedidos-desktop",
    preparar: esconderTestes,
    viewport: "desktop",
    ref: "#n29 .dv-card",
    rota: "/admin/pedidos",
    app: "body",
    mascaras: [
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      RODAPE_MENU,
      { x: 620, y: 109, w: 540, h: 44, motivo: CONTAGEM },
    ],
    // A prancha tem 6 pedidos; o banco tem também o envio de teste (o 1º da lista).
    altura: 682,
    nota: "Compara até a 6ª linha.",
  },
  {
    tela: "30",
    nome: "30-pedido-desktop",
    viewport: "desktop",
    ref: "#n30 .dv-card",
    rota: "/admin/pedidos/{pedido}",
    app: "body",
    mascaras: [
      { x: 248, y: 0, w: 652, h: 900, motivo: "lista por baixo do painel: a prancha mostra uma versão simplificada" },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      RODAPE_MENU,
    ],
  },
  {
    tela: "31",
    nome: "31-simulacoes-desktop",
    preparar: esconderTestes,
    viewport: "desktop",
    ref: "#n31 .dv-card",
    rota: "/admin/simulacoes",
    app: "body",
    mascararFotos: true,
    mascaras: [
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      RODAPE_MENU,
      { x: 620, y: 109, w: 520, h: 44, motivo: CONTAGEM },
    ],
    altura: 787,
    nota: "Compara até a 7ª linha.",
  },
  {
    tela: "32",
    nome: "32-simulacao-desktop",
    viewport: "desktop",
    ref: "#n32 .dv-card",
    rota: "/admin/simulacoes/{simulacao}",
    app: "body",
    mascararFotos: true,
    mascaras: [
      { x: 248, y: 0, w: 652, h: 900, motivo: "lista por baixo do painel: a prancha mostra uma versão simplificada" },
      { x: 186, y: 180, w: 40, h: 90, motivo: CONTADORES },
      { x: 0, y: 275, w: 248, h: 60, motivo: NAV_ADMIN },
      RODAPE_MENU,
    ],
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
    // Telas do painel (exceto o login) precisam de uma sessão de admin: SESSAO_ADMIN aponta para o estado do
    // navegador gerado por scripts/tmp/sessao-admin.ts (fora do repositório).
    const painel = caso.rota?.startsWith("/admin") && !caso.rota.startsWith("/admin/login");
    const contexto = await browser.newContext({
      viewport: VIEWPORTS[caso.viewport],
      deviceScaleFactor: 1,
      storageState: painel ? process.env.SESSAO_ADMIN : undefined,
    });
    const appPage = await contexto.newPage();
    let rota = caso.rota ?? "/";
    if (rota.includes("{pedido}")) rota = rota.replace("{pedido}", await idPorNome("pedidos_busca", "Carlos Menezes"));
    if (rota.includes("{simulacao}")) rota = rota.replace("{simulacao}", await idPorNome("simulacoes", "Ana Paula Rocha"));
    if (rota.includes("{corolla}")) rota = rota.replace("{corolla}", await idVeiculo("toyota-corolla-xei-2-0-2023"));
    await appPage.goto(APP_URL + rota, { waitUntil: "load" });
    // Sem transições: elemento recém-animado fica numa camada própria do Chrome e o texto muda de antisserrilhado.
    await appPage.addStyleTag({ content: "*,*::before,*::after,::backdrop{transition:none!important;animation:none!important}" });
    await esperarPronto(appPage);
    const r = await compararCaso(refPage, appPage, caso, PASTA);
    resultados.push(r);
    const tam = r.tamanhoRef.join() === r.tamanhoApp.join() ? "tamanho igual" : `ref ${r.tamanhoRef.join("×")} · app ${r.tamanhoApp.join("×")}`;
    console.log(`${(r.diferenca * 100).toFixed(2).padStart(6)}%  ${caso.nome.padEnd(26)} ${tam}`);
    await contexto.close();
  }

  await escreverRelatorio(PASTA, "Comparação das telas", resultados);
  console.log(`\nRelatório: ${path.join(PASTA, "index.html")}`);
} finally {
  await browser.close();
}
