import { cn } from "@/lib/cn";
import { loja } from "@/lib/loja";
import { AnoAtual } from "./ano-atual";
import { Simbolo } from "./logo";

/** Rodapé: mobile (01) 24px 20px, símbolo 30; desktop (21) 36px 64px, símbolo 36 e "© ano". */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("bg-black text-gray-350", className)}>
      <div className="mx-auto flex max-w-page items-center gap-12 px-20 py-24 text-14 lg:gap-16 lg:px-32 lg:py-36 xl:px-64">
        <Simbolo className="size-30 lg:size-36" />
        {/* Uma string só: texto partido em vários nós pode perder o kerning entre eles. */}
        <span className="flex-1">{`${loja.nome} · ${loja.cidade}`}</span>
        <span className="hidden lg:inline">
          © <AnoAtual />
        </span>
      </div>
    </footer>
  );
}
