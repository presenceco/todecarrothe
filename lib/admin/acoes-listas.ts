"use server";

import { refresh } from "next/cache";
import { resumoErro } from "@/lib/log";
import { STATUS_CONSIGNACAO, STATUS_PEDIDO, STATUS_SIMULACAO } from "@/lib/status";
import { exigirAdmin } from "./sessao";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LISTAS = {
  pedidos: { tabela: "pedidos_busca", status: STATUS_PEDIDO, anotacoes: true },
  simulacoes: { tabela: "simulacoes", status: STATUS_SIMULACAO, anotacoes: false },
  consignacoes: { tabela: "consignacoes", status: STATUS_CONSIGNACAO, anotacoes: true },
} as const;

export type Lista = keyof typeof LISTAS;

/** Muda o status com um toque (detalhe) ou na linha da tabela do desktop. Os contadores do menu acompanham. */
export async function mudarStatus(lista: Lista, id: string, status: string): Promise<{ ok: boolean }> {
  const def = LISTAS[lista];
  if (!def || !UUID.test(id) || !(status in def.status)) return { ok: false };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from(def.tabela).update({ status }).eq("id", id);
  if (error) {
    console.error("mudarStatus", lista, resumoErro(error));
    return { ok: false };
  }
  refresh();
  return { ok: true };
}

/** Anotações da loja (pedidos e consignações): salvas ao sair do campo. */
export async function salvarAnotacoes(lista: Lista, id: string, texto: string): Promise<{ ok: boolean }> {
  const def = LISTAS[lista];
  if (!def?.anotacoes || !UUID.test(id) || texto.length > 5000) return { ok: false };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from(def.tabela as "pedidos_busca" | "consignacoes").update({ anotacoes: texto }).eq("id", id);
  if (error) console.error("salvarAnotacoes", lista, resumoErro(error));
  return { ok: !error };
}
