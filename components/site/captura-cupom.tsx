"use client";

import { useEffect } from "react";
import { normalizarCupom, REGEX_CUPOM } from "@/lib/cupom";
import { verificarCupom } from "@/lib/formularios/acoes-cupom";
import { comemorarCupom, guardarCupom, jaComemorouLink, marcarComemorouLink } from "@/lib/formularios/cupom-navegador";

let capturado = false;

/**
 * Link de indicação (?cupom=CODIGO em qualquer página do site, nunca no painel). Lê o parâmetro no navegador,
 * e não no servidor, para as páginas do catálogo continuarem estáticas. Valida, guarda na aba, comemora uma
 * vez e tira o parâmetro da URL. Cupom inválido é ignorado em silêncio.
 */
export function CapturaCupom() {
  useEffect(() => {
    if (capturado || window.location.pathname.startsWith("/admin")) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("cupom")) return;
    capturado = true;
    const codigo = normalizarCupom(url.searchParams.get("cupom"));
    url.searchParams.delete("cupom");
    void (async () => {
      if (REGEX_CUPOM.test(codigo)) {
        const { estado } = await verificarCupom(codigo).catch(() => ({ estado: "conferir" as const }));
        if (estado !== "invalido") guardarCupom(codigo, estado === "conferir");
        if (estado === "valido" && !jaComemorouLink()) {
          marcarComemorouLink();
          comemorarCupom();
        }
      }
      window.history.replaceState(window.history.state, "", url);
    })();
  }, []);
  return null;
}
