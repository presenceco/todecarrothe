/**
 * Dados da loja usados no site inteiro (header, menu, rodapé, "Onde estamos", confirmações, WhatsApp).
 *
 * Dados confirmados pelo cliente em 23/10/2026. Só a política de privacidade ainda falta (TODO abaixo).
 */
export const loja = {
  nome: "Tô de Carro Seminovos",
  cidade: "Teresina-PI",

  /** Nome no texto de direitos do rodapé ("Todos os direitos reservados Tô de Carro The © 2026"). */
  marcaRodape: "Tô de Carro The",

  /** Redes sociais (rodapé). */
  instagram: "https://www.instagram.com/todecarrothe/",
  facebook: "https://www.facebook.com/todecarrothe/",

  /**
   * WhatsApp da loja: (86) 99477-5158. Só dígitos, com DDI e DDD. Todos os botões de WhatsApp do site
   * (topo, menu, "Tenho interesse", confirmações, "Onde estamos", rodapé) usam este número.
   */
  whatsapp: "5586994775158",

  email: "todecarrothe@gmail.com",

  /**
   * Não é loja própria: o corretor atende no Show Automall. Uma linha por item, no menu (tela 09) e em
   * "Onde estamos" (tela 10).
   */
  endereco: ["Show Automall", "Av. João XXIII, 5335", "Santa Isabel · Teresina-PI"],

  /** Link "Como chegar" (Google Maps), pela busca do Show Automall. */
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Show+Auto+Mall,+Av.+Jo%C3%A3o+XXIII,+5335,+Teresina+-+PI",

  /** Uma linha por período (telas 09 e 10). */
  horario: ["Seg a sex · 8h às 18h", "Sábado · 8h às 13h"],

  /** Frase das confirmações (telas 06 e 34). */
  horarioResposta: "Respondemos em horário comercial: seg a sex, 8h às 18h · sábado, 8h às 13h",

  /** Texto da página "Onde estamos" (telas 10 e 25). */
  sobre:
    "Seminovos revisados e com procedência, com atendimento no Show Automall, em Teresina. Atendimento direto com o corretor e financiamento com os principais bancos.",

  /**
   * Foto do local (4:3 na página "Onde estamos"), em public/loja/, com o pino no centro: o toque abre `mapaUrl`.
   * Não embutimos o Google Maps: ele carrega rastreadores e cookies de terceiros (decisão do cliente).
   * Com null, a página mostra a área hachurada das telas.
   */
  fotoFachada: "/loja/show-automall-fachada.webp" as string | null,

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
