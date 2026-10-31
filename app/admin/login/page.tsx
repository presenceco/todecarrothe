import type { Metadata } from "next";
import { Suspense } from "react";
import { Entrada } from "@/components/admin/entrada";
import { FormLogin } from "@/components/admin/form-login";

export const metadata: Metadata = { title: "Entrar" };

const TITULO = "Entrar no painel";
const SUBTITULO = "Gerencie estoque, pedidos e simulações.";

/** `volta` (página pedida antes do login) e `aviso` vêm da URL. */
async function ComParametros({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const volta = typeof sp.volta === "string" ? sp.volta : undefined;
  const aviso = typeof sp.aviso === "string" ? sp.aviso : undefined;
  return <FormLogin volta={volta} aviso={aviso} />;
}

/** Login do painel (11 mobile, 26 desktop). */
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Entrada titulo={TITULO} subtitulo={SUBTITULO}>
      <Suspense fallback={<FormLogin />}>
        <ComParametros searchParams={searchParams} />
      </Suspense>
    </Entrada>
  );
}
