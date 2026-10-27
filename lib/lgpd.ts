/** Dias depois do envio em que CPF, nascimento e renda das simulações são apagados (LGPD). */
export const DIAS_DADOS_SENSIVEIS = 30;

const DIA_MS = 24 * 60 * 60 * 1000;

/** Data em que os dados sensíveis de uma simulação enviada em `criadoEm` serão apagados. */
export function apagamentoDadosSensiveis(criadoEm: string | Date) {
  return new Date(new Date(criadoEm).getTime() + DIAS_DADOS_SENSIVEIS * DIA_MS);
}

/** Limite da limpeza: simulações enviadas antes disso já passaram do prazo. */
export function limiteDadosSensiveis(agora = new Date()) {
  return new Date(agora.getTime() - DIAS_DADOS_SENSIVEIS * DIA_MS);
}
