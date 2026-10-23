import { Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/cn";
import { AccountSheet } from "./account-sheet";
import type { UsuarioAdmin } from "./admin-sidebar";

/**
 * Cabeçalho preto das listas do admin mobile (12, 16, 18): símbolo, título em Exo 2, pílula de contagem,
 * ação à direita (busca) e avatar, que abre a Conta. `children` é a linha de chips de status.
 */
export function AdminMobileHeader({
  title,
  badge,
  badgeDestaque,
  action,
  usuario,
  children,
  className,
}: {
  title: string;
  /** Pílula ao lado do título ("38 veículos", "2 novos"). */
  badge?: string;
  /** Pílula azul dos "novos" (16, 18); a do estoque é cinza-escura (12). */
  badgeDestaque?: boolean;
  /** Botão à direita, antes do avatar (busca). */
  action?: React.ReactNode;
  usuario: UsuarioAdmin;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex-none bg-black pt-[calc(12px+env(safe-area-inset-top,0px))] pr-8 pl-16 text-white", className)}>
      <div className="flex h-48 items-center gap-10">
        <Simbolo className="size-32 flex-none" />
        {/*
          Título + pílula numa faixa de 48px que quebra linha e esconde o excesso: se a pílula não cabe
          inteira (ex.: "Consignações · 12 novas" em 390px), ela desce para a 2ª linha, que fica oculta.
          Busca e avatar nunca saem da tela.
        */}
        <div className="flex h-48 min-w-0 flex-1 flex-wrap items-center gap-x-10 overflow-hidden">
          <h1 className="flex h-48 min-w-0 items-center font-display text-22 font-extrabold italic">
            <span className="truncate">{title}</span>
          </h1>
          {badge && (
            <span className="flex h-48 items-center">
              <span
                className={cn(
                  "h-24 rounded-pill px-9 text-14 leading-24 font-semibold whitespace-nowrap",
                  badgeDestaque ? "bg-brand text-white" : "bg-ink-700 text-silver",
                )}
              >
                {badge}
              </span>
            </span>
          )}
        </div>
        {action}
        <AccountSheet usuario={usuario} />
      </div>
      {children && (
        <div className="-mr-8 flex gap-8 overflow-x-auto pt-12 pr-8 pb-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</div>
      )}
    </header>
  );
}
