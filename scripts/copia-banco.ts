/**
 * Cópia dos dados do Supabase antes de uma migration (o plano gratuito não guarda cópia automática).
 * Usa a chave de serviço, sem Docker nem pg_dump: grava cada tabela em JSON e confere a contagem de linhas.
 * Copia também a lista de arquivos dos buckets e os usuários do Auth. Não copia os arquivos das fotos nem as
 * senhas. A estrutura do banco está em supabase/migrations.
 *
 * Contém dados pessoais (CPF, renda): grave fora do repositório e fora de pastas sincronizadas.
 *
 * Uso: node --env-file=.env.local scripts/copia-banco.ts <pasta-de-destino>
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const pasta = process.argv[2];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!pasta || !url || !chave) {
  console.error("Uso: node --env-file=.env.local scripts/copia-banco.ts <pasta-de-destino>");
  process.exit(1);
}
const supabase = createClient(url, chave, { auth: { persistSession: false } });
const PAGINA = 1000;

const TABELAS = [
  "opcionais",
  "etiquetas_personalizadas",
  "selos_personalizados",
  "veiculos",
  "veiculo_fotos",
  "veiculo_opcionais",
  "veiculo_selos",
  "simulacoes",
  "pedidos_busca",
  "pedido_fotos",
  "consignacoes",
  "consignacao_fotos",
  "limites_envio",
];

await mkdir(pasta, { recursive: true });
let falhas = 0;

for (const tabela of TABELAS) {
  const linhas: unknown[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await supabase.from(tabela).select("*").range(de, de + PAGINA - 1);
    if (error) throw new Error(`${tabela}: ${error.message}`);
    linhas.push(...data);
    if (data.length < PAGINA) break;
  }
  const { count, error } = await supabase.from(tabela).select("*", { count: "exact", head: true });
  if (error) throw new Error(`${tabela}: ${error.message}`);
  await writeFile(join(pasta, `${tabela}.json`), JSON.stringify(linhas, null, 1));
  const ok = count === linhas.length;
  if (!ok) falhas++;
  console.log(`${ok ? "ok" : "DIFERENTE"}  ${tabela}: ${linhas.length} linha(s), o banco diz ${count}`);
}

// Lista de arquivos de cada bucket (só os caminhos e metadados).
const { data: buckets, error: erroBuckets } = await supabase.storage.listBuckets();
if (erroBuckets) throw new Error(`buckets: ${erroBuckets.message}`);
const arquivos: Record<string, unknown[]> = {};
for (const b of buckets) {
  arquivos[b.id] = [];
  const { data: pastas, error: e1 } = await supabase.storage.from(b.id).list("", { limit: 1000 });
  if (e1) throw new Error(`${b.id}: ${e1.message}`);
  for (const p of pastas.filter((x) => x.id === null)) {
    const { data, error: e2 } = await supabase.storage.from(b.id).list(p.name, { limit: 1000 });
    if (e2) throw new Error(`${b.id}/${p.name}: ${e2.message}`);
    arquivos[b.id].push(...data.map((a) => ({ ...a, pasta: p.name })));
  }
  console.log(`ok  bucket ${b.id}: ${arquivos[b.id].length} arquivo(s) listado(s)`);
}
await writeFile(join(pasta, "storage-arquivos.json"), JSON.stringify({ buckets, arquivos }, null, 1));

const { data: usuarios, error: erroAuth } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (erroAuth) throw new Error(`auth: ${erroAuth.message}`);
await writeFile(join(pasta, "auth-usuarios.json"), JSON.stringify(usuarios.users, null, 1));
console.log(`ok  auth: ${usuarios.users.length} usuário(s)`);

console.log(falhas ? `TERMINOU COM ${falhas} TABELA(S) DIFERENTE(S)` : "Cópia completa e conferida.");
if (falhas) process.exit(1);
