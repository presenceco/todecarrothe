import { cn } from "@/lib/cn";
import { LOGOS_MARCAS } from "@/lib/marcas";

/**
 * Logo da marca ao lado do nome nos filtros do catálogo (public/marcas). `branca`: sobre o chip escolhido, de
 * fundo escuro. `reservar`: sem logo, guarda o espaço para os nomes da lista ficarem alinhados.
 */
export function LogoMarca({ slug, branca, reservar, className }: { slug: string; branca?: boolean; reservar?: boolean; className?: string }) {
  if (!LOGOS_MARCAS.has(slug)) return reservar ? <span aria-hidden="true" className={cn("size-20 flex-none", className)} /> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático, sem ganho no otimizador de imagens
    <img src={`/marcas/${slug}.svg`} alt="" width={20} height={20} className={cn("size-20 flex-none object-contain", branca && "brightness-0 invert", className)} />
  );
}
