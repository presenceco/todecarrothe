import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Chip de filtro em pílula (marcas na tela 01 e no painel de filtros, tela 02).
 * Selecionado fica azul; "Todas" usa o tom preto.
 */
export function chipClasses({
  selected,
  tone = "brand",
  size = "md",
  className,
}: {
  selected: boolean;
  tone?: "brand" | "black";
  /** md: 0 18px e 50px de altura (tela 01; 48 + borda, ver docs/notas-referencia.md) · sm: 0 16px, 48px (painel de filtros) */
  size?: "md" | "sm";
  className?: string;
}) {
  return cn(
    "pressable box-border flex flex-none items-center gap-4 rounded-pill border text-14 font-semibold whitespace-nowrap",
    size === "md" ? "h-50 px-18" : "h-48 px-16",
    selected
      ? tone === "black"
        ? "border-black bg-black text-white"
        : "border-brand bg-brand text-white"
      : "border-gray-200 bg-white text-ink hover:border-gray-400",
    className,
  );
}

export function ChipLink({
  selected,
  tone,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { selected: boolean; tone?: "brand" | "black"; size?: "md" | "sm" }) {
  return (
    <Link aria-current={selected ? "true" : undefined} className={chipClasses({ selected, tone, size, className })} {...props} />
  );
}

/** Chip de status sobre fundo preto (cabeçalho das listas mobile do admin, telas 12, 16 e 18). */
export function DarkChipLink({
  selected,
  count,
  children,
  className,
  ...props
}: ComponentProps<typeof Link> & { selected: boolean; count: number }) {
  return (
    <Link
      aria-current={selected ? "page" : undefined}
      className={cn(
        "pressable box-border flex h-48 flex-none items-center gap-6 rounded-pill border px-16 text-14 font-semibold whitespace-nowrap",
        selected ? "border-white bg-white text-ink" : "border-gray-700 text-white hover:border-gray-500",
        className,
      )}
      {...props}
    >
      {children}
      <span className="font-medium opacity-70">{count}</span>
    </Link>
  );
}

/** Abas de status com contagem no admin desktop (telas 27, 29 e 31). */
export function SegmentedTabs({
  items,
  label,
  className,
}: {
  items: { href: string; rotulo: string; count: number; selected: boolean }[];
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "flex max-w-full gap-4 overflow-x-auto rounded-12 border border-gray-150 bg-white p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.selected ? "page" : undefined}
          className={cn(
            "pressable flex h-34 items-center gap-6 rounded-9 px-14 text-14 font-semibold whitespace-nowrap",
            item.selected ? "bg-ink text-white" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {item.rotulo}
          <span className="font-medium opacity-70">{item.count}</span>
        </Link>
      ))}
    </nav>
  );
}
