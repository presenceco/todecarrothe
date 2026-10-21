/**
 * Atalhos da CLI do Supabase para o projeto na nuvem, lendo o .env.local.
 *
 *   npm run db:link     liga esta pasta ao projeto (usa a URL e a senha do banco do .env.local)
 *   npm run db:push     aplica as migrations novas e o seed (supabase/seed.sql)
 *   npm run db:config   envia as configurações de login de supabase/config.toml (cadastro público desligado…)
 *   npm run db:tipos    gera lib/supabase/tipos-banco.ts a partir do banco
 *
 * A CLI precisa estar autorizada: rode `npx supabase login` uma vez (abre o navegador) ou defina
 * SUPABASE_ACCESS_TOKEN no .env.local (token pessoal em supabase.com/dashboard/account/tokens).
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../node_modules/supabase/dist/supabase.js", import.meta.url));
const comando = process.argv[2];

function exigir(nome: string) {
  const valor = process.env[nome];
  if (!valor || valor.includes("SEU-PROJETO")) {
    console.error(`Preencha ${nome} no .env.local antes de rodar este comando.`);
    process.exit(1);
  }
  return valor;
}

const ref = new URL(exigir("NEXT_PUBLIC_SUPABASE_URL")).hostname.split(".")[0];

function supabase(args: string[], capturar = false) {
  // Sem shell: a senha vai como argumento sem risco de ser interpretada.
  const r = spawnSync(process.execPath, [cli, ...args], { stdio: capturar ? ["inherit", "pipe", "inherit"] : "inherit", encoding: "utf8" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  return r.stdout ?? "";
}

switch (comando) {
  case "link":
    supabase(["link", "--project-ref", ref, "--password", exigir("SUPABASE_DB_PASSWORD")]);
    break;
  case "push":
    supabase(["db", "push", "--include-seed", "--yes", "--password", exigir("SUPABASE_DB_PASSWORD")]);
    break;
  case "config":
    supabase(["config", "push", "--project-ref", ref, "--yes"]);
    break;
  case "tipos": {
    const tipos = supabase(["gen", "types", "typescript", "--project-id", ref, "--schema", "public"], true);
    const destino = fileURLToPath(new URL("../lib/supabase/tipos-banco.ts", import.meta.url));
    writeFileSync(destino, `// GERADO por npm run db:tipos. Não edite à mão.\n${tipos}`);
    console.log(`→ ${destino}`);
    break;
  }
  default:
    console.error("Uso: node --env-file=.env.local scripts/supabase.ts link | push | config | tipos");
    process.exit(1);
}
