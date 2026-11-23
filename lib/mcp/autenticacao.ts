import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Autenticação do servidor MCP (/api/mcp): token fixo no cabeçalho `Authorization: Bearer <token>`.
 * É o formato que a SendPulse envia quando o servidor é cadastrado com a opção "Bearer token".
 *
 * O token fica só na variável MCP_TOKEN (Vercel) e no cadastro do servidor na SendPulse.
 * Sem a variável, ou com um token curto demais, o servidor recusa tudo.
 */

/** Tamanho mínimo do token: um valor de `openssl rand -hex 32` tem 64 caracteres. */
const TAMANHO_MINIMO = 32;

/** Resumo SHA-256: compara dois valores de qualquer tamanho em tempo constante. */
const resumo = (texto: string) => createHash("sha256").update(texto).digest();

export function tokenValido(request: Request) {
  const esperado = process.env.MCP_TOKEN?.trim();
  if (!esperado || esperado.length < TAMANHO_MINIMO) return false;
  const cabecalho = request.headers.get("authorization") ?? "";
  const [tipo, recebido = ""] = cabecalho.trim().split(/\s+/, 2);
  if (tipo?.toLowerCase() !== "bearer" || !recebido) return false;
  return timingSafeEqual(resumo(recebido), resumo(esperado));
}
