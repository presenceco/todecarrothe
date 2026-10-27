/**
 * Migração única das fotos do estoque (auditoria de segurança de 27/10/2026, item 7), depois da migration
 * 20261027150000_veiculos_ocultos.sql:
 *
 * 1. Move para o bucket privado "veiculos-ocultos" as fotos que estão no público "veiculos" mas não são de
 *    um carro do catálogo (rascunho, reservado, vendido, ou pasta sem veículo, de envio abandonado).
 * 2. Regrava com cache de 5 minutos (cacheControl 300) as fotos dos dois buckets que estão com cache mais
 *    longo (as enviadas pelo painel tinham 1 ano): assim, quando um carro sai do catálogo, o link público
 *    da foto para de abrir em até 5 minutos.
 *
 * Sem `--aplicar`, só mostra o que faria. Os caminhos dos arquivos não mudam (nada a atualizar no banco).
 *
 * Uso: npm run db:mover-fotos [-- --aplicar]
 */
import { createClient } from "@supabase/supabase-js";
import { BUCKET_OCULTO, BUCKET_PUBLICO, CACHE_FOTOS_VEICULO, fotosPublicas } from "../lib/fotos-veiculo.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chave || url.includes("SEU-PROJETO")) {
  console.error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}
const supabase = createClient(url, chave, { auth: { persistSession: false } });
const aplicar = process.argv.includes("--aplicar");
const PAGINA = 1000;

type Arquivo = { name: string; id: string | null; metadata: Record<string, unknown> | null };

async function listar(bucket: string, pasta: string) {
  const itens: Arquivo[] = [];
  for (let offset = 0; ; offset += PAGINA) {
    const { data, error } = await supabase.storage.from(bucket).list(pasta, { limit: PAGINA, offset });
    if (error) throw new Error(`listar ${bucket}/${pasta}: ${error.message}`);
    itens.push(...data);
    if (data.length < PAGINA) return itens;
  }
}

/** Segundos do cache-control gravado no arquivo ("max-age=31536000" → 31536000). */
function cacheDe(a: Arquivo) {
  const valor = String(a.metadata?.cacheControl ?? "");
  const n = Number(/max-age=(\d+)/.exec(valor)?.[1] ?? valor);
  return Number.isFinite(n) ? n : 0;
}

const { data: veiculos, error } = await supabase.from("veiculos").select("id, slug, status, publicado");
if (error) throw new Error(`ler veículos: ${error.message}`);
const porId = new Map(veiculos.map((v) => [v.id as string, v]));

console.log(aplicar ? "Aplicando." : "Simulação (nada é alterado). Rode com --aplicar para mover de verdade.");

// 1. Fotos fora do catálogo: público → privado.
let movidas = 0;
let falhas = 0;
for (const pasta of (await listar(BUCKET_PUBLICO, "")).filter((p) => p.id === null)) {
  const v = porId.get(pasta.name);
  if (v && fotosPublicas(v)) continue;
  const arquivos = (await listar(BUCKET_PUBLICO, pasta.name)).filter((a) => a.id !== null);
  if (!arquivos.length) continue;
  console.log(`${v ? `${v.slug} (${v.status}${v.publicado ? "" : ", rascunho"})` : `pasta sem veículo ${pasta.name}`}: ${arquivos.length} foto(s) → ${BUCKET_OCULTO}`);
  if (!aplicar) {
    movidas += arquivos.length;
    continue;
  }
  for (const a of arquivos) {
    const caminho = `${pasta.name}/${a.name}`;
    const { error: e } = await supabase.storage.from(BUCKET_PUBLICO).move(caminho, caminho, { destinationBucket: BUCKET_OCULTO });
    if (e) {
      falhas++;
      console.error(`  falhou ${caminho}: ${e.message}`);
    } else movidas++;
  }
}

// Aviso: carro do catálogo com fotos no privado (não deveria acontecer antes desta migração).
for (const pasta of (await listar(BUCKET_OCULTO, "")).filter((p) => p.id === null)) {
  const v = porId.get(pasta.name);
  if (v && fotosPublicas(v)) console.warn(`! ${v.slug} está no catálogo e tem fotos no bucket privado: abra e salve no painel.`);
}

// 2. Cache de 5 minutos nas fotos dos dois buckets.
let regravadas = 0;
for (const bucket of [BUCKET_PUBLICO, BUCKET_OCULTO]) {
  for (const pasta of (await listar(bucket, "")).filter((p) => p.id === null)) {
    for (const a of (await listar(bucket, pasta.name)).filter((x) => x.id !== null && cacheDe(x) > Number(CACHE_FOTOS_VEICULO))) {
      const caminho = `${pasta.name}/${a.name}`;
      if (!aplicar) {
        regravadas++;
        continue;
      }
      const { data: corpo, error: e1 } = await supabase.storage.from(bucket).download(caminho);
      const tipo = String(a.metadata?.mimetype ?? (caminho.endsWith(".png") ? "image/png" : "image/jpeg"));
      const { error: e2 } = corpo
        ? await supabase.storage.from(bucket).update(caminho, corpo, { contentType: tipo, cacheControl: CACHE_FOTOS_VEICULO, upsert: true })
        : { error: e1 };
      if (e2) {
        falhas++;
        console.error(`  cache não regravado ${bucket}/${caminho}: ${e2.message}`);
      } else regravadas++;
    }
  }
}

console.log(`${aplicar ? "Movidas" : "A mover"}: ${movidas} · ${aplicar ? "cache regravado" : "cache a regravar"}: ${regravadas} · falhas: ${falhas}`);
if (falhas) process.exit(1);
