/**
 * Onde ficam as fotos do estoque. O bucket público "veiculos" guarda só as fotos dos carros que o catálogo
 * mostra (disponível e publicado); rascunho, reservado e vendido ficam no privado "veiculos-ocultos", que só
 * o admin lê (por URL assinada). O caminho do arquivo é o mesmo nos dois: `{id do veículo}/{arquivo}`.
 */
export const BUCKET_PUBLICO = "veiculos";
export const BUCKET_OCULTO = "veiculos-ocultos";
export type BucketVeiculo = typeof BUCKET_PUBLICO | typeof BUCKET_OCULTO;

/** true quando o catálogo mostra o veículo (e as fotos dele ficam no bucket público). */
export function fotosPublicas(v: { status: string; publicado: boolean }) {
  return v.status === "disponivel" && v.publicado;
}

export function bucketDoVeiculo(v: { status: string; publicado: boolean }): BucketVeiculo {
  return fotosPublicas(v) ? BUCKET_PUBLICO : BUCKET_OCULTO;
}

/**
 * Cache das fotos do estoque na CDN do Supabase (segundos). Curto de propósito: quando o carro sai do
 * catálogo e a foto vai para o bucket privado, o link público para de abrir em até 5 minutos.
 */
export const CACHE_FOTOS_VEICULO = "300";

/**
 * true para URL assinada (foto do bucket privado). No <Image>, use `unoptimized` com ela: assim a foto
 * privada não entra no cache compartilhado do otimizador de imagens.
 */
export function urlAssinada(url: string) {
  return url.includes("/storage/v1/object/sign/");
}
