/**
 * Base da comparação visual: captura um elemento da referência e o equivalente no app,
 * aplica máscaras (áreas de dado dinâmico ou de marcação de foto), mede a diferença com o
 * pixelmatch e escreve um relatório HTML.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Browser, Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export type Retangulo = { x: number; y: number; w: number; h: number; motivo: string };

export type Caso = {
  nome: string;
  /** mobile = 390×844 · desktop = 1440×900 */
  viewport: "mobile" | "desktop";
  /** Seletor do elemento em referencias/telas.html. */
  ref: string;
  /** Seletor do elemento no app. */
  app: string;
  /** Rota do app (padrão: a galeria de componentes). */
  rota?: string;
  /** Áreas ignoradas, em px relativos ao elemento. */
  mascaras?: Retangulo[];
  /** Diferença aceita (fração de pixels). */
  limite?: number;
  nota?: string;
  /** Mascara as áreas hachuradas da referência (marcações de foto e mapa; no app entram as fotos reais). */
  mascararFotos?: boolean;
  /** Compara só os primeiros N px de altura (ex.: a lista do app é maior que a da prancha). */
  altura?: number;
  /** Ação no app antes de capturar (abrir um painel, por exemplo). */
  preparar?: (page: Page) => Promise<void>;
  /**
   * Estica a janela até a altura da página antes de capturar. Necessário quando há rodapé `sticky`:
   * sem isso, a captura o desenha preso na altura da janela, no meio da página.
   */
  paginaInteira?: boolean;
};

export type Resultado = Caso & {
  tamanhoRef: [number, number];
  tamanhoApp: [number, number];
  diferenca: number;
  arquivos: { ref: string; app: string; diff: string };
};

export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
} as const;

/** Abre a referência com as anotações escondidas (classe dv-pdf das próprias telas). */
export async function abrirReferencia(browser: Browser, url: string) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForSelector("#n01 .dv-card", { timeout: 60_000 });
  await page.evaluate(() => document.body.classList.add("dv-pdf"));
  await esperarPronto(page);
  return page;
}

/** Fontes prontas e imagens visíveis decodificadas (as de carregamento tardio fora da tela não contam). */
export async function esperarPronto(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const limite = new Promise((r) => setTimeout(r, 5000));
    const imagens = [...document.images].filter((i) => !i.complete && i.loading !== "lazy").map((i) => i.decode().catch(() => {}));
    await Promise.race([Promise.all(imagens), limite]);
  });
  await page.waitForTimeout(300);
}

async function capturar(page: Page, seletor: string) {
  const alvo = page.locator(seletor).first();
  await alvo.scrollIntoViewIfNeeded();
  // Depois de rolar até o elemento, espera as imagens dele (as de carregamento tardio entram agora).
  await alvo.evaluate(async (el) => {
    const imgs = [...el.querySelectorAll("img")].map((i) => i.decode().catch(() => {}));
    await Promise.race([Promise.all(imgs), new Promise((r) => setTimeout(r, 5000))]);
  });
  await page.waitForTimeout(150);
  return PNG.sync.read(await alvo.screenshot({ animations: "disabled", caret: "hide", timeout: 30_000 }));
}

function mascarar(img: PNG, mascaras: Retangulo[]) {
  for (const m of mascaras) {
    for (let y = Math.max(0, m.y); y < Math.min(img.height, m.y + m.h); y++) {
      for (let x = Math.max(0, m.x); x < Math.min(img.width, m.x + m.w); x++) {
        const i = (y * img.width + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 0;
        img.data[i + 2] = 255;
        img.data[i + 3] = 255;
      }
    }
  }
}

/** Posição do elemento no documento (com a fração de pixel). */
async function posicao(page: Page, seletor: string) {
  return page
    .locator(seletor)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY };
    });
}

/**
 * Desloca o elemento do app só pela diferença de fração de pixel em relação à referência
 * (ex.: 0,39 → 0,10). Assim o texto cai na mesma grade de pixels e o antisserrilhado é igual.
 */
async function alinharFracao(page: Page, seletor: string, alvo: { x: number; y: number }) {
  await page
    .locator(seletor)
    .first()
    .evaluate((el, alvo) => {
      const frac = (n: number) => n - Math.floor(n);
      const r = el.getBoundingClientRect();
      const dx = frac(alvo.x) - frac(r.left + window.scrollX);
      const dy = frac(alvo.y) - frac(r.top + window.scrollY);
      // position: relative + top/left desloca sem mexer no layout e vale para qualquer item (bloco, flex,
      // dentro de <dialog>). Sticky vira relative: em repouso é igual e não cria camada própria no Chrome
      // (camada própria muda o antisserrilhado do texto).
      const estilo = (el as HTMLElement).style;
      const cs = getComputedStyle(el);
      if (cs.position === "static" || cs.position === "sticky") {
        estilo.position = "relative";
        estilo.top = `${dy}px`;
        estilo.left = `${dx}px`;
      } else {
        estilo.top = `${(parseFloat(cs.top) || 0) + dy}px`;
        estilo.left = `${(parseFloat(cs.left) || 0) + dx}px`;
      }
    }, alvo);
}

/**
 * Linhas e colunas da captura cobertas por inteiro pelo elemento. Com borda em fração de pixel,
 * a primeira e a última linha misturam o que está em volta (diferente na galeria e na referência).
 */
async function areaInteira(page: Page, seletor: string) {
  return page
    .locator(seletor)
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      const x0 = Math.floor(r.left);
      const y0 = Math.floor(r.top);
      return {
        x: Math.ceil(r.left) - x0,
        y: Math.ceil(r.top) - y0,
        w: Math.floor(r.right) - Math.ceil(r.left),
        h: Math.floor(r.bottom) - Math.ceil(r.top),
      };
    });
}

function recortarArea(img: PNG, a: { x: number; y: number; w: number; h: number }) {
  const out = new PNG({ width: a.w, height: a.h });
  PNG.bitblt(img, out, a.x, a.y, a.w, a.h, 0, 0);
  return out;
}

/** Retângulos (relativos ao elemento) das áreas hachuradas da referência: marcações de foto e de mapa. */
async function areasHachuradas(page: Page, seletor: string): Promise<Retangulo[]> {
  return page
    .locator(seletor)
    .first()
    .evaluate((raiz) => {
      const base = raiz.getBoundingClientRect();
      return [...raiz.querySelectorAll<HTMLElement>("*")]
        .filter((el) => getComputedStyle(el).backgroundImage.includes("repeating-linear-gradient"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: Math.floor(r.left - base.left), y: Math.floor(r.top - base.top), w: Math.ceil(r.width) + 1, h: Math.ceil(r.height) + 1, motivo: "foto/mapa" };
        });
    });
}

export async function compararCaso(refPage: Page, appPage: Page, caso: Caso, pasta: string): Promise<Resultado> {
  if (caso.paginaInteira) {
    const largura = appPage.viewportSize()?.width ?? 390;
    const altura = await appPage.evaluate(() => document.documentElement.scrollHeight);
    await appPage.setViewportSize({ width: largura, height: altura });
    await esperarPronto(appPage);
  }
  if (caso.preparar) {
    await caso.preparar(appPage);
    // Tira o ponteiro de cima dos botões (o clique deixa um estado de hover onde abriu o painel).
    await appPage.mouse.move(1, 1);
    await appPage.waitForTimeout(200);
  }
  await alinharFracao(appPage, caso.app, await posicao(refPage, caso.ref));
  const ref = await capturar(refPage, caso.ref);
  const areaRef = await areaInteira(refPage, caso.ref);
  const app = await capturar(appPage, caso.app);
  const areaApp = await areaInteira(appPage, caso.app);
  const w = Math.min(areaRef.w, areaApp.w, ref.width - areaRef.x, app.width - areaApp.x);
  const h = Math.min(areaRef.h, areaApp.h, ref.height - areaRef.y, app.height - areaApp.y, caso.altura ?? Infinity);
  const a = recortarArea(ref, { ...areaRef, w, h });
  const b = recortarArea(app, { ...areaApp, w, h });
  const mascaras = [...(caso.mascaras ?? []), ...(caso.mascararFotos ? await areasHachuradas(refPage, caso.ref) : [])];
  caso = { ...caso, mascaras };
  mascarar(a, mascaras);
  mascarar(b, mascaras);
  const diff = new PNG({ width: w, height: h });
  const pixels = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1, includeAA: false, alpha: 0.2 });

  const arquivos = { ref: `${caso.nome}-ref.png`, app: `${caso.nome}-app.png`, diff: `${caso.nome}-diff.png` };
  await writeFile(path.join(pasta, arquivos.ref), PNG.sync.write(ref));
  await writeFile(path.join(pasta, arquivos.app), PNG.sync.write(app));
  await writeFile(path.join(pasta, arquivos.diff), PNG.sync.write(diff));

  return {
    ...caso,
    tamanhoRef: [ref.width, ref.height],
    tamanhoApp: [app.width, app.height],
    diferenca: pixels / (w * h),
    arquivos,
  };
}

export async function escreverRelatorio(pasta: string, titulo: string, resultados: Resultado[]) {
  await mkdir(pasta, { recursive: true });
  const linhas = resultados
    .map((r) => {
      const ok = r.diferenca <= (r.limite ?? 0.01) && r.tamanhoRef.join() === r.tamanhoApp.join();
      const tam = r.tamanhoRef.join() === r.tamanhoApp.join() ? `${r.tamanhoRef.join("×")}` : `ref ${r.tamanhoRef.join("×")} · app ${r.tamanhoApp.join("×")}`;
      const masc = (r.mascaras ?? []).map((m) => m.motivo).join("; ");
      return `<section class="${ok ? "ok" : "falha"}">
  <h2>${r.nome} <small>${r.viewport} · ${tam} · ${(r.diferenca * 100).toFixed(2)}% diferente</small></h2>
  ${r.nota ? `<p>${r.nota}</p>` : ""}${masc ? `<p class="m">Máscaras: ${masc}</p>` : ""}
  <div class="imgs"><figure><img src="${r.arquivos.ref}"><figcaption>Referência</figcaption></figure><figure><img src="${r.arquivos.app}"><figcaption>App</figcaption></figure><figure><img src="${r.arquivos.diff}"><figcaption>Diferença</figcaption></figure></div>
</section>`;
    })
    .join("\n");
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>${titulo}</title>
<style>body{font:15px system-ui;margin:24px;background:#f5f7fa;color:#0b0f17}section{background:#fff;border-radius:12px;padding:16px;margin:0 0 16px;border-left:6px solid #17803d}section.falha{border-color:#b42318}h2{font-size:17px;margin:0 0 8px}small{font-weight:400;color:#5b6474}.m{color:#8a6300}.imgs{display:flex;gap:12px;overflow-x:auto;align-items:flex-start}figure{margin:0}img{display:block;max-width:none;border:1px solid #e4e8ef}figcaption{font-size:13px;color:#5b6474;margin-top:4px}</style>
<h1>${titulo}</h1><p>${new Date().toLocaleString("pt-BR")}</p>${linhas}</html>`;
  await writeFile(path.join(pasta, "index.html"), html);
}
