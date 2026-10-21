import Image from "next/image";
import { cn } from "@/lib/cn";

/** Símbolo + "TÔ DE CARRO SEMINOVOS" (wordmark), nos tamanhos das telas. */
const TAMANHOS = {
  /** Header mobile (01): símbolo 36, wordmark 30, distância 10. Abaixo de 360px o wordmark vai a 26 para não encostar no WhatsApp. */
  header: { simbolo: "size-36", wordmark: "h-30 max-[359px]:h-26", gap: "gap-10" },
  /** Barra do detalhe mobile (03): 28, 24, 8. */
  compact: { simbolo: "size-28", wordmark: "h-24", gap: "gap-8" },
  /** Menu do site (09): 34, 28, 10. */
  menu: { simbolo: "size-34", wordmark: "h-28", gap: "gap-10" },
  /** Header desktop (21): 48, 38, 14. */
  desktop: { simbolo: "size-48", wordmark: "h-38", gap: "gap-14" },
} as const;

export function Logo({ size = "header", className }: { size?: keyof typeof TAMANHOS; className?: string }) {
  const t = TAMANHOS[size];
  return (
    <span className={cn("flex items-center", t.gap, className)}>
      <Image src="/marca/simbolo.png" alt="" width={600} height={600} loading="eager" className={cn("block", t.simbolo)} />
      <Image
        src="/marca/wordmark.png"
        alt="Tô de Carro Seminovos"
        width={1385}
        height={272}
        loading="eager"
        className={cn("block w-auto", t.wordmark)}
      />
    </span>
  );
}

/** Símbolo sozinho (rodapé, marca d'água, menu lateral do admin). */
export function Simbolo({ className, alt = "" }: { className?: string; alt?: string }) {
  return <Image src="/marca/simbolo.png" alt={alt} width={600} height={600} className={cn("block", className)} />;
}
