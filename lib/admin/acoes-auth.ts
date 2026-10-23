"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import { clienteServidor } from "@/lib/supabase/servidor";
import { COOKIE_SESSAO_CURTA } from "./cookies";
import { emailDoPainel } from "./entrada";

export type EstadoEntrar = { erro?: string; email?: string };
export type EstadoEsqueci = { erro?: string; enviado?: boolean; email?: string };
export type EstadoRedefinir = { erro?: string };

const ERRO_CREDENCIAIS = "E-mail ou senha incorretos.";
const ERRO_LIMITE = "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";

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

  const loja = await cookies();
  if (dados.get("manter") === "on") loja.delete(COOKIE_SESSAO_CURTA);
  else loja.set(COOKIE_SESSAO_CURTA, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });

  const supabase = await clienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    // Só o código do Supabase (nunca a senha), para diagnosticar recusas que não são de senha errada.
    if (error.code !== "invalid_credentials") console.error("entrar", error.status, error.code, error.message);
    return { erro: error.status === 429 ? ERRO_LIMITE : emailDoPainel() && !digitado ? "Senha incorreta." : ERRO_CREDENCIAIS, email: digitado };
  }
  if (data.user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return { erro: ERRO_CREDENCIAIS, email: digitado };
  }
  redirect(destinoSeguro(dados.get("volta")));
}

/**
 * "Esqueci minha senha": pede ao Supabase o e-mail de redefinição. A resposta é a mesma exista ou não
 * a conta, para não revelar quais e-mails estão cadastrados.
 */
export async function pedirRedefinicao(_anterior: EstadoEsqueci, dados: FormData): Promise<EstadoEsqueci> {
  // Com ADMIN_EMAIL, o link vai para o e-mail do painel sem precisar digitá-lo (e sem mostrá-lo na tela).
  const digitado = String(dados.get("email") ?? "").trim().toLowerCase();
  const email = digitado || emailDoPainel() || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "Informe um e-mail válido.", email: digitado };
  const supabase = await clienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/auth/confirmar?proximo=/admin/redefinir-senha`,
  });
  if (error?.status === 429) return { erro: ERRO_LIMITE, email: digitado };
  if (error && error.status !== 400 && error.status !== 404) {
    console.error("pedirRedefinicao", error);
    return { erro: "Não foi possível enviar agora. Tente de novo em alguns minutos.", email: digitado };
  }
  return { enviado: true, email: digitado };
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
    console.error("redefinirSenha", error);
    return { erro: "Não foi possível salvar a senha. Tente de novo." };
  }
  redirect("/admin/estoque");
}
