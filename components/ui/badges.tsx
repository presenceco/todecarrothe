import { cn } from "@/lib/cn";
import { CLASSES_TOM, ETIQUETAS, type Tom } from "@/lib/status";
import { Icon } from "./icon";

const PADDING_STATUS = {
  /** 4px 10px (painel de ações, tela 13) */
  sm: "px-10 py-4",
  /** 5px 10px (listas mobile do admin) */
  md: "px-10 py-5",
  /** 5px 11px (tabelas do admin desktop) */
  lg: "px-11 py-5",
} as const;

/** Selo de status com ponto ("● Disponível"). */
export function StatusBadge({
  tom,
  children,
  size = "md",
  className,
}: {
  tom: Tom;
  children: React.ReactNode;
  size?: keyof typeof PADDING_STATUS;
  className?: string;
}) {
  const cores = CLASSES_TOM[tom];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-6 rounded-pill text-14 font-semibold whitespace-nowrap",
        PADDING_STATUS[size],
        cores.fundo,
        cores.texto,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-6 rounded-3", cores.ponto)} />
      {children}
    </span>
  );
}

/**
 * Contador azul de itens novos (menu lateral do admin: 26×24; barra inferior: 24×22).
 * Acima de 99 mostra "99+" para não passar da largura da aba; o leitor de tela ouve o número exato.
 */
export function CountBadge({ total, rotulo, size = "md", className }: { total: number; rotulo?: string; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      className={cn(
        "box-border rounded-pill bg-brand text-center text-14 font-bold whitespace-nowrap text-white",
        size === "md" ? "h-24 min-w-26 px-7 leading-24" : "h-22 min-w-24 px-6 leading-22",
        className,
      )}
    >
      <span aria-hidden="true">{total > 99 ? "99+" : total}</span>
      <span className="sr-only">
        {total} {rotulo}
      </span>
    </span>
  );
}

/**
 * Etiqueta do veículo (Destaque prateado, Novidade azul, Baixa km preto).
 * sombra: sobre a foto (cartão, galeria) · contorno: no painel do detalhe desktop (22), borda #D9DCE1.
 */
export function EtiquetaBadge({
  etiqueta,
  estilo = "sombra",
  className,
}: {
  etiqueta: keyof typeof ETIQUETAS;
  estilo?: "sombra" | "contorno";
  className?: string;
}) {
  const { rotulo, classes } = ETIQUETAS[etiqueta];
  return (
    <span
      className={cn(
        "rounded-8 px-11 py-7 text-14 leading-none font-bold",
        estilo === "sombra" ? "shadow-badge" : "border border-gray-190",
        classes,
        className,
      )}
    >
      {rotulo}
    </span>
  );
}

/** Contador de fotos sobre a foto do cartão ("📷 12"). */
export function FotoCountBadge({ total, className }: { total: number; className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-4 rounded-pill bg-black/65 px-9 py-5 text-14 font-semibold text-white",
        className,
      )}
    >
      <Icon name="photo_camera" size={16} />
      <span className="sr-only">Fotos:</span>
      {total}
    </span>
  );
}
