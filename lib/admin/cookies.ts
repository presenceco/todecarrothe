/**
 * "Manter conectado" desmarcado (dúvida 13): os cookies da sessão viram cookies de sessão do navegador
 * (sem data de validade) e somem ao fechar o navegador. Marcado, valem até o refresh token expirar.
 * A escolha fica num cookie próprio, lido toda vez que o Supabase grava os cookies de autenticação.
 */
export const COOKIE_SESSAO_CURTA = "tdc-sessao-curta";

type Opcoes = { maxAge?: number; expires?: Date; [chave: string]: unknown };

/** Opções do cookie de autenticação, sem validade quando a sessão é curta. Remoções (maxAge 0) passam intactas. */
export function opcoesSessao<T extends Opcoes>(opcoes: T, curta: boolean): T {
  if (!curta || opcoes.maxAge === 0) return opcoes;
  const resto = { ...opcoes };
  delete resto.maxAge;
  delete resto.expires;
  return resto;
}
