/** URL e chave pública do Supabase (as duas vão para o navegador; o acesso é limitado pelo RLS). */
export function configSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave || url.includes("SEU-PROJETO")) {
    throw new Error("Supabase não configurado: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.");
  }
  return { url, chave };
}

/** URL pública de um arquivo do bucket "veiculos" (público, nomes aleatórios). */
export function urlFotoVeiculo(path: string) {
  return `${configSupabase().url}/storage/v1/object/public/veiculos/${path}`;
}
