/**
 * Dados da loja usados no site inteiro (header, menu, rodapé, "A loja", confirmações, WhatsApp).
 *
 * TODO: dado real do cliente. Os valores abaixo vieram das telas de aprovação e são EXEMPLO:
 * não podem ir para produção. Troque cada campo marcado antes do deploy.
 */
export const loja = {
  nome: "Tô de Carro Seminovos",
  cidade: "Teresina-PI",

  /** TODO: dado real do cliente. Só dígitos, com DDI e DDD (ex.: 5586999990000). */
  whatsapp: "5586999990000",

  /** TODO: dado real do cliente. */
  email: "contato@todecarro.com.br",

  /** TODO: dado real do cliente. Duas linhas, como no menu (tela 09) e em "A loja" (tela 10). */
  endereco: {
    linha1: "Av. Frei Serafim, 2150 · Centro",
    linha2: "Teresina-PI",
  },

  /** TODO: dado real do cliente. Link "Como chegar" (Google Maps). */
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Frei+Serafim,+2150,+Teresina+-+PI",

  /** TODO: dado real do cliente. Uma linha por período (telas 09 e 10). */
  horario: ["Seg a sex · 8h às 18h", "Sábado · 8h às 13h"],

  /** TODO: dado real do cliente. Frase das confirmações (telas 06 e 34). */
  horarioResposta: "Respondemos em horário comercial: seg a sex, 8h às 18h · sábado, 8h às 13h",

  /** TODO: dado real do cliente. Texto da página "A loja" (telas 10 e 25). */
  sobre:
    "Seminovos revisados e com procedência, no Centro de Teresina. Atendimento direto com o dono e financiamento com os principais bancos.",

  /**
   * TODO: dado real do cliente. Foto da fachada (4:3), em public/loja/. Enquanto for null, a página mostra a
   * área hachurada das telas.
   */
  fotoFachada: null as string | null,

  /**
   * TODO: dado real do cliente. Imagem estática do mapa (print do Google Maps, ~1200×440), em public/loja/.
   * Não embutimos o Google Maps: ele carrega rastreadores e cookies de terceiros (decisão do cliente).
   * O toque no mapa abre `mapaUrl`.
   */
  imagemMapa: null as string | null,

  /**
   * TODO: dado real do cliente. Texto da política de privacidade, um parágrafo por item (a loja define com
   * quem cuida da parte jurídica). Enquanto for null, a página mostra um aviso e fica fora dos buscadores.
   */
  politicaPrivacidade: null as readonly string[] | null,
};

/** Link wa.me para o WhatsApp da loja, com mensagem opcional já escrita. */
export function linkWhatsappLoja(mensagem?: string) {
  return linkWhatsapp(loja.whatsapp, mensagem);
}

/** Link wa.me para qualquer número brasileiro (aceita máscara; acrescenta o 55 se faltar). */
export function linkWhatsapp(numero: string, mensagem?: string) {
  const digitos = numero.replace(/\D/g, "");
  const comDdi = digitos.length <= 11 ? `55${digitos}` : digitos;
  const url = new URL(`https://wa.me/${comDdi}`);
  if (mensagem) url.searchParams.set("text", mensagem);
  return url.toString();
}
