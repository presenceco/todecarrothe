import type { Metadata } from "next";
import { Entrada } from "@/components/admin/entrada";
import { FormEsqueci } from "@/components/admin/form-senha";
import { emailDoPainel } from "@/lib/admin/entrada";

export const metadata: Metadata = { title: "Esqueci minha senha" };

/** Pedido de redefinição de senha, no padrão do login (11/26). */
export default function EsqueciSenhaPage() {
  return (
    <Entrada
      titulo="Esqueci minha senha"
      subtitulo={
        emailDoPainel()
          ? "Enviamos um link para o e-mail cadastrado do painel. Por ele você cria uma senha nova."
          : "Informe o e-mail do painel e enviamos um link para criar uma senha nova."
      }
    >
      <FormEsqueci soSenha={!!emailDoPainel()} />
    </Entrada>
  );
}
