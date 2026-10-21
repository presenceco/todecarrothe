"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./tipos-banco";

/**
 * Cliente do navegador: uploads de fotos direto para o Storage. No admin usa a sessão (cookies); na
 * "Venda seu carro" o visitante não tem sessão e envia com o link assinado que o servidor gerou.
 */
export function clienteNavegador() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
