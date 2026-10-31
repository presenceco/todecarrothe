/** Cupom de indicação de um contato (simulação, pedido ou consignação). */
export type Indicacao = { cupomId: string; codigo: string; indicador: string };

/** Trecho do select: o cupom do contato. */
export const CAMPOS_INDICACAO = "cupons (id, codigo, indicador_nome)";

export type LinhaIndicacao = { id: string; codigo: string; indicador_nome: string } | null;

export function paraIndicacao(c: LinhaIndicacao): Indicacao | null {
  return c ? { cupomId: c.id, codigo: c.codigo, indicador: c.indicador_nome } : null;
}

/** Linha do "Copiar dados": "Indicação: JOAO (João Silva)". */
export const textoIndicacao = (i: Indicacao) => `Indicação: ${i.codigo} (${i.indicador})`;
