"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Esc fecha o painel lateral; ao abrir, o foco vai para o painel (leitores de tela anunciam o título). */
export function PanelKeyboard({ closeHref }: { closeHref: string }) {
  const router = useRouter();
  const marcador = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const painel = marcador.current?.closest<HTMLElement>("[role='dialog']");
    if (painel) {
      painel.tabIndex = -1;
      painel.focus({ preventScroll: true });
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) router.push(closeHref, { scroll: false });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeHref, router]);

  return <span ref={marcador} hidden />;
}
