import { Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/cn";

/**
 * Topo preto dos formulários com título (07, 24 e o mesmo padrão em 33/37): no mobile, alinhado à
 * esquerda logo abaixo da barra de título; no desktop, centralizado com o símbolo ao fundo.
 */
export function HeroFormulario({ titulo, texto, tituloClassName }: { titulo: string; texto: string; tituloClassName?: string }) {
  return (
    <div className="relative overflow-hidden bg-black px-20 pt-8 pb-28 text-white lg:px-64 lg:pt-48 lg:pb-88 lg:text-center">
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-page">
        <Simbolo className="absolute -top-20 -right-50 w-190 opacity-16 lg:-top-60 lg:right-80 lg:w-340 lg:opacity-12" />
      </div>
      <h1 className={cn("relative max-w-280 font-display text-30 leading-105 font-extrabold italic lg:max-w-none lg:text-56", tituloClassName)}>{titulo}</h1>
      <p className="relative mt-10 max-w-300 text-17 leading-140 text-silver lg:mt-14 lg:max-w-none lg:text-20 lg:leading-145">{texto}</p>
    </div>
  );
}
