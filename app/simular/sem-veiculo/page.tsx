import type { Metadata } from "next";
import Link from "next/link";
import { FormSimulacao } from "@/components/formularios/form-simulacao";
import { BarraTitulo } from "@/components/formularios/partes";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Simular financiamento sem escolher o carro",
  description: "Informe o valor aproximado do carro e a Tô de Carro simula o financiamento com os bancos.",
  alternates: { canonical: "/simular/sem-veiculo" },
};

/** Simulação sem veículo escolhido (05b). O desktop segue o padrão da 23, sem a coluna do veículo. */
export default function SimularSemVeiculoPage() {
  return (
    <>
      <SiteHeader soDesktop />
      <BarraTitulo titulo="Simular financiamento" voltarPara="/simular" />
      <main>
        <nav aria-label="Você está em" className="mx-auto hidden max-w-[880px] items-center gap-8 py-24 text-14 font-medium text-gray-500 lg:flex">
          <Link href="/simular" className="flex items-center gap-8 hover:text-ink">
            <Icon name="arrow_back" size={18} />
            Simular financiamento
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-ink">
            Sem veículo escolhido
          </span>
        </nav>
        <div className="mx-auto flex max-w-[880px] flex-col gap-16 px-16 pt-20 lg:gap-24 lg:px-0 lg:pt-0 lg:pb-72">
          <p className="text-15 leading-145 text-gray-700 lg:hidden">Sem veículo escolhido. Informe o valor aproximado e a gente simula com os bancos.</p>
          <div className="hidden lg:block">
            <h1 className="font-display text-44 leading-105 font-extrabold italic">Simular financiamento</h1>
            <p className="mt-8 text-17 text-gray-600">Sem veículo escolhido. Informe o valor aproximado e a gente simula com os bancos.</p>
          </div>
          <FormSimulacao veiculo={null} />
        </div>
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
