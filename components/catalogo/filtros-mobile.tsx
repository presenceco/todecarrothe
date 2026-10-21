"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetHandle } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { contarResultados, hrefFiltros, totalAtivos, type AtributosFiltro, type Filtros } from "@/lib/catalogo/filtros";
import { limparPainel, PainelFiltros, type MarcaContada } from "./painel-filtros";

/**
 * Botão de filtros (52px azul, telas 01 e 08) e o painel inferior da tela 02.
 * O painel trabalha num rascunho: "Ver N veículos" mostra a contagem ao vivo e só então aplica (navega).
 */
export function FiltrosMobile({
  filtros,
  atributos,
  marcas,
  anos,
  sombra = false,
}: {
  filtros: Filtros;
  atributos: readonly AtributosFiltro[];
  marcas: readonly MarcaContada[];
  anos: { min: number; max: number };
  /** Sombra azul do botão sobre o hero (tela 01). */
  sombra?: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(filtros);
  const ativos = totalAtivos(filtros);
  const total = contarResultados(atributos, rascunho);

  function abrir() {
    setRascunho(filtros);
    setAberto(true);
  }

  function aplicar() {
    setAberto(false);
    router.push(hrefFiltros(rascunho), { scroll: false });
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-label={ativos ? `Filtros, ${ativos} ${ativos === 1 ? "ativo" : "ativos"}` : "Filtros"}
        className={cn(
          "pressable relative flex size-52 flex-none items-center justify-center rounded-14 bg-brand text-white hover:bg-brand-hover",
          sombra && "shadow-filter-button",
        )}
      >
        <Icon name="tune" />
        {ativos > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-6 -right-6 box-border h-24 min-w-24 rounded-pill border-2 border-black bg-white px-4 text-center text-14 leading-20 font-bold text-brand"
          >
            {ativos}
          </span>
        )}
      </button>

      <Sheet
        open={aberto}
        onClose={() => setAberto(false)}
        labelledBy="titulo-filtros"
        className="flex h-[calc(100dvh-44px)] flex-col overflow-hidden rounded-t-24 bg-white"
      >
        <div data-sheet-drag className="flex-none">
          <SheetHandle className="mt-10" />
          <div className="flex items-center justify-between py-6 pr-8 pl-20">
            <h2 id="titulo-filtros" className="font-display text-24 font-extrabold italic">
              Filtros
            </h2>
            <div className="flex items-center">
              <button type="button" onClick={() => setRascunho(limparPainel(rascunho))} className="pressable px-8 text-15 font-semibold text-brand">
                Limpar
              </button>
              <IconButton icon="close" label="Fechar filtros" onClick={() => setAberto(false)} />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-20 overflow-y-auto overscroll-contain px-20 pt-4 pb-20">
          <PainelFiltros variante="sheet" filtros={rascunho} onChange={setRascunho} marcas={marcas} anos={anos} />
        </div>
        <div className="flex-none border-t border-gray-120 bg-white px-20 pt-12 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
          <Button size="lg" className="w-full" onClick={aplicar}>
            {total === 1 ? "Ver 1 veículo" : `Ver ${total} veículos`}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
