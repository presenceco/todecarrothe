/**
 * Cria (ou atualiza) o único usuário do painel. O cadastro público fica desligado no Supabase.
 *
 * Uso: npm run criar-admin -- --email voce@exemplo.com --nome "Raimundo Sá" [--papel "Proprietário"] [--substituir]
 *
 * A senha é pedida no terminal (não aparece na tela) ou lida de ADMIN_SENHA.
 * Mínimo de 10 caracteres, com maiúscula, minúscula e número (supabase/config.toml).
 * `--substituir`: se já existir outro admin, ele perde o acesso de admin.
 */
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    nome: { type: "string" },
    papel: { type: "string", default: "Proprietário" },
    substituir: { type: "boolean", default: false },
  },
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !chave || url.includes("SEU-PROJETO")) {
  console.error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}
if (!values.email || !values.nome) {
  console.error('Uso: npm run criar-admin -- --email voce@exemplo.com --nome "Seu Nome" [--papel "Proprietário"]');
  process.exit(1);
}

/** Lê a senha sem mostrar no terminal. */
function perguntarSenha(pergunta: string) {
  return new Promise<string>((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const saida = rl as unknown as { _writeToOutput: (s: string) => void };
    let mostrando = true;
    saida._writeToOutput = (s: string) => {
      if (mostrando) process.stdout.write(s);
    };
    rl.question(pergunta, (resposta) => {
      rl.close();
      process.stdout.write("\n");
      resolve(resposta);
    });
    mostrando = false;
  });
}

const senha = process.env.ADMIN_SENHA ?? (await perguntarSenha("Senha do painel: "));
if (senha.length < 10 || !/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha)) {
  console.error("A senha precisa de 10+ caracteres, com maiúscula, minúscula e número.");
  process.exit(1);
}
if (!process.env.ADMIN_SENHA && (await perguntarSenha("Repita a senha: ")) !== senha) {
  console.error("As senhas não conferem.");
  process.exit(1);
}

const supabase = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
const email = values.email.trim().toLowerCase();
const dados = {
  password: senha,
  email_confirm: true,
  app_metadata: { role: "admin" },
  user_metadata: { nome: values.nome.trim(), papel: values.papel.trim() },
};

const { data: lista, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;

const outrosAdmins = lista.users.filter((u) => u.app_metadata?.role === "admin" && u.email?.toLowerCase() !== email);
if (outrosAdmins.length && !values.substituir) {
  console.error(`Já existe um admin (${outrosAdmins.map((u) => u.email).join(", ")}). Use --substituir para trocar.`);
  process.exit(1);
}
for (const u of outrosAdmins) {
  await supabase.auth.admin.updateUserById(u.id, { app_metadata: { role: null } });
  console.log(`-  ${u.email} deixou de ser admin`);
}

const existente = lista.users.find((u) => u.email?.toLowerCase() === email);
if (existente) {
  const { error: e } = await supabase.auth.admin.updateUserById(existente.id, dados);
  if (e) throw e;
  console.log(`✓  ${email} atualizado (senha, nome e papel de admin)`);
} else {
  const { error: e } = await supabase.auth.admin.createUser({ email, ...dados });
  if (e) throw e;
  console.log(`✓  ${email} criado como admin`);
}
