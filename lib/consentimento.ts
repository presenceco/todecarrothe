/**
 * Versão do texto de autorização aceito nos formulários públicos. É gravada junto com a data/hora do
 * consentimento. Mude a versão sempre que mudar qualquer texto abaixo ou a política de privacidade: use a data
 * da política (politicaPrivacidade.atualizadaEm, em lib/loja.ts).
 */
export const CONSENTIMENTO_VERSAO = "2026-10-27";

export const TEXTO_CONSENTIMENTO = {
  simulacao: "Autorizo o uso dos meus dados para a simulação de crédito",
  pedido_busca: "Autorizo a Tô de Carro a usar meus dados para responder este pedido",
  consignacao: "Autorizo a Tô de Carro a usar meus dados para avaliar meu carro e entrar em contato",
} as const;
