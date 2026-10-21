import "server-only";
import { createClient } from "@supabase/supabase-js";
import { configSupabase } from "./config";
import type { Database } from "./tipos-banco";

/**
 * Cliente com a chave de serviço (service role): ignora o RLS. Só no servidor, para gravar os envios
 * públicos (simulação, pedido, consignação), emitir URLs assinadas de upload e o limite de envios.
 * O `server-only` faz o build falhar se este arquivo for importado em código de navegador.
 */
export function clienteServico() {
  const { url } = configSupabase();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local.");
  return createClient<Database>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
