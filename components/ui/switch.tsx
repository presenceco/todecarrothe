import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Interruptor (tela 07, "Tenho carro para dar de entrada"): trilho 52×32 azul, botão 26px branco.
 * Desligado (não aparece nas telas): trilho #D5DAE1 e botão à esquerda.
 */
export function Switch({
  children,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type" | "role" | "children" | "className"> & { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-12", className)}>
      <span className="text-15 font-semibold">{children}</span>
      <span className="relative h-32 w-52 flex-none rounded-pill bg-gray-200 transition-colors duration-200 ease-out has-checked:bg-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand">
        <input type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 size-26 rounded-pill bg-white shadow-switch-knob transition-transform duration-200 ease-out peer-checked:translate-x-20"
        />
      </span>
    </label>
  );
}
