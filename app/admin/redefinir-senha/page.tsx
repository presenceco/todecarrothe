import type { Metadata } from "next";
import { Entrada } from "@/components/admin/entrada";
import { FormRedefinir } from "@/components/admin/form-senha";

export const metadata: Metadata = { title: "Nova senha" };

/** Nova senha depois do link do e-mail. O proxy só deixa entrar com a sessão de recuperação. */
export default function RedefinirSenhaPage() {
  return (
    <Entrada titulo="Criar nova senha" subtitulo="Escolha a senha que você vai usar para entrar no painel.">
      <FormRedefinir />
    </Entrada>
  );
}
