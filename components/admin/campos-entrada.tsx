"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Senha com mostrar/ocultar (11/26): oculta em 400 18px com espaçamento 0,2em; o olho (22px #8A93A3)
 * fica num alvo de 48px dentro do campo.
 */
export function CampoSenha({
  name,
  label,
  autoComplete,
  erro,
}: {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  erro?: boolean;
}) {
  const [visivel, setVisivel] = useState(false);
  const [preenchida, setPreenchida] = useState(false);
  const id = `campo-${name}`;
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={erro || undefined}
          onChange={(e) => setPreenchida(e.target.value.length > 0)}
          className={inputClasses({
            invalid: erro,
            className: cn("h-52 pr-52 pl-14", !visivel && preenchida ? "text-18 tracking-[0.2em]" : "text-16"),
          })}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          aria-controls={id}
          className="pressable absolute top-2 right-3 flex size-48 items-center justify-center rounded-10 text-gray-400 hover:text-gray-600 lg:right-0"
        >
          <Icon name={visivel ? "visibility_off" : "visibility"} size={22} />
        </button>
      </div>
    </Field>
  );
}

/** "Manter conectado" (11: caixa 24px raio 7, linha de 48px; 26: caixa 20px raio 6, linha de 20px). */
export function ManterConectado() {
  return (
    <label className="flex h-48 cursor-pointer items-center gap-10 text-14 font-medium whitespace-nowrap text-gray-700 lg:h-20 lg:gap-8">
      <input type="checkbox" name="manter" defaultChecked className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "box-border flex size-24 flex-none items-center justify-center rounded-7 border-[1.5px] border-gray-400 bg-white text-transparent lg:size-20 lg:rounded-6",
          "peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
        )}
      >
        <Icon name="check" size={18} className="lg:text-16!" />
      </span>
      Manter conectado
    </label>
  );
}

/** Botão principal das telas de entrada: 52px, raio 14 no mobile e 12 no desktop. */
export function BotaoEntrada({ children, pendente }: { children: React.ReactNode; pendente: boolean }) {
  return (
    <Button type="submit" size="custom" disabled={pendente} aria-busy={pendente} className="h-52 gap-8 rounded-14 text-16 font-bold lg:mt-6 lg:rounded-12">
      {pendente && <Icon name="progress_activity" size={20} className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Mensagem de erro ou aviso no topo do formulário. */
export function AvisoEntrada({ mensagem, tom = "erro" }: { mensagem?: string; tom?: "erro" | "info" }) {
  if (!mensagem) return null;
  return (
    <p
      role={tom === "erro" ? "alert" : "status"}
      className={cn(
        "flex gap-10 rounded-12 border px-14 py-12 text-15 leading-140",
        tom === "erro" ? "border-danger/20 bg-danger-bg text-danger" : "border-brand-200 bg-brand-25 text-ink-500",
      )}
    >
      <Icon name={tom === "erro" ? "error" : "info"} size={20} className={tom === "info" ? "text-brand" : undefined} />
      {mensagem}
    </p>
  );
}
