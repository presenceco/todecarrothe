import type { Metadata } from "next";
import { Entrada } from "@/components/admin/entrada";
import { FormEsqueci } from "@/components/admin/form-senha";

export const metadata: Metadata = { title: "Esqueci minha senha" };

/** Pedido de redefinição de senha, só para o dono do painel, no padrão do login (11/26). */
export default function EsqueciSenhaPage() {
  return (
    <Entrada titulo="Esqueci minha senha" subtitulo="Enviamos um link para o e-mail do dono do painel. Por ele você cria uma senha nova.">
      <FormEsqueci />
    </Entrada>
  );
}
