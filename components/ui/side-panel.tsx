import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconLink } from "./icon-button";
import { PanelKeyboard } from "./side-panel-keyboard";

/**
 * Painel lateral do admin desktop (telas 30 e 32): 540px à direita, sombra -24px 0 48px,
 * fundo rgba(8,12,22,.45) sobre a lista (o menu lateral de 248px fica de fora).
 *
 * O painel é a própria rota do item (/admin/pedidos/[id]): fechar volta para a lista (closeHref),
 * pelo X, pelo fundo, pela tecla Esc ou pelo "voltar" do navegador.
 */
export function SidePanel({
  titleId,
  closeHref,
  header,
  footer,
  children,
  className,
}: {
  /** id do título dentro de `header` (nome do painel para leitores de tela). */
  titleId: string;
  closeHref: string;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("side-panel fixed inset-0 left-248 z-40", className)}>
      <Link href={closeHref} aria-hidden="true" tabIndex={-1} scroll={false} className="side-panel-fundo absolute inset-0 bg-scrim-panel" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="side-panel-caixa absolute inset-y-0 right-0 flex w-540 flex-col bg-white shadow-panel"
      >
        <PanelKeyboard closeHref={closeHref} />
        <div className="flex items-start justify-between gap-16 border-b border-gray-120 px-28 pt-24 pb-20">
          <div className="min-w-0 flex-1">{header}</div>
          <IconLink href={closeHref} scroll={false} icon="close" label="Fechar" variant="bordered-lg" />
        </div>
        <div className="flex flex-1 flex-col gap-20 overflow-y-auto overscroll-contain px-28 py-20">{children}</div>
        {footer && <div className="border-t border-gray-120 px-28 pt-16 pb-24">{footer}</div>}
      </section>
    </div>
  );
}
