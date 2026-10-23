import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { COOKIE_SESSAO_CURTA, opcoesSessao } from "@/lib/admin/cookies";
import { configSupabase } from "./config";
import type { Database } from "./tipos-banco";

/**
 * Cliente com a sessão do usuário (cookies), para o painel: Server Components, Server Actions e Route Handlers.
 * Ler cookies torna a renderização dinâmica; use dentro de <Suspense> (Cache Components).
 */
export async function clienteServidor() {
  const { url, chave } = configSupabase();
  const loja = await cookies();
  return createServerClient<Database>(url, chave, {
    cookies: {
      getAll() {
        return loja.getAll();
      },
      setAll(paraGravar) {
        const curta = loja.has(COOKIE_SESSAO_CURTA);
        try {
          for (const { name, value, options } of paraGravar) loja.set(name, value, opcoesSessao(options, curta));
        } catch {
          // Em Server Components não dá para gravar cookies; o proxy renova a sessão a cada requisição.
        }
      },
    },
  });
}
