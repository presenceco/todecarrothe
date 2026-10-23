import "server-only";

/**
 * E-mail do painel quando a entrada pede só a senha (cadeado do rodapé). Vem de ADMIN_EMAIL e nunca vai
 * para o navegador: a tela não mostra nem envia o e-mail. Sem a variável, a entrada pede e-mail e senha.
 */
export function emailDoPainel() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}
