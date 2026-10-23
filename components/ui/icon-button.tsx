import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { NomeIcone } from "@/lib/icones";
import { Icon } from "./icon";

const VARIANTES = {
  /** Área de toque de 48 px sem fundo (voltar, compartilhar, menu, fechar). */
  ghost: "size-48 hover:bg-current/9",
  /** 40 px com borda ("⋯" da tabela do admin). */
  bordered: "size-40 rounded-10 border border-gray-200 bg-white text-gray-700 hover:bg-gray-100",
  /** 48 px com borda (fechar o painel lateral do admin). */
  "bordered-lg": "size-48 rounded-10 border border-gray-150 bg-white hover:bg-gray-100",
  /** 42px (40 + borda), fechar do painel da simulação (32). */
  "bordered-md": "size-42 rounded-10 border border-gray-150 bg-white hover:bg-gray-100",
} as const;

type Estilo = {
  icon: NomeIcone;
  /** Texto para leitores de tela: o botão só tem ícone. */
  label: string;
  iconSize?: number;
  fill?: boolean;
  variant?: keyof typeof VARIANTES;
  className?: string;
};

function classes(variant: keyof typeof VARIANTES, className?: string) {
  return cn("pressable inline-flex shrink-0 items-center justify-center rounded-pill", VARIANTES[variant], className);
}

export function IconButton({
  icon,
  label,
  iconSize,
  fill,
  variant = "ghost",
  className,
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "children"> & Estilo) {
  return (
    <button type={type} aria-label={label} title={label} className={classes(variant, className)} {...props}>
      <Icon name={icon} size={iconSize} fill={fill} />
    </button>
  );
}

export function IconLink({
  icon,
  label,
  iconSize,
  fill,
  variant = "ghost",
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, "children"> & Estilo) {
  return (
    <Link aria-label={label} title={label} className={classes(variant, className)} {...props}>
      <Icon name={icon} size={iconSize} fill={fill} />
    </Link>
  );
}
