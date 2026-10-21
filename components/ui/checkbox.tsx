import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type InputProps = Omit<ComponentProps<"input">, "type" | "children" | "className">;

/**
 * Autorização dos formulários públicos (04, 07): caixa 24px, raio 7, borda 1,5px #8A93A3;
 * texto 400 15px/1.45 #2A3140. Marcada (não aparece nas telas): azul com ✓ branco.
 * Links dentro do texto abrem sem marcar a caixa.
 */
export function ConsentCheckbox({ children, className, ...props }: InputProps & { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-h-48 cursor-pointer items-center gap-12 px-4", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          "box-border flex size-24 flex-none items-center justify-center rounded-7 border-[1.5px] border-gray-400 bg-white text-transparent",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          "peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
          "peer-aria-invalid:border-danger",
        )}
      >
        <Icon name="check" size={18} className="[font-variation-settings:'wght'_600]" />
      </span>
      <span className="text-15 leading-140 text-ink-500">{children}</span>
    </label>
  );
}

/**
 * Marca do filtro desktop (21) e dos opcionais do cadastro (28): caixa 20px, raio 6, borda 1,5px #B8C0CC;
 * marcada: azul com ✓ branco.
 */
export function FilterCheckbox({
  children,
  count,
  className,
  ...props
}: InputProps & { children: React.ReactNode; count?: number; className?: string }) {
  return (
    <label className={cn("flex h-36 cursor-pointer items-center gap-10 text-15", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className={cn(
          "box-border flex size-20 flex-none items-center justify-center rounded-6 border-[1.5px] border-gray-250 text-transparent",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          "peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
        )}
      >
        <Icon name="check" size={16} />
      </span>
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-14 text-gray-400 tabular-nums">{count}</span>}
    </label>
  );
}
