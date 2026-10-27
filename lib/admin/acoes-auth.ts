"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { dentroDoLimite, type Limite } from "@/lib/formularios/protecao";
import { resumoErro } from "@/lib/log";
import { clienteServidor } from "@/lib/supabase/servidor";
import { COOKIE_SESSAO_CURTA } from "./cookies";
import { emailDoAdmin, emailDoPainel } from "./entrada";

export type EstadoEntrar = { erro?: string; email?: string };
export type EstadoEsqueci = { enviado?: boolean };
export type EstadoRedefinir = { erro?: string };

const ERRO_CREDENCIAIS = "E-mail ou senha incorretos.";
const ERRO_LIMITE = "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";

/** Tentativas de login por IP (o hash do IP é o mesmo dos formulários públicos). */
const LIMITE_LOGIN: Limite = { quantidade: 5, janela: "15 minutes" };
/** Pedidos de "Esqueci minha senha" por IP. */
const LIMITE_REDEFINICAO: Limite = { quantidade: 3, janela: "1 hour" };

/** Só volta para páginas do próprio painel (evita redirecionamento aberto). */
function destinoSeguro(volta: FormDataEntryValue | null) {
  const v = typeof volta === "string" ? volta : "";
  return v.startsWith("/admin/") && !v.startsWith("//") && !v.includes("\\") ? v : "/admin/estoque";
}

/** Entrar no painel (11/26). Só o usuário com papel admin passa; qualquer outro é desconectado. */
export async function entrar(_anterior: EstadoEntrar, dados: FormData): Promise<EstadoEntrar> {
  // Com ADMIN_EMAIL, a tela pede só a senha; o e-mail digitado (se houver) é o único que volta para a tela.
  const digitado = String(dados.get("email") ?? "").trim().toLowerCase();
  const email = digitado || emailDoPainel() || "";
  const senha = String(dados.get("senha") ?? "");
  if (!email || !senha) return { erro: emailDoPainel() ? "Informe a senha." : "Informe o e-mail e a senha.", email: digitado };

  // Acima de 5 tentativas em 15 minutos no mesmo IP, nem chega ao Supabase.
  try {
    if (!(await dentroDoLimite("login", LIMITE_LOGIN))) return { erro: ERRO_LIMITE, email: digitado };
  } catch (e) {
    console.error("entrar limite", resumoErro(e));
    return { erro: "Não foi possível entrar agora. Tente de novo em alguns minutos.", email: digitado };
  }

  const loja = await cookies();
  if (dados.get("manter") === "on") loja.delete(COOKIE_SESSAO_CURTA);
  else loja.set(COOKIE_SESSAO_CURTA, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });

  const supabase = await clienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    // Só o código do Supabase (nunca a senha), para diagnosticar recusas que não são de senha errada.
    if (error.code !== "invalid_credentials") console.error("entrar", resumoErro(error));
    return { erro: error.status === 429 ? ERRO_LIMITE : emailDoPainel() && !digitado ? "Senha incorreta." : ERRO_CREDENCIAIS, email: digitado };
  }
  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { erro: ERRO_CREDENCIAIS, email: digitado };
  }
  redirect(destinoSeguro(dados.get("volta")));
}

/**
 * "Esqueci minha senha", só para o dono: o link vai sempre para o e-mail do admin no Supabase Auth; nada
 * do que vier no formulário é usado. Até 3 pedidos por hora por IP. A resposta é sempre a mesma (enviado
 * ou não, com ou sem admin, acima do limite ou não), sem mostrar o e-mail.
 */
export async function pedirRedefinicao(): Promise<EstadoEsqueci> {
  try {
    if (await dentroDoLimite("redefinicao", LIMITE_REDEFINICAO)) {
      const email = await emailDoAdmin();
      if (email) {
        const supabase = await clienteServidor();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/admin/auth/confirmar?proximo=/admin/redefinir-senha`,
        });
        if (error) console.error("pedirRedefinicao", resumoErro(error));
      }
    }
  } catch (e) {
    console.error("pedirRedefinicao", resumoErro(e));
  }
  return { enviado: true };
}

/** Nova senha (depois do link do e-mail). Mesmas regras do Supabase: 10+ caracteres, maiúscula, minúscula e número. */
export async function redefinirSenha(_anterior: EstadoRedefinir, dados: FormData): Promise<EstadoRedefinir> {
  const senha = String(dados.get("senha") ?? "");
  const confirmar = String(dados.get("confirmar") ?? "");
  if (senha.length < 10 || !/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha)) {
    return { erro: "Use pelo menos 10 caracteres, com letra maiúscula, minúscula e número." };
  }
  if (senha !== confirmar) return { erro: "As duas senhas não são iguais." };

  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.app_metadata?.role !== "admin") return { erro: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    if (error.code === "same_password") return { erro: "A nova senha precisa ser diferente da atual." };
    if (error.code === "weak_password") return { erro: "Essa senha é fraca. Use pelo menos 10 caracteres, com letra maiúscula, minúscula e número." };
    console.error("redefinirSenha", resumoErro(error));
    return { erro: "Não foi possível salvar a senha. Tente de novo." };
  }
  redirect("/admin/estoque");
}
