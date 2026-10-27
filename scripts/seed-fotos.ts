/**
 * Fotos de desenvolvimento: gera imagens de marcação (hachura + "foto N · corolla prata · frente 3/4",
 * no estilo das telas) e envia para o Storage, na quantidade de fotos de cada carro do seed.
 * Só preenche quem ainda não tem fotos; `--refazer` apaga e gera de novo. Fotos de carro fora do catálogo vão
 * para o bucket privado "veiculos-ocultos", como no painel.
 *
 * Uso: npm run db:fotos [-- --refazer]
 */
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { bucketDoVeiculo, CACHE_FOTOS_VEICULO } from "../lib/fotos-veiculo.ts";
import { slugVeiculo } from "../lib/slug.ts";
import { CONSIGNACOES, VEICULOS } from "./seed/dados.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chave || url.includes("SEU-PROJETO")) {
  console.error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}
const supabase = createClient(url, chave, { auth: { persistSession: false } });
const refazer = process.argv.includes("--refazer");

const ANGULOS = ["frente 3/4", "traseira 3/4", "lateral", "painel", "bancos", "porta-malas", "rodas", "motor", "multimídia", "banco traseiro", "teto", "chave", "porta-objetos", "pátio"];

const escapar = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** 1200×900 (4:3), hachura #E8EBF0/#DFE3E9 a 135° e etiqueta central, como as marcações das telas. */
async function imagem(rotulo: string) {
  const largura = 1200;
  const altura = 900;
  const fonte = 36;
  const larguraTexto = Math.round(rotulo.length * fonte * 0.6);
  const caixaL = larguraTexto + 56;
  const caixaA = fonte + 40;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">
  <defs><pattern id="h" width="68" height="68" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="34" height="68" fill="#E8EBF0"/><rect x="34" width="34" height="68" fill="#DFE3E9"/>
  </pattern></defs>
  <rect width="100%" height="100%" fill="url(#h)"/>
  <rect x="${(largura - caixaL) / 2}" y="${(altura - caixaA) / 2}" width="${caixaL}" height="${caixaA}" rx="20" fill="#FFFFFF" fill-opacity="0.9"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Consolas, Menlo, monospace" font-size="${fonte}" font-weight="500" fill="#4A5262">${escapar(rotulo)}</text>
</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
}

/** Executa no máximo `n` tarefas ao mesmo tempo. */
async function emParalelo<T>(itens: T[], n: number, fn: (item: T, i: number) => Promise<void>) {
  let proximo = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (proximo < itens.length) {
        const i = proximo++;
        await fn(itens[i], i);
      }
    }),
  );
}

async function preencher(opcoes: {
  bucket: "veiculos" | "veiculos-ocultos" | "consignacoes";
  tabela: "veiculo_fotos" | "consignacao_fotos";
  fk: "veiculo_id" | "consignacao_id";
  id: string;
  nome: string;
  total: number;
  descricao: string;
}) {
  const { bucket, tabela, fk, id, nome, total, descricao } = opcoes;
  const { data: existentes, error } = await supabase.from(tabela).select("path").eq(fk, id);
  if (error) throw error;
  if (existentes.length && !refazer) {
    console.log(`=  ${nome}: já tem ${existentes.length} fotos`);
    return;
  }
  if (existentes.length) {
    await supabase.storage.from(bucket).remove(existentes.map((f) => f.path));
    await supabase.from(tabela).delete().eq(fk, id);
  }

  const linhas: { path: string; ordem: number }[] = [];
  await emParalelo(
    Array.from({ length: total }, (_, i) => i),
    4,
    async (i) => {
      const path = `${id}/${String(i + 1).padStart(2, "0")}-${randomUUID()}.jpg`;
      const corpo = await imagem(`foto ${i + 1} · ${descricao} · ${ANGULOS[i] ?? `detalhe ${i + 1}`}`);
      const { error: e } = await supabase.storage.from(bucket).upload(path, corpo, { contentType: "image/jpeg", cacheControl: CACHE_FOTOS_VEICULO, upsert: false });
      if (e) throw new Error(`${nome}, foto ${i + 1}: ${e.message}`);
      linhas.push({ path, ordem: i });
    },
  );
  const { error: e2 } = await supabase.from(tabela).insert(linhas.sort((a, b) => a.ordem - b.ordem).map((l) => ({ [fk]: id, ...l })));
  if (e2) throw e2;
  console.log(`+  ${nome}: ${total} fotos`);
}

const { data: veiculos, error } = await supabase.from("veiculos").select("id, slug, status, publicado");
if (error) throw error;
const porSlug = new Map(veiculos.map((v) => [v.slug, v]));

for (const v of VEICULOS) {
  const slug = slugVeiculo(v.marca, v.modelo, v.versao, v.mod);
  const registro = porSlug.get(slug);
  if (!registro) {
    console.warn(`!  ${slug} não está no banco (rode npm run db:push antes)`);
    continue;
  }
  await preencher({
    bucket: bucketDoVeiculo(registro),
    tabela: "veiculo_fotos",
    fk: "veiculo_id",
    id: registro.id as string,
    nome: slug,
    total: v.fotos,
    descricao: `${v.modelo} ${v.cor}`.toLowerCase(),
  });
}

const { data: consignacoes, error: e3 } = await supabase.from("consignacoes").select("id, nome, marca, modelo");
if (e3) throw e3;
for (const c of CONSIGNACOES) {
  const registro = consignacoes.find((r) => r.nome === c.nome && r.marca === c.marca && r.modelo === c.modelo);
  if (!registro) continue;
  await preencher({
    bucket: "consignacoes",
    tabela: "consignacao_fotos",
    fk: "consignacao_id",
    id: registro.id,
    nome: `consignação de ${c.nome}`,
    total: c.fotos,
    descricao: `${c.modelo} ${c.cor}`.toLowerCase(),
  });
}

console.log("Pronto.");
