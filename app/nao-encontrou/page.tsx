import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { FormPedido } from "@/components/formularios/form-pedido";
import { HeroFormulario } from "@/components/formularios/hero";
import { BarraTitulo } from "@/components/formularios/partes";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { anoAtual } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Não encontrou seu carro?",
  description: "Conte o carro que você procura e a Tô de Carro busca para você. A resposta chega no WhatsApp.",
  alternates: { canonical: "/nao-encontrou" },
};

/** Anos para "Ano mínimo": do ano corrente até 2010 (o mesmo intervalo que o servidor aceita). */
async function anosMinimos() {
  "use cache";
  cacheLife("hours");
  const ate = anoAtual();
  return Array.from({ length: ate - 2010 + 1 }, (_, i) => String(ate - i)).map((a) => ({ value: a, label: a }));
}

/** Pedido de busca (07 mobile, 24 desktop). */
export default async function NaoEncontrouPage() {
  const anos = await anosMinimos();
  return (
    <>
      <SiteHeader soDesktop />
      <BarraTitulo titulo="Pedido de busca" como="p" />
      <main>
        <HeroFormulario titulo="Não encontrou seu carro?" texto="A gente busca para você. Conte o que procura e te avisamos no WhatsApp." />
        <div className="px-16 pt-20 lg:flex lg:justify-center lg:px-64 lg:pt-0 lg:pb-72">
          <div className="relative lg:-mt-48 lg:box-border lg:w-full lg:max-w-640 lg:rounded-16 lg:bg-white lg:p-32 lg:shadow-form-card">
            <FormPedido anos={anos} />
          </div>
        </div>
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
