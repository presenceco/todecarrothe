import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO_CURTA, opcoesSessao } from "@/lib/admin/cookies";

/** Páginas do admin abertas sem sessão: entrar e o fluxo de "Esqueci minha senha". */
const PUBLICAS = ["/admin/login", "/admin/esqueci-senha", "/admin/auth/confirmar"];

/**
 * Proxy do admin: renova a sessão do Supabase a cada requisição (os Server Components não gravam cookies)
 * e faz a checagem otimista de acesso. A checagem definitiva fica nas páginas e Server Actions
 * (`exigirAdmin`) e no RLS do banco.
 */
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });
  const curta = request.cookies.has(COOKIE_SESSAO_CURTA);

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(paraGravar) {
        for (const { name, value } of paraGravar) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of paraGravar) resposta.cookies.set(name, value, opcoesSessao(options, curta));
      },
    },
  });

  // getClaims valida o JWT (e renova a sessão vencida). Não usar getSession aqui: ela não valida nada.
  const { data } = await supabase.auth.getClaims();
  const admin = data?.claims?.app_metadata?.role === "admin";
  const { pathname, search } = request.nextUrl;
  const publica = PUBLICAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const redirecionar = (destino: string) => {
    const r = NextResponse.redirect(new URL(destino, request.url));
    for (const c of resposta.cookies.getAll()) r.cookies.set(c);
    return r;
  };

  if (!admin && !publica) {
    // /admin/redefinir-senha também exige sessão: ela vem do link do e-mail (auth/confirmar).
    const volta = pathname === "/admin" ? "" : `?volta=${encodeURIComponent(pathname + search)}`;
    return redirecionar(`/admin/login${volta}`);
  }
  if (admin && (pathname === "/admin" || pathname === "/admin/login")) return redirecionar("/admin/estoque");
  return resposta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
