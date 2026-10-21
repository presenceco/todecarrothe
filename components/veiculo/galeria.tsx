"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { EtiquetaBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Etiqueta } from "@/lib/status";
import type { Foto } from "@/lib/tipos";

/**
 * Galeria do veículo, uma trilha só para os dois layouts:
 * - mobile (03): fundo preto, foto de 100% − 34px (a próxima aparece na borda), arrasta com o dedo,
 *   contador "1/12", etiqueta e pontos embaixo;
 * - desktop (22): foto 4:3 com raio 16, setas, contador e 6 miniaturas (a 6ª mostra "+N").
 */
export function Galeria({ fotos, etiqueta, nome }: { fotos: readonly Foto[]; etiqueta: Etiqueta; nome: string }) {
  const trilha = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const total = Math.max(fotos.length, 1);

  function irPara(i: number) {
    const el = trilha.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function aoRolar() {
    const el = trilha.current;
    const primeiro = el?.children[0] as HTMLElement | undefined;
    if (!el || !primeiro) return;
    const passo = primeiro.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setAtual(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / passo))));
  }

  // Pontos (mobile): até 5, com a janela acompanhando a foto atual.
  const nPontos = Math.min(total, 5);
  const pontoAtivo = total <= 5 ? atual : atual < 2 ? atual : atual > total - 3 ? 5 - (total - atual) : 2;
  const miniaturas = fotos.slice(0, 6);

  const contador = (
    <div
      aria-hidden="true"
      className="absolute top-12 right-12 rounded-pill bg-black/70 px-11 py-6 text-14 font-semibold text-white tabular-nums lg:top-20 lg:right-20 lg:px-14 lg:py-8 lg:text-15"
    >
      {atual + 1}/{total}
    </div>
  );

  const seta = (direcao: "anterior" | "proxima") => {
    const desabilitada = direcao === "anterior" ? atual === 0 : atual >= total - 1;
    return (
      <button
        type="button"
        aria-label={direcao === "anterior" ? "Foto anterior" : "Próxima foto"}
        disabled={desabilitada}
        onClick={() => irPara(atual + (direcao === "anterior" ? -1 : 1))}
        className={cn(
          "pressable absolute top-1/2 hidden size-52 -translate-y-1/2 items-center justify-center rounded-pill bg-white/95 text-ink shadow-gallery-arrow transition-opacity disabled:opacity-40 lg:flex",
          direcao === "anterior" ? "left-20" : "right-20",
        )}
      >
        <Icon name={direcao === "anterior" ? "chevron_left" : "chevron_right"} />
      </button>
    );
  };

  return (
    <section aria-roledescription="galeria" aria-label={`Fotos do ${nome}`} className="bg-black pb-12 lg:bg-transparent lg:pb-0">
      <div className="relative lg:overflow-hidden lg:rounded-16">
        <div
          ref={trilha}
          onScroll={aoRolar}
          tabIndex={0}
          aria-label="Fotos (deslize para ver mais)"
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] lg:gap-0 [&::-webkit-scrollbar]:hidden"
        >
          {(fotos.length ? fotos : [null]).map((foto, i) => (
            <div
              key={foto?.src ?? "sem-foto"}
              role="group"
              aria-roledescription="foto"
              aria-label={`Foto ${i + 1} de ${total}`}
              className="relative aspect-[4/3] w-[calc(100%-34px)] flex-none snap-start bg-hatch lg:w-full"
            >
              {foto && (
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(min-width: 1440px) 872px, (min-width: 1024px) 60vw, 100vw"
                  preload={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>
        {contador}
        {etiqueta !== "nenhuma" && <EtiquetaBadge etiqueta={etiqueta} className="absolute top-12 left-12 lg:hidden" />}
        {seta("anterior")}
        {seta("proxima")}
      </div>

      {nPontos > 1 && (
        <div aria-hidden="true" className="mt-12 flex justify-center gap-6 lg:hidden">
          {Array.from({ length: nPontos }, (_, i) => (
            <span
              key={i}
              className={cn("h-6 rounded-3 transition-[width,background-color] duration-200 ease-out", i === pontoAtivo ? "w-18 bg-white" : "w-6 bg-gray-600")}
            />
          ))}
        </div>
      )}

      {miniaturas.length > 1 && (
        <div className="mt-16 hidden grid-cols-6 gap-12 lg:grid">
          {miniaturas.map((foto, i) => {
            const mais = i === 5 && fotos.length > 6;
            const ativa = mais ? atual >= 5 : atual === i;
            return (
              <button
                key={foto.src}
                type="button"
                onClick={() => irPara(i)}
                aria-label={mais ? `Ver mais ${fotos.length - 6} fotos` : `Ver foto ${i + 1}`}
                aria-current={ativa ? "true" : undefined}
                className={cn("pressable relative aspect-[4/3] overflow-hidden rounded-10 bg-hatch-sm", ativa && "shadow-ring-brand")}
              >
                <Image src={foto.src} alt="" fill sizes="140px" className="object-cover" />
                {mais && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-10 bg-black/60 text-15 font-bold text-white">
                    +{fotos.length - 6}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
