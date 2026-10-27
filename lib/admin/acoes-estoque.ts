"use server";

import { refresh, updateTag } from "next/cache";
import { TAG_VEICULOS } from "@/lib/catalogo/consultas";
import { BUCKET_OCULTO, BUCKET_PUBLICO, bucketDoVeiculo } from "@/lib/fotos-veiculo";
import { resumoErro } from "@/lib/log";
import { STATUS_VEICULO, type StatusVeiculo } from "@/lib/status";
import { arquivosDoVeiculo, desfazerMovimento, moverFotos } from "./fotos-veiculo";
import { exigirAdmin } from "./sessao";

export type Resultado = { ok: true } | { ok: false; erro: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Muda o status (reservar, vender, reativar). O catálogo e as listas do painel já mostram a mudança.
 * Se o carro entra ou sai do catálogo, as fotos mudam de bucket antes (público ↔ privado).
 */
export async function mudarStatusVeiculo(id: string, status: StatusVeiculo): Promise<Resultado> {
  if (!UUID.test(id) || !(status in STATUS_VEICULO)) return { ok: false, erro: "Pedido inválido." };
  const { supabase } = await exigirAdmin();
  const falha = { ok: false as const, erro: "Não foi possível mudar o status. Tente de novo." };
  const { data: atual } = await supabase.from("veiculos").select("status, publicado").eq("id", id).maybeSingle();
  if (!atual) return falha;

  const de = bucketDoVeiculo(atual);
  const para = bucketDoVeiculo({ status, publicado: atual.publicado });
  let movidos: string[] = [];
  if (de !== para) {
    try {
      movidos = await arquivosDoVeiculo(supabase, de, id);
    } catch (e) {
      console.error("mudarStatusVeiculo fotos", resumoErro(e));
      return falha;
    }
    if (!(await moverFotos(supabase, movidos, de, para))) return falha;
  }

  const { error } = await supabase.from("veiculos").update({ status }).eq("id", id);
  if (error) {
    console.error("mudarStatusVeiculo", resumoErro(error));
    await desfazerMovimento(supabase, movidos, de, para);
    return falha;
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

  // Nos dois buckets (público e privado), as registradas e as que não chegaram a ser (envio interrompido).
  for (const bucket of [BUCKET_PUBLICO, BUCKET_OCULTO] as const) {
    const caminhos = new Set((fotos ?? []).map((f) => f.path));
    const { data: pasta } = await supabase.storage.from(bucket).list(id, { limit: 100 });
    for (const arquivo of pasta ?? []) caminhos.add(`${id}/${arquivo.name}`);
    if (!caminhos.size) continue;
    const { error } = await supabase.storage.from(bucket).remove([...caminhos]);
    if (error) {
      console.error("excluirVeiculo storage", bucket, resumoErro(error));
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
