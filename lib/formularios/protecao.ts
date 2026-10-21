import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { clienteServico } from "@/lib/supabase/servico";

/**
 * Proteção dos formulários públicos contra spam:
 * - campo isca (invisível; robô que preenche é descartado);
 * - tempo mínimo entre abrir e enviar o formulário (robôs enviam na hora);
 * - limite de envios por IP (o IP nunca é gravado: só um hash SHA-256 com sal).
 */

export type Formulario = "simulacao" | "pedido_busca" | "consignacao";

export const LIMITE_ENVIOS = { quantidade: 5, janela: "1 hour" } as const;
const TEMPO_MINIMO_MS = 2500;

function sal() {
  const s = process.env.IP_HASH_SALT;
  if (!s) throw new Error("IP_HASH_SALT não configurado no .env.local.");
  return s;
}

/** IP do visitante (Vercel: x-forwarded-for; local: ::1). */
async function ipDoVisitante() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** true quando o envio parece de robô (isca preenchida ou enviado rápido demais). */
export function pareceRobo(isca: string | undefined, iniciadoEm: number) {
  return Boolean(isca) || !Number.isFinite(iniciadoEm) || Date.now() - iniciadoEm < TEMPO_MINIMO_MS;
}

/** Registra o envio e diz se ainda está dentro do limite do IP. */
export async function dentroDoLimite(formulario: Formulario) {
  const ipHash = createHash("sha256").update(`${sal()}:${await ipDoVisitante()}`).digest("hex");
  const { data, error } = await clienteServico().rpc("registrar_envio", {
    p_ip_hash: ipHash,
    p_formulario: formulario,
    p_limite: LIMITE_ENVIOS.quantidade,
    p_janela: LIMITE_ENVIOS.janela,
  });
  if (error) throw new Error(`Falha no limite de envios: ${error.message}`);
  return data === true;
}

/** Assinatura que autoriza confirmar as fotos de uma consignação recém-criada (e só dela). */
export function assinar(valor: string) {
  return createHmac("sha256", sal()).update(`fotos:${valor}`).digest("hex");
}

export function assinaturaValida(valor: string, assinatura: string) {
  const esperado = Buffer.from(assinar(valor));
  const recebido = Buffer.from(assinatura);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export const MENSAGEM_LIMITE =
  "Você já enviou vários formulários na última hora. Tente de novo mais tarde ou fale com a gente no WhatsApp.";
export const MENSAGEM_FALHA = "Não conseguimos enviar agora. Tente de novo em instantes ou fale com a gente no WhatsApp.";
