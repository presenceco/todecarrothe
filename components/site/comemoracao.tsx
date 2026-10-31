"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon";
import { EVENTO_COMEMORAR } from "@/lib/formularios/cupom-navegador";

const CARTAO_MS = 3000;

/**
 * Uma comemoração: confetes (cerca de 2 s) e o cartão (3 s ou um toque). A camada não recebe toques; só o
 * cartão, que fica no topo e nunca cobre o botão de envio. Usa o popover nativo para ficar acima de tudo, até
 * dentro do painel do "Tenho interesse", que é um <dialog> modal. Com movimento reduzido, só o cartão.
 */
function Camada({ origem, onFim }: { origem: Element | null; onFim: () => void }) {
  const camada = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    camada.current?.showPopover?.();
    const fim = window.setTimeout(onFim, CARTAO_MS);
    let parar: (() => void) | undefined;
    let cancelada = false;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const r = origem?.getBoundingClientRect();
      const ponto = r ? { x: r.left + r.width / 2, y: r.top } : { x: window.innerWidth / 2, y: window.innerHeight * 0.35 };
      void import("./confete").then(({ dispararConfete }) => {
        if (!cancelada && tela.current) parar = dispararConfete(tela.current, ponto);
      });
    }
    return () => {
      cancelada = true;
      window.clearTimeout(fim);
      parar?.();
    };
  }, [origem, onFim]);

  return (
    <div
      ref={camada}
      popover="manual"
      className="pointer-events-none fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden border-0 bg-transparent p-0"
    >
      <canvas ref={tela} aria-hidden="true" className="absolute inset-0 size-full" />
      <button
        type="button"
        onClick={onFim}
        className="pointer-events-auto absolute top-[calc(16px+env(safe-area-inset-top,0px))] left-1/2 flex w-[min(340px,calc(100vw-32px))] -translate-x-1/2 items-center gap-12 rounded-16 border border-gray-150 bg-white p-16 text-left text-ink opacity-100 shadow-menu transition-opacity duration-200 starting:opacity-0"
      >
        <Icon name="check_circle" size={28} fill className="flex-none text-brand" />
        <span>
          <span className="block text-17 leading-125 font-bold">Cupom aplicado!</span>
          <span className="mt-2 block text-15 leading-135 text-gray-700">Que bom ter você aqui por indicação.</span>
        </span>
      </button>
    </div>
  );
}

/**
 * Ouve os pedidos de comemoração. Sem campo na tela (cupom do link), anuncia aqui para leitores de tela; com
 * campo, quem anuncia é o próprio campo do cupom, que continua acessível dentro do painel modal.
 */
export function Comemoracao() {
  const [ativa, setAtiva] = useState<{ id: number; origem: Element | null } | null>(null);
  const [aviso, setAviso] = useState("");
  const fim = useCallback(() => setAtiva(null), []);

  useEffect(() => {
    function ouvir(e: Event) {
      const origem = (e as CustomEvent<{ origem: Element | null }>).detail?.origem ?? null;
      setAtiva({ id: Date.now(), origem });
      setAviso(origem ? "" : "Cupom aplicado! Que bom ter você aqui por indicação.");
    }
    window.addEventListener(EVENTO_COMEMORAR, ouvir);
    return () => window.removeEventListener(EVENTO_COMEMORAR, ouvir);
  }, []);

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {aviso}
      </p>
      {ativa && createPortal(<Camada key={ativa.id} origem={ativa.origem} onFim={fim} />, ativa.origem?.closest("dialog") ?? document.body)}
    </>
  );
}
