"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Faixa com duas alças (preço, telas 02 e 21): trilho 4px #E2E6ED, trecho escolhido azul,
 * alças de 24px brancas com borda azul de 2px. São dois <input type="range"> nativos sobrepostos:
 * teclado, leitor de tela e toque funcionam sem código extra.
 *
 * `onChange` dispara a cada movimento; `onCommit` só ao soltar (para não navegar a cada pixel).
 */
type Props = {
  min: number;
  max: number;
  passo: number;
  valor: readonly [number, number];
  onChange?: (valor: [number, number]) => void;
  onCommit?: (valor: [number, number]) => void;
  rotulos: readonly [string, string];
  textoValor: (n: number) => string;
  /** Sombra nas alças (painel de filtros mobile); o desktop não tem. */
  sombra?: boolean;
  className?: string;
};

export function RangeSlider({ min, max, passo, valor, onChange, onCommit, rotulos, textoValor, sombra = false, className }: Props) {
  // Valor local enquanto arrasta; volta a seguir a prop quando ela muda (ex.: "Limpar").
  const [arrastando, setArrastando] = useState<[number, number] | null>(null);
  const [a, b] = arrastando ?? valor;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  function mover(indice: 0 | 1, bruto: number) {
    const proximo: [number, number] = indice === 0 ? [Math.min(bruto, b - passo), b] : [a, Math.max(bruto, a + passo)];
    setArrastando(proximo);
    onChange?.(proximo);
  }

  function soltar() {
    if (arrastando) onCommit?.(arrastando);
    setArrastando(null);
  }

  const alca = cn(
    "range-alca pointer-events-none absolute top-0 -left-12 h-28 w-[calc(100%+24px)] appearance-none bg-transparent",
    sombra && "range-alca-sombra",
  );

  return (
    <div className={cn("relative mx-12 h-28", className)}>
      <div aria-hidden="true" className="absolute inset-x-0 top-12 h-4 rounded-2 bg-gray-160" />
      <div aria-hidden="true" className="absolute top-12 h-4 bg-brand" style={{ left: `${pct(a)}%`, right: `${100 - pct(b)}%` }} />
      {([0, 1] as const).map((i) => (
        <input
          key={i}
          type="range"
          min={min}
          max={max}
          step={passo}
          value={i === 0 ? a : b}
          aria-label={rotulos[i]}
          aria-valuetext={textoValor(i === 0 ? a : b)}
          onChange={(e) => mover(i, Number(e.target.value))}
          onPointerUp={soltar}
          onKeyUp={soltar}
          onBlur={soltar}
          className={alca}
          // A alça de cima fica por cima quando as duas se encostam no fim do trilho.
          style={{ zIndex: i === 0 && a > max - passo * 2 ? 2 : 1 }}
        />
      ))}
    </div>
  );
}
