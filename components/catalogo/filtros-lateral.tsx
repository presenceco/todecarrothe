"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { hrefFiltros, type Filtros } from "@/lib/catalogo/filtros";
import { limparPainel, PainelFiltros, type MarcaContada } from "./painel-filtros";

/**
 * Coluna de filtros do desktop (tela 21): 296px, fixa ao rolar. Cada mudança já aplica (atualiza a URL);
 * a faixa de preço aplica ao soltar a alça.
 */
export function FiltrosLateral({
  filtros,
  marcas,
  anos,
  className,
}: {
  filtros: Filtros;
  marcas: readonly MarcaContada[];
  anos: { min: number; max: number };
  className?: string;
}) {
  const router = useRouter();
  const [, iniciar] = useTransition();
  // Estado otimista: a seleção aparece na hora, enquanto a lista do servidor chega.
  const [local, setLocal] = useState(filtros);
  const [origem, setOrigem] = useState(filtros);
  if (origem !== filtros) {
    setOrigem(filtros);
    setLocal(filtros);
  }

  function aplicar(f: Filtros) {
    setLocal(f);
    iniciar(() => router.replace(hrefFiltros(f), { scroll: false }));
  }

  return (
    <aside
      aria-label="Filtros"
      className={cn("sticky top-24 flex flex-col gap-24 rounded-16 bg-white p-24 shadow-card-soft", className)}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-22 font-extrabold italic">Filtros</h2>
        <button type="button" onClick={() => aplicar(limparPainel(local))} className="pressable text-14 font-semibold text-brand hover:underline">
          Limpar
        </button>
      </div>
      <PainelFiltros
        variante="lateral"
        filtros={local}
        onChange={aplicar}
        onPrecoCommit={aplicar}
        marcas={marcas}
        anos={anos}
      />
    </aside>
  );
}
