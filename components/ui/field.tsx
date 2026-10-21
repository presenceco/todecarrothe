import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Campo com rótulo (600 14px #3A4252), dica e erro, como nos formulários das telas 04, 07 e 15.
 * Erro (não aparece nas telas; padrão aprovado na dúvida 10): borda 2px #B42318 e mensagem 400 14px abaixo.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      <label htmlFor={htmlFor} className="text-14 font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-erro`} className="text-14 text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-dica`} className="text-14 text-gray-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Ids de acessibilidade ligando o campo à mensagem de erro ou dica. */
export function descricaoCampo(id: string, { error, hint }: { error?: string; hint?: React.ReactNode }) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-erro` : hint ? `${id}-dica` : undefined,
  } as const;
}

/**
 * Caixa dos campos: 52px, raio 12, borda 1px #D5DAE1, texto 16px (o iPhone não amplia a página ao focar).
 * Foco: borda 2px azul + halo de 4px (tela 04, "Nome completo").
 */
export function inputClasses({ invalid, className }: { invalid?: boolean; className?: string } = {}) {
  return cn(
    "box-border w-full rounded-12 border bg-white text-16 text-ink outline-none placeholder:text-gray-400",
    "transition-[box-shadow,border-color] duration-150 ease-out",
    invalid
      ? "border-2 border-danger focus:shadow-[0_0_0_4px_rgba(180,35,24,0.12)]"
      : "border-gray-200 focus:border-2 focus:border-brand focus:shadow-focus",
    "disabled:bg-gray-100 disabled:text-gray-500",
    className,
  );
}

type TextInputProps = Omit<ComponentProps<"input">, "id"> & {
  name: string;
  label: React.ReactNode;
  id?: string;
  hint?: React.ReactNode;
  error?: string;
  fieldClassName?: string;
};

export function TextInput({ name, label, id = `campo-${name}`, hint, error, fieldClassName, className, ...props }: TextInputProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} className={fieldClassName}>
      <input
        id={id}
        name={name}
        className={inputClasses({ invalid: !!error, className: cn("h-52 px-14", className) })}
        {...descricaoCampo(id, { error, hint })}
        {...props}
      />
    </Field>
  );
}

type TextareaProps = Omit<ComponentProps<"textarea">, "id"> & {
  name: string;
  label: React.ReactNode;
  id?: string;
  hint?: React.ReactNode;
  error?: string;
  fieldClassName?: string;
};

/** Área de texto (anotações da loja: mínimo 96px, 400 15px/1.45, telas 17 e 30). */
export function Textarea({ name, label, id = `campo-${name}`, hint, error, fieldClassName, className, ...props }: TextareaProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} className={fieldClassName}>
      <textarea
        id={id}
        name={name}
        className={inputClasses({
          invalid: !!error,
          className: cn("block min-h-96 resize-y px-14 py-12 text-15 leading-145", className),
        })}
        {...descricaoCampo(id, { error, hint })}
        {...props}
      />
    </Field>
  );
}
