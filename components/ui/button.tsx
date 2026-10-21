import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Botões das telas. A cor vem de `variant`; altura, raio, corpo e peso vêm de `size`.
 * Espaçamento interno e distância do ícone (px-*, gap-*) variam de tela para tela e ficam com quem usa.
 */
const VARIANTES = {
  /** Azul da marca ("Ver detalhes", "Ver N veículos", "Enviar para simulação"). Desabilitado fica cinza (tela 04). */
  primary:
    "bg-brand text-white hover:bg-brand-hover disabled:bg-gray-180 disabled:text-gray-500 aria-disabled:bg-gray-180 aria-disabled:text-gray-500",
  /** Contorno azul de 1,5 px ("Simular"). */
  outline: "border-[1.5px] border-brand text-brand hover:bg-brand-50",
  /** Verde do WhatsApp ("Fale no WhatsApp", "Chamar no WhatsApp"). */
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
  /** Contorno verde ("Tenho interesse", tela 03). */
  "whatsapp-outline": "border-[1.5px] border-whatsapp text-whatsapp-dark hover:bg-success-bg",
  /** Contorno cinza ("Cancelar", "Copiar dados", "Editar"). */
  neutral: "border border-gray-200 bg-white text-ink hover:bg-gray-100",
  /** Branco sobre azul ("Simular financiamento" no cartão "Quer financiar?"). */
  inverse: "bg-white text-brand hover:bg-brand-50",
} as const;

const TAMANHOS = {
  /** 40 px · raio 10 · 14/600 ("Editar" na tabela do admin). */
  sm: "h-40 rounded-10 text-14 font-semibold",
  /** 48 px · raio 12 · 15/600 (botões do cartão de veículo). */
  md: "h-48 rounded-12 text-15 font-semibold",
  /** 48 px · raio 12 · 15/700 ("Cadastrar veículo", WhatsApp do header desktop). */
  "md-bold": "h-48 rounded-12 text-15 font-bold",
  /** 52 px · raio 14 · 16/700 (rodapés fixos, painel inferior, "Cancelar"). */
  lg: "h-52 rounded-14 text-16 font-bold",
  /** 52 px · raio 14 · 15/700 (rodapé do detalhe do veículo, tela 03). */
  "lg-15": "h-52 rounded-14 text-15 font-bold",
  /** 52 px · raio 12 · 15/700 (CTA desktop, rodapé do painel lateral do admin). */
  "lg-r12": "h-52 rounded-12 text-15 font-bold",
} as const;

export type ButtonVariant = keyof typeof VARIANTES;
/** "custom": sem altura/raio/tipografia de base; `className` define tudo (casos responsivos). */
export type ButtonSize = keyof typeof TAMANHOS | "custom";

type Estilo = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: Estilo = {}) {
  return cn(
    "pressable inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    VARIANTES[variant],
    size !== "custom" && TAMANHOS[size],
    className,
  );
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & Estilo) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & Estilo) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

/** Link externo com aparência de botão (wa.me, mapa). Abre em nova aba. */
export function ButtonAnchor({ variant, size, className, ...props }: ComponentProps<"a"> & Estilo) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant, size, className })} {...props} />
  );
}
