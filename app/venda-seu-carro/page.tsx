import type { Metadata } from "next";
import { FormConsignacao } from "@/components/formularios/form-consignacao";
import { HeroFormulario } from "@/components/formularios/hero";
import { BarraTitulo } from "@/components/formularios/partes";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Venda seu carro",
  description: "A Tô de Carro compra seu carro à vista, aceita na troca ou vende para você em consignação. Envie os dados e combine a avaliação.",
  alternates: { canonical: "/venda-seu-carro" },
};

const FORMAS = [
  { titulo: "Venda direta", texto: "Precisa do dinheiro rápido? A gente avalia e compra seu carro, com pagamento à vista." },
  {
    titulo: "Troca",
    texto: "Use seu carro na compra de outro do nosso estoque. Se o novo custar mais, a gente negocia a diferença. Se custar menos, você sai com o troco.",
  },
  {
    titulo: "Consignação",
    texto: "A gente anuncia seu carro nos principais portais e te passa cada proposta. Vendeu, você recebe o valor à vista. Mais segurança e melhor retorno para você.",
  },
];

const PASSOS = ["Você envia os dados do carro", "A gente avalia na loja", "Fechamos o negócio do jeito que você escolheu"];

/** Título de seção (padrão da ficha do detalhe): 700 17px no mobile, Exo 24px no desktop. */
const TITULO_SECAO = "text-17 font-bold lg:font-display lg:text-24 lg:font-extrabold lg:italic";

/** Venda seu carro (33 mobile, 37 desktop), conforme a especificação da seção 10. */
export default function VendaSeuCarroPage() {
  return (
    <>
      <SiteHeader soDesktop />
      <BarraTitulo titulo="Venda seu carro" como="p" />
      <main>
        <HeroFormulario
          titulo="Venda seu carro com a Tô de Carro"
          texto="Você escolhe o melhor negócio: a gente compra, aceita na troca ou vende para você."
          tituloClassName="max-w-320"
        />
        <div className="mx-auto flex max-w-[880px] flex-col gap-24 px-16 pt-24 lg:gap-40 lg:px-0 lg:pt-56 lg:pb-72">
          <section aria-labelledby="titulo-formas">
            <h2 id="titulo-formas" className={TITULO_SECAO}>
              Formas de vender
            </h2>
            <ol className="mt-12 flex flex-col gap-8 lg:mt-20 lg:grid lg:grid-cols-3 lg:gap-16">
              {FORMAS.map((f, i) => (
                <li key={f.titulo} className="flex gap-14 rounded-16 border border-gray-150 bg-white p-16 lg:block lg:p-24">
                  <span aria-hidden="true" className="w-36 flex-none font-display text-28 leading-none font-extrabold text-brand italic lg:block lg:w-auto lg:text-32">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-16 font-bold lg:mt-12 lg:text-17">{f.titulo}</h3>
                    <p className="mt-4 text-15 leading-145 text-gray-700 lg:mt-6">{f.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="titulo-como-funciona">
            <h2 id="titulo-como-funciona" className={TITULO_SECAO}>
              Como funciona
            </h2>
            <ol className="mt-12 flex flex-col gap-14 rounded-16 border border-gray-150 bg-white p-16 lg:mt-20 lg:grid lg:grid-cols-3 lg:gap-24 lg:p-24">
              {PASSOS.map((passo, i) => (
                <li key={passo} className="flex items-center gap-12">
                  <span aria-hidden="true" className="flex size-32 flex-none items-center justify-center rounded-pill bg-brand text-15 font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-15 leading-140 font-semibold text-ink-500">{passo}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* A especificação não dá título visível ao formulário: o primeiro cartão ("Como prefere vender?") abre a seção. */}
          <section aria-labelledby="titulo-avaliacao">
            <h2 id="titulo-avaliacao" className="sr-only">
              Dados para a avaliação
            </h2>
            <FormConsignacao />
          </section>
        </div>
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
