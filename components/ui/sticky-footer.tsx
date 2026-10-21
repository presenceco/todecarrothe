import { cn } from "@/lib/cn";

/**
 * Rodapé fixo das páginas mobile (03, 04, 07, 15, 17, 19): branco, borda superior #E4E8EF,
 * padding 12px 16px 24px. A margem de baixo soma a área da barra de gestos do iPhone.
 * `shadow`: sombra para cima (telas 03, 15, 17 e 19).
 */
export function StickyFooter({
  children,
  shadow = false,
  className,
}: {
  children: React.ReactNode;
  shadow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 border-t border-gray-150 bg-white px-16 pt-12 pb-[calc(24px+env(safe-area-inset-bottom,0px))]",
        shadow && "shadow-footer",
        className,
      )}
    >
      {children}
    </div>
  );
}
