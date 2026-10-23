import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { hrefLista, POR_PAGINA, type FiltrosLista } from "@/lib/admin/filtros";
import { cn } from "@/lib/cn";

/** Rodapé das tabelas do admin (27: "1–8 de 38" e as setas; a desabilitada fica cinza). */
export function Paginacao({ base, filtros, total, className }: { base: string; filtros: FiltrosLista<string>; total: number; className?: string }) {
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const de = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const ate = Math.min(total, pagina * POR_PAGINA);
  const seta = (alvo: number, icone: "chevron_left" | "chevron_right", rotulo: string) => {
    const ativa = alvo >= 1 && alvo <= paginas && alvo !== pagina;
    const classes = cn("relative flex before:absolute before:-inset-10", ativa ? "text-ink hover:text-brand" : "pointer-events-none");
    return ativa ? (
      <Link href={hrefLista(base, filtros, { pagina: alvo })} aria-label={rotulo} scroll={false} className={classes}>
        <Icon name={icone} />
      </Link>
    ) : (
      <span aria-hidden="true" className={classes}>
        <Icon name={icone} />
      </span>
    );
  };
  return (
    <nav aria-label="Páginas" className={cn("flex h-52 items-center justify-between px-20 text-14 font-medium text-gray-500", className)}>
      <span>
        {de}–{ate} de {total}
      </span>
      <span className="flex gap-4">
        {seta(pagina - 1, "chevron_left", "Página anterior")}
        {seta(pagina + 1, "chevron_right", "Próxima página")}
      </span>
    </nav>
  );
}
