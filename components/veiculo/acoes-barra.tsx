"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconButton } from "@/components/ui/icon-button";

/** Voltar (03): volta para a página anterior do próprio site (mantém os filtros); senão, vai ao estoque. */
export function BotaoVoltar() {
  const router = useRouter();
  return (
    <IconButton
      icon="arrow_back"
      label="Voltar"
      className="text-white"
      onClick={() => {
        const veioDoSite = document.referrer.startsWith(window.location.origin);
        if (veioDoSite && window.history.length > 1) router.back();
        else router.push("/");
      }}
    />
  );
}

/** Compartilhar (03): menu nativo do celular; sem ele, copia o link e avisa. */
export function BotaoCompartilhar({ titulo, url }: { titulo: string; url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // Cancelado pelo usuário.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="relative">
      <IconButton icon="share" label="Compartilhar" className="text-white" onClick={compartilhar} />
      <span
        role="status"
        className={`pointer-events-none absolute top-full right-4 mt-4 rounded-8 bg-white px-10 py-6 text-14 font-semibold whitespace-nowrap text-ink shadow-menu transition-opacity duration-150 ${copiado ? "opacity-100" : "opacity-0"}`}
      >
        {copiado ? "Link copiado" : ""}
      </span>
    </div>
  );
}
