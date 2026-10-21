import "server-only";
import { createClient } from "@supabase/supabase-js";
import { configSupabase } from "./config";
import type { Database } from "./tipos-banco";

/**
 * Leituras públicas do catálogo, sem sessão nem cookies: o resultado pode entrar em cache ("use cache")
 * e a página continua estática. O RLS limita a veículos disponíveis e publicados.
 */
export function clientePublico() {
  const { url, chave } = configSupabase();
  return createClient<Database>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
