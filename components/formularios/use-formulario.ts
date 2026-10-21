"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ErrosCampos } from "@/lib/formularios/esquemas";

/**
 * Estado dos formulários públicos: campos controlados (as máscaras e o que foi digitado continuam
 * intactos se o servidor devolver erro), erros por campo e envio em transição.
 * `validar` devolve os erros do formulário inteiro (Zod), ou null quando está tudo certo.
 */
export function useFormulario<T extends Record<string, unknown>>(inicial: T, validar: (campos: T) => ErrosCampos | null) {
  const [campos, setCampos] = useState(inicial);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [geral, setGeral] = useState<string>();
  const [enviando, iniciar] = useTransition();
  // Momento em que o formulário apareceu (proteção contra robôs que enviam na hora).
  const iniciadoEm = useRef(0);
  useEffect(() => {
    iniciadoEm.current = Date.now();
  }, []);

  /** Atualiza um campo; se ele estava com erro, revalida para o erro sumir assim que for corrigido. */
  function definir<K extends keyof T>(chave: K, valor: T[K]) {
    const proximo = { ...campos, [chave]: valor };
    setCampos(proximo);
    if (erros[chave as string]) {
      const novos = validar(proximo);
      setErros((atuais) => ({ ...atuais, [chave]: novos?.[chave as string] }));
    }
  }

  /** Valida tudo; com erro, mostra as mensagens e leva o foco ao primeiro campo com problema. */
  function conferir() {
    const encontrados = validar(campos);
    setErros(encontrados ?? {});
    setGeral(undefined);
    if (encontrados) focarPrimeiro(encontrados);
    return !encontrados;
  }

  /** Mostra os erros devolvidos pelo servidor. */
  function receber(resposta: { erros: ErrosCampos; geral?: string } | undefined) {
    if (!resposta) return;
    setErros(resposta.erros);
    setGeral(resposta.geral);
    if (Object.keys(resposta.erros).length) focarPrimeiro(resposta.erros);
  }

  return { campos, definir, erros, geral, setGeral, conferir, receber, enviando, iniciar, iniciadoEm };
}

function focarPrimeiro(erros: ErrosCampos) {
  const chaves = Object.keys(erros).filter((k) => erros[k]);
  const alvos = chaves
    .map((k) => document.getElementById(`campo-${k}`) ?? document.querySelector<HTMLElement>(`[name="${k}"]`))
    .filter((el): el is HTMLElement => !!el && el.offsetParent !== null);
  // O primeiro na ordem da página, não na ordem do esquema.
  alvos.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const alvo = alvos[0];
  if (!alvo) return;
  alvo.focus({ preventScroll: true });
  alvo.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
