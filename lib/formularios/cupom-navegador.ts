"use client";

import { useSyncExternalStore } from "react";

/**
 * Cupom guardado na aba (sessionStorage) e o aviso de comemoração. Todo acesso ao sessionStorage fica em
 * try/catch: a navegação anônima pode bloquear. Nesse caso, o cupom vale só enquanto a página estiver aberta.
 */
const CHAVE = "tdc-cupom";
const CHAVE_CONFERIR = "tdc-cupom-conferir";
const CHAVE_COMEMOROU = "tdc-cupom-comemorado";
const EVENTO_MUDOU = "tdc-cupom-mudou";
export const EVENTO_COMEMORAR = "tdc-cupom-comemorar";

export type CupomGuardado = {
  codigo: string;
  /** Guardado sem confirmação (limite de verificações): o servidor confere no envio. */
  conferir: boolean;
};

const memoria = new Map<string, string>();

function ler(chave: string) {
  try {
    return window.sessionStorage.getItem(chave) ?? memoria.get(chave) ?? null;
  } catch {
    return memoria.get(chave) ?? null;
  }
}

function gravar(chave: string, valor: string | null) {
  if (valor === null) memoria.delete(chave);
  else memoria.set(chave, valor);
  try {
    if (valor === null) window.sessionStorage.removeItem(chave);
    else window.sessionStorage.setItem(chave, valor);
  } catch {
    // Sem sessionStorage: fica só na memória da página.
  }
}

export function lerCupom(): CupomGuardado | null {
  const codigo = ler(CHAVE);
  return codigo ? { codigo, conferir: ler(CHAVE_CONFERIR) === "1" } : null;
}

export function guardarCupom(codigo: string, conferir = false) {
  gravar(CHAVE, codigo);
  gravar(CHAVE_CONFERIR, conferir ? "1" : null);
  window.dispatchEvent(new Event(EVENTO_MUDOU));
}

export function removerCupom() {
  gravar(CHAVE, null);
  gravar(CHAVE_CONFERIR, null);
  window.dispatchEvent(new Event(EVENTO_MUDOU));
}

/** O código que vai no envio do formulário: o guardado na aba ou o digitado. */
export function cupomParaEnvio(digitado: string) {
  return lerCupom()?.codigo ?? digitado;
}

/** Cupom guardado, atualizado quando muda (o do link chega depois de a página abrir). */
export function useCupomGuardado(): CupomGuardado | null {
  const retrato = useSyncExternalStore(
    (avisar) => {
      window.addEventListener(EVENTO_MUDOU, avisar);
      return () => window.removeEventListener(EVENTO_MUDOU, avisar);
    },
    () => {
      const c = lerCupom();
      return c ? `${c.conferir ? "1" : "0"}${c.codigo}` : "";
    },
    () => "",
  );
  return retrato ? { conferir: retrato[0] === "1", codigo: retrato.slice(1) } : null;
}

/** Cupom do link: comemora uma vez só por aba. */
export function jaComemorouLink() {
  return ler(CHAVE_COMEMOROU) === "1";
}

export function marcarComemorouLink() {
  gravar(CHAVE_COMEMOROU, "1");
}

/** Dispara a comemoração. `origem`: o campo do cupom (os confetes saem de perto dele). */
export function comemorarCupom(origem?: Element | null) {
  window.dispatchEvent(new CustomEvent(EVENTO_COMEMORAR, { detail: { origem: origem ?? null } }));
}

/** Conta o clique no "Tenho interesse" com keepalive: a chamada sobrevive à ida para o WhatsApp. */
export function registrarCliqueCupom(slug: string, codigo: string) {
  void fetch("/api/cupom/clique", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, codigo }),
  }).catch(() => {});
}
