"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Painel modal sobre a página, em <dialog> nativo (foco preso, Esc, fundo inerte).
 *
 * - side="bottom": painel inferior (filtros 02, ações 13, conta 20). Arrastar para baixo fecha;
 *   um gesto rápido basta (velocidade), não precisa passar de um limite de distância.
 * - side="right": gaveta lateral preta (menu do site 09). Arrastar para a direita fecha.
 *
 * Fundo: rgba(5,8,15,.6). Entrada 280ms com a curva de gaveta do iOS; saída mais curta (200ms).
 */
type Props = {
  open: boolean;
  onClose: () => void;
  side?: "bottom" | "right";
  /** Nome do painel para leitores de tela (ou use `labelledBy`). */
  label?: string;
  labelledBy?: string;
  /** Classes da caixa do painel (largura, altura, cor, raio, padding). */
  className?: string;
  /** Painel inferior no mobile e caixa de 440px no centro da tela no desktop (confirmações). */
  centroNoDesktop?: boolean;
  children: React.ReactNode;
};

const SAIDA_MS = 200;
const VELOCIDADE_FECHAR = 0.11; // px/ms
const FRACAO_FECHAR = 0.25;

export function Sheet({ open, onClose, side = "bottom", label, labelledBy, className, centroNoDesktop, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const [fechando, setFechando] = useState(false);
  const arrasto = useRef<{ id: number; inicio: number; t0: number; delta: number } | null>(null);

  // Abre/fecha o <dialog> conforme `open`, com animação de saída antes do close().
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setFechando(false);
      dialog.showModal();
      painelRef.current?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      setFechando(true);
      const t = window.setTimeout(() => {
        dialog.close();
        setFechando(false);
        if (painelRef.current) painelRef.current.style.transform = "";
      }, SAIDA_MS);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const pedirFechar = useCallback(() => onClose(), [onClose]);

  const eixo = side === "bottom" ? "Y" : "X";

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const alvo = e.target as HTMLElement;
    if (arrasto.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    // Botões, links e campos continuam funcionando normalmente.
    if (alvo.closest("button, a, input, select, textarea, label")) return;
    // No painel inferior, só a alça e o título arrastam ([data-sheet-drag]); o conteúdo rola.
    // Na gaveta lateral, qualquer área livre arrasta na horizontal (a vertical fica com a rolagem).
    if (side === "bottom" && !alvo.closest("[data-sheet-drag]")) return;
    // Centralizado no desktop não arrasta.
    if (centroNoDesktop && matchMedia("(min-width: 1024px)").matches) return;
    arrasto.current = { id: e.pointerId, inicio: eixo === "Y" ? e.clientY : e.clientX, t0: performance.now(), delta: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const a = arrasto.current;
    const painel = painelRef.current;
    if (!a || a.id !== e.pointerId || !painel) return;
    const bruto = (eixo === "Y" ? e.clientY : e.clientX) - a.inicio;
    // Para o lado de abrir, resiste (atrito) em vez de parar seco.
    a.delta = bruto >= 0 ? bruto : -Math.sqrt(-bruto) * 2;
    painel.style.transition = "none";
    painel.style.transform = `translate${eixo}(${a.delta}px)`;
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    const a = arrasto.current;
    const painel = painelRef.current;
    if (!a || a.id !== e.pointerId || !painel) return;
    arrasto.current = null;
    const tamanho = eixo === "Y" ? painel.offsetHeight : painel.offsetWidth;
    const velocidade = a.delta / Math.max(1, performance.now() - a.t0);
    painel.style.transition = "";
    if (a.delta > tamanho * FRACAO_FECHAR || (a.delta > 8 && velocidade > VELOCIDADE_FECHAR)) {
      // Sai a partir de onde o dedo soltou, sem voltar ao zero antes.
      painel.style.transform = `translate${eixo}(100%)`;
      pedirFechar();
    } else {
      painel.style.transform = "";
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      aria-labelledby={labelledBy}
      data-side={side}
      data-centro={centroNoDesktop || undefined}
      data-closing={fechando || undefined}
      onCancel={(e) => {
        e.preventDefault();
        pedirFechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) pedirFechar();
      }}
      className="sheet"
    >
      <div
        ref={painelRef}
        tabIndex={-1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className={cn("sheet-painel outline-none", className)}
      >
        {children}
      </div>
    </dialog>
  );
}

/** Alça do painel inferior: 40×5, raio 3, #D5DAE1. */
export function SheetHandle({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("mx-auto h-5 w-40 rounded-3 bg-gray-200", className)} />;
}
