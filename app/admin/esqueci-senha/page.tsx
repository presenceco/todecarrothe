import type { Metadata } from "next";
import { Entrada } from "@/components/admin/entrada";
import { FormEsqueci } from "@/components/admin/form-senha";

export const metadata: Metadata = { title: "Esqueci minha senha" };

/** Pedido de redefinição de senha, no padrão do login (11/26). */
export default function EsqueciSenhaPage() {
  return (
    <Entrada titulo="Esqueci minha senha" subtitulo="Informe o e-mail do painel e enviamos um link para criar uma senha nova.">
      <FormEsqueci />
    </Entrada>
  );
}
