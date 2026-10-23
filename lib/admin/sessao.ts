import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import type { UsuarioAdmin } from "@/components/admin/admin-sidebar";
import type { Contadores } from "@/lib/navegacao";
import { clienteServidor } from "@/lib/supabase/servidor";

/**
 * Exige o admin logado (páginas e Server Actions do painel). Uma vez por requisição (cache do React).
 * Sem sessão de admin, volta para o login. O RLS do banco é a segunda trava.
 */
export const exigirAdmin = cache(async () => {
  // Sempre na hora da requisição: a validação do token usa o relógio (Date.now) e não pode ir para o pré-render.
  await connection();
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || claims.app_metadata?.role !== "admin") redirect("/admin/login");
  const meta = (claims.user_metadata ?? {}) as { nome?: string; papel?: string };
  const usuario: UsuarioAdmin = { nome: meta.nome?.trim() || claims.email || "Admin", papel: meta.papel?.trim() || "Administrador" };
  return { supabase, usuario };
});

/** Itens com status Novo/Nova em cada lista (barra inferior e menu lateral). A aba Estoque não tem contador. */
export const contarNovos = cache(async (): Promise<Contadores> => {
  const { supabase } = await exigirAdmin();
  const [pedidos, simulacoes, consignacoes] = await Promise.all([
    supabase.from("pedidos_busca").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("simulacoes").select("id", { count: "exact", head: true }).eq("status", "nova"),
    supabase.from("consignacoes").select("id", { count: "exact", head: true }).eq("status", "nova"),
  ]);
  return { pedidos: pedidos.count ?? 0, simulacoes: simulacoes.count ?? 0, consignacoes: consignacoes.count ?? 0 };
});
