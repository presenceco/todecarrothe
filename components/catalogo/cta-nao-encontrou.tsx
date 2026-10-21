import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/cn";

/**
 * Chamada "Não encontrou seu carro?" no fim da lista.
 * Mobile (01): preto, 24px 20px 20px, título 26px, botão 48px.
 * Desktop (21): ocupa uma célula da grade, título 32px, botão 52px. Altura mínima de 484px: a referência
 * declara 420px sem border-box e soma o padding de 32px (docs/notas-referencia.md).
 */
export function CtaNaoEncontrou({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="cta-nao-encontrou"
      className={cn(
        "relative overflow-hidden rounded-16 bg-black px-20 pt-24 pb-20 text-white",
        "lg:flex lg:min-h-484 lg:flex-col lg:justify-end lg:px-28 lg:py-32",
        className,
      )}
    >
      <Simbolo className="pointer-events-none absolute -top-30 -right-40 w-180 opacity-16 lg:-top-50 lg:-right-60 lg:w-280 lg:opacity-18" />
      <h2 id="cta-nao-encontrou" className="relative max-w-240 font-display text-26 leading-110 font-extrabold italic lg:max-w-none lg:text-32 lg:leading-105">
        Não encontrou seu carro?
      </h2>
      <p className="relative mt-8 text-16 text-silver lg:mt-10 lg:text-17">A gente busca para você.</p>
      <ButtonLink
        href="/nao-encontrou"
        size="custom"
        className="relative mt-20 h-48 w-full gap-8 rounded-12 text-15 font-semibold lg:mt-24 lg:h-52 lg:font-bold"
      >
        Fazer pedido
        <Icon name="arrow_forward" size={20} />
      </ButtonLink>
    </section>
  );
}
