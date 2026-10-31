import type { Metadata } from "next";
import { Suspense } from "react";
import { FormCupom } from "@/components/admin/cupons/form-cupom";
import { MolduraCupom } from "@/components/admin/cupons/moldura-cupom";
import { PaginaCarregando } from "@/components/admin/estados";
import { Cartao } from "@/components/admin/veiculo/blocos";
import { exigirAdmin } from "@/lib/admin/sessao";

export const metadata: Metadata = { title: "Criar cupom" };

async function Novo() {
  await exigirAdmin();
  return (
    <MolduraCupom titulo="Criar cupom">
      <Cartao className="lg:max-w-640">
        <FormCupom id={null} inicial={{ codigo: "", indicadorNome: "", indicadorWhatsapp: "", observacao: "", ativo: true }} />
      </Cartao>
    </MolduraCupom>
  );
}

/** Criar cupom de indicação. */
export default function NovoCupomPage() {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Novo />
    </Suspense>
  );
}
