import { cn } from "@/lib/cn";
import { numeroPreco } from "@/lib/formato";

/** Preço com o "R$" menor, como nas telas. */
const TAMANHOS = {
  /** Cartão do catálogo (01, 21): 800 30px/1, "R$" 700 18px. */
  card: { valor: "text-30 leading-none", moeda: "mr-3 text-18 font-bold" },
  /** Detalhe: mobile (03) 800 38px/1 com "R$" 700 22px; desktop (22) 46px com "R$" 24px. */
  detail: { valor: "text-38 leading-none lg:text-46", moeda: "mr-4 text-22 font-bold lg:text-24" },
  /** Cartão do veículo na simulação desktop (23): 800 38px/1, "R$" 700 22px (sem crescer no desktop). */
  aside: { valor: "text-38 leading-none", moeda: "mr-4 text-22 font-bold" },
  /** Resumo do veículo nos formulários (04): 800 28px/1.1, "R$" 16px. */
  summary: { valor: "text-28 leading-110", moeda: "mr-3 text-16" },
} as const;

export function Price({
  valor,
  size = "card",
  className,
}: {
  valor: number;
  size?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const t = TAMANHOS[size];
  return (
    <div className={cn("font-extrabold tracking-price tabular-nums", t.valor, className)}>
      <span className={t.moeda}>R$</span>
      {numeroPreco(valor)}
    </div>
  );
}
