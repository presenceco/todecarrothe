import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET_OCULTO, type BucketVeiculo } from "@/lib/fotos-veiculo";
import { resumoErro } from "@/lib/log";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/tipos-banco";

type Cliente = SupabaseClient<Database>;

/** Caminhos dos arquivos na pasta do veículo dentro de um bucket. */
export async function arquivosDoVeiculo(supabase: Cliente, bucket: BucketVeiculo, id: string) {
  const { data, error } = await supabase.storage.from(bucket).list(id, { limit: 100 });
  if (error) throw new Error(`listar ${bucket}: ${resumoErro(error).message}`);
  return data.filter((a) => a.id !== null).map((a) => `${id}/${a.name}`);
}

/**
 * Move arquivos entre os buckets do estoque, mantendo o caminho. Se algum falhar, desfaz os que já foram e
 * devolve false: as fotos nunca ficam divididas entre os dois buckets.
 */
export async function moverFotos(supabase: Cliente, caminhos: string[], de: BucketVeiculo, para: BucketVeiculo) {
  const movidos: string[] = [];
  for (const caminho of caminhos) {
    const { error } = await supabase.storage.from(de).move(caminho, caminho, { destinationBucket: para });
    if (error) {
      console.error("moverFotos", de, para, resumoErro(error));
      await desfazerMovimento(supabase, movidos, de, para);
      return false;
    }
    movidos.push(caminho);
  }
  return true;
}

/** Devolve ao bucket de origem arquivos movidos por `moverFotos` (quando o passo seguinte falha). */
export async function desfazerMovimento(supabase: Cliente, caminhos: string[], de: BucketVeiculo, para: BucketVeiculo) {
  for (const caminho of caminhos) {
    const { error } = await supabase.storage.from(para).move(caminho, caminho, { destinationBucket: de });
    if (error) console.error("desfazerMovimento", para, de, resumoErro(error));
  }
}

/**
 * URLs das fotos para o painel: a pública para carro no catálogo; a assinada (1 hora) do bucket privado
 * para rascunho, reservado e vendido. Mantém a ordem; null quando a assinatura falha.
 */
export async function urlsFotosVeiculo(supabase: Cliente, fotos: { path: string; publica: boolean }[]) {
  const ocultas = fotos.filter((f) => !f.publica).map((f) => f.path);
  const assinadas = new Map<string, string>();
  if (ocultas.length) {
    const { data } = await supabase.storage.from(BUCKET_OCULTO).createSignedUrls(ocultas, 3600);
    for (const a of data ?? []) if (a.path && a.signedUrl) assinadas.set(a.path, a.signedUrl);
  }
  return fotos.map((f) => (f.publica ? urlFotoVeiculo(f.path) : (assinadas.get(f.path) ?? null)));
}
