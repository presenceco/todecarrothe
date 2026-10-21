import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
        try {
          for (const { name, value, options } of paraGravar) loja.set(name, value, options);
        } catch {
          // Em Server Components não dá para gravar cookies; o proxy renova a sessão a cada requisição.
        }
      },
    },
  });
}
