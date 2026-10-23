import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO_CURTA } from "@/lib/admin/cookies";
import { clienteServidor } from "@/lib/supabase/servidor";

/** "Sair" (conta no mobile, rodapé do menu lateral no desktop). Só por POST, para um link não deslogar ninguém. */
export async function POST(request: NextRequest) {
  const supabase = await clienteServidor();
  // Só esta sessão: sair no computador não desconecta o celular.
  await supabase.auth.signOut({ scope: "local" });
  const resposta = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  resposta.cookies.delete(COOKIE_SESSAO_CURTA);
  return resposta;
}
