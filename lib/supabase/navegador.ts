"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./tipos-banco";

/** Cliente do navegador com a sessão do admin (cookies): uploads de fotos direto para o Storage. */
export function clienteNavegador() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
