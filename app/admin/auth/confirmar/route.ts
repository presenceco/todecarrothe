import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServidor } from "@/lib/supabase/servidor";

/**
 * Destino do link do e-mail de redefinição de senha. Troca o código (PKCE) ou o token do e-mail por uma
 * sessão e segue para `proximo` (só páginas do painel). Link vencido ou usado: volta ao login com aviso.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const proximo = url.searchParams.get("proximo") ?? "";
  const destino = proximo.startsWith("/admin/") && !proximo.startsWith("//") ? proximo : "/admin/estoque";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await clienteServidor();
  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && tipo) ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;

  return NextResponse.redirect(new URL(ok ? destino : "/admin/login?aviso=link-expirado", request.url));
}
