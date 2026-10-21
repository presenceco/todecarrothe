"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { descricaoCampo, Field } from "./field";
import { Icon } from "./icon";

/**
 * Seleção com o visual das telas e o seletor nativo do sistema por cima (transparente).
 * No celular abre a roda/lista nativa; o <select> tem 16px, então o iPhone não amplia a página
 * mesmo quando o texto visível é de 15px (filtros).
 */
const TAMANHOS = {
  /** Formulários (07, 15): 52px, 400 16px, seta 22px #8A93A3. */
  lg: { caixa: "h-52 pr-10 pl-14 text-16", icone: 22, corIcone: "text-gray-400", corVazio: "text-gray-400" },
  /** Painel de filtros (02): 50px (48 + borda na referência), 500 15px, seta 20px #8A93A3. */
  md: { caixa: "h-50 pr-8 pl-12 text-15 font-medium", icone: 20, corIcone: "text-gray-400", corVazio: "text-gray-400" },
  /** Filtros do desktop (21): 46px (44 + borda na referência), 400 15px, texto e seta #6B7385. */
  sm: { caixa: "h-46 pr-8 pl-12 text-15", icone: 20, corIcone: "", corVazio: "text-gray-500" },
} as const;

export type OpcaoSelect = { value: string; label: string };

type Props = Omit<ComponentProps<"select">, "id" | "size" | "children"> & {
  name: string;
  options: readonly OpcaoSelect[];
  /** Texto quando nada está escolhido ("Selecione", "De", "Até"). */
  placeholder: string;
  /** Com rótulo visível vira um campo completo; sem ele, informe `aria-label`. */
  label?: React.ReactNode;
  id?: string;
  size?: keyof typeof TAMANHOS;
  hint?: React.ReactNode;
  error?: string;
  fieldClassName?: string;
};

export function SelectField({
  name,
  options,
  placeholder,
  label,
  id = `campo-${name}`,
  size = "lg",
  hint,
  error,
  fieldClassName,
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: Props) {
  const [interno, setInterno] = useState(String(defaultValue ?? ""));
  const atual = value !== undefined ? String(value) : interno;
  const escolhida = options.find((o) => o.value === atual);
  const t = TAMANHOS[size];
  const invalid = !!error;

  const caixa = (
    <div
      className={cn(
        "relative box-border flex w-full items-center justify-between rounded-12 border bg-white",
        "transition-[box-shadow,border-color] duration-150 ease-out",
        t.caixa,
        invalid
          ? "border-2 border-danger"
          : "border-gray-200 focus-within:border-2 focus-within:border-brand focus-within:shadow-focus",
        escolhida ? "text-ink" : t.corVazio,
        className,
      )}
    >
      <span className="truncate">{escolhida ? escolhida.label : placeholder}</span>
      <Icon name="expand_more" size={t.icone} className={t.corIcone} />
      <select
        id={id}
        name={name}
        value={atual}
        onChange={(e) => {
          if (value === undefined) setInterno(e.target.value);
          onChange?.(e);
        }}
        className="absolute inset-0 size-full cursor-pointer appearance-none text-16 opacity-0"
        {...descricaoCampo(id, { error, hint })}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (!label) return caixa;
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} className={fieldClassName}>
      {caixa}
    </Field>
  );
}
