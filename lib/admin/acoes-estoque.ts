"use server";

import { refresh, updateTag } from "next/cache";
import { TAG_VEICULOS } from "@/lib/catalogo/consultas";
import { resumoErro } from "@/lib/log";
import { STATUS_VEICULO, type StatusVeiculo } from "@/lib/status";
import { exigirAdmin } from "./sessao";

export type Resultado = { ok: true } | { ok: false; erro: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Muda o status (reservar, vender, reativar). O catálogo e as listas do painel já mostram a mudança. */
export async function mudarStatusVeiculo(id: string, status: StatusVeiculo): Promise<Resultado> {
  if (!UUID.test(id) || !(status in STATUS_VEICULO)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const { error } = await supabase.from("veiculos").update({ status }).eq("id", id);
  if (error) {
    console.error("mudarStatusVeiculo", resumoErro(error));
    return { ok: false, erro: "Não foi possível mudar o status. Tente de novo." };
  }
  updateTag(TAG_VEICULOS);
  refresh();
  return { ok: true };
}

/**
 * Exclui o veículo e as fotos dele no Storage (sempre depois da confirmação da tela 14).
 * Apaga as fotos primeiro: se o Storage falhar, o veículo continua e nada fica órfão no banco.
 */
export async function excluirVeiculo(id: string): Promise<Resultado> {
  if (!UUID.test(id)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const { data: fotos, error: erroFotos } = await supabase.from("veiculo_fotos").select("path").eq("veiculo_id", id);
  if (erroFotos) return { ok: false, erro: "Não foi possível excluir. Tente de novo." };

  const caminhos = (fotos ?? []).map((f) => f.path);
  // Também apaga arquivos da pasta do veículo que não chegaram a ser registrados (envio interrompido).
  const { data: pasta } = await supabase.storage.from("veiculos").list(id, { limit: 100 });
  for (const arquivo of pasta ?? []) {
    const caminho = `${id}/${arquivo.name}`;
    if (!caminhos.includes(caminho)) caminhos.push(caminho);
  }
  if (caminhos.length) {
    const { error } = await supabase.storage.from("veiculos").remove(caminhos);
    if (error) {
      console.error("excluirVeiculo storage", resumoErro(error));
      return { ok: false, erro: "Não foi possível apagar as fotos. Tente de novo." };
    }
  }

  const { error } = await supabase.from("veiculos").delete().eq("id", id);
  if (error) {
    console.error("excluirVeiculo", resumoErro(error));
    return { ok: false, erro: "Não foi possível excluir. Tente de novo." };
  }
  updateTag(TAG_VEICULOS);
  refresh();
  return { ok: true };
}
