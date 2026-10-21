import type { NomeIcone } from "@/lib/icones";

type IconProps = {
  name: NomeIcone;
  /** Tamanho em px (padrão 24, como nas referências). */
  size?: number;
  /** Versão preenchida (FILL 1). */
  fill?: boolean;
  className?: string;
};

/** Ícone decorativo da Material Symbols Rounded. Para ícone com significado próprio, rotule o elemento pai. */
export function Icon({ name, size = 24, fill = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={["icon", fill && "icon-fill", className].filter(Boolean).join(" ")}
      style={size === 24 ? undefined : { fontSize: size }}
    >
      {name}
    </span>
  );
}
