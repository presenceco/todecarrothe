/**
 * Dados da loja usados no site inteiro (header, menu, rodapé, "Onde estamos", confirmações, WhatsApp).
 *
 * Dados confirmados pelo cliente em 23/10/2026. A política de privacidade está no fim do arquivo.
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
};

/** WhatsApp da loja como aparece nos textos: "(86) 99477-5158". */
const whatsappTexto = loja.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");

export type SecaoPolitica = { titulo: string; paragrafos: readonly string[] };

/**
 * Política de privacidade (/politica-de-privacidade), fiel ao que o sistema faz: campos dos formulários
 * (lib/formularios/esquemas.ts), hash do IP (lib/formularios/protecao.ts), limpeza diária
 * (app/api/limpeza) e exclusão no painel. Ao mudar o texto, atualize `atualizadaEm` e CONSENTIMENTO_VERSAO
 * (lib/consentimento.ts).
 */
export const politicaPrivacidade: { atualizadaEm: string; secoes: readonly SecaoPolitica[] } = {
  atualizadaEm: "2026-10-31",
  secoes: [
    {
      titulo: "1. Quem somos e como falar com a gente",
      paragrafos: [
        `Esta política explica como a ${loja.nome} trata os dados pessoais enviados pelos formulários deste site, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).`,
        `O responsável pelos seus dados (controlador) é Francisco das Chagas dos Santos Filho, CPF 035.433.613-41, que atende como ${loja.nome} no ${loja.endereco.join(", ")}.`,
        `Para qualquer pedido sobre os seus dados, fale com a gente pelo e-mail ${loja.email} ou pelo WhatsApp ${whatsappTexto}.`,
        "Como agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022), não temos um encarregado de dados formal. Esse mesmo canal recebe e responde os pedidos.",
      ],
    },
    {
      titulo: "2. Quais dados coletamos",
      paragrafos: [
        "Coletamos só o que você preenche nos formulários. Os campos marcados como opcionais podem ficar em branco.",
        "Simular financiamento: nome completo, CPF, data de nascimento, WhatsApp, renda mensal, valor de entrada, prazo, parcela que você busca, se tem CNH e, se tiver carro para dar na troca, o modelo e o ano dele. Guardamos também o carro escolhido e o preço dele no momento do envio, ou o valor aproximado do carro, quando a simulação é feita sem escolher um carro do estoque.",
        "Não encontrou seu carro?: nome, WhatsApp, marca e modelo procurados, ano mínimo, faixa de preço e forma de pagamento. No financiado, também quantas parcelas, a entrada e o valor da parcela, se você informar. Se tiver carro para dar de entrada: modelo, ano e até 8 fotos dele.",
        "Venda seu carro: nome, WhatsApp, como prefere vender (venda direta, troca ou consignação), marca, modelo, versão, ano, quilometragem, câmbio, cor, se está quitado, valor pretendido, os detalhes que você escrever e até 8 fotos do carro.",
        "Em todos os formulários: o código de indicação, se você informar, a data e a hora em que você marcou a autorização e a versão do texto aceito. Para evitar envios em massa por robôs, registramos também um código irreversível (hash) gerado a partir do seu endereço IP, inclusive quando um código de indicação é conferido ou usado. O IP em si não é guardado, e esse código é apagado automaticamente em até 2 dias.",
        "No botão Tenho interesse, se houver código de indicação, ele vai na mensagem do WhatsApp e contamos o clique por código e por carro, sem nenhum dado seu.",
        "Pessoas que indicam a loja: guardamos o nome e o WhatsApp só para identificar as indicações e combinar o prêmio, até o indicador pedir a exclusão pelo canal da seção 1.",
      ],
    },
    {
      titulo: "3. Para que usamos",
      paragrafos: [
        "Usamos seus dados para responder você pelo WhatsApp, simular o financiamento, procurar o carro que você pediu e avaliar o carro que você ofereceu para venda, troca ou consignação.",
        "Não vendemos seus dados e não os usamos para publicidade.",
      ],
    },
    {
      titulo: "4. Base legal",
      paragrafos: [
        "Tratamos seus dados com base no seu consentimento (art. 7º, I, da LGPD), dado ao marcar a autorização no fim de cada formulário. Sem essa marcação, o formulário não é enviado.",
        "Também tratamos os dados para procedimentos preliminares de um contrato pedido por você, como a simulação de um financiamento ou a avaliação do seu carro (art. 7º, V).",
      ],
    },
    {
      titulo: "5. Com quem compartilhamos",
      paragrafos: [
        "Bancos e financeiras parceiros: só na simulação de financiamento e só os dados necessários para a análise de crédito.",
        "Fornecedores que operam o site: a Vercel (hospedagem), o Supabase (banco de dados e arquivos) e a empresa que desenvolve e dá suporte ao sistema. Eles tratam os dados só para manter o site funcionando.",
        "Os servidores da Vercel e do Supabase ficam nos Estados Unidos. Por isso, seus dados são transferidos para fora do Brasil, nos termos do art. 33 da LGPD.",
        "Quando você fala com a gente pelo WhatsApp, a conversa também segue as regras de privacidade do próprio WhatsApp.",
      ],
    },
    {
      titulo: "6. Por quanto tempo guardamos",
      paragrafos: [
        "CPF, data de nascimento e renda são apagados automaticamente 30 dias após o envio da simulação.",
        "Nome, WhatsApp e o histórico da negociação (carro, valores, fotos e anotações da loja) ficam guardados para o atendimento e para futuras negociações, até você pedir a exclusão pelo canal da seção 1.",
        "Quando você pede a exclusão, apagamos o registro completo, inclusive as fotos que você enviou.",
        "Fotos de envios que não foram concluídos são apagadas automaticamente em até 2 dias.",
        "Quando um indicador pede a exclusão, apagamos o nome e o WhatsApp dele. O código de indicação continua no histórico dos atendimentos.",
        "Se o carro que você ofereceu for cadastrado no nosso estoque, os dados e as fotos do veículo (sem os seus dados pessoais) passam a fazer parte do anúncio.",
      ],
    },
    {
      titulo: "7. Seus direitos",
      paragrafos: [
        "Pela LGPD (art. 18), você pode: confirmar se tratamos seus dados, acessar os dados, corrigir dados incompletos ou errados, pedir a exclusão e revogar a sua autorização a qualquer momento. A revogação vale dali em diante.",
        "Para isso, mande uma mensagem pelo e-mail ou pelo WhatsApp da seção 1 dizendo o que deseja. Podemos pedir uma confirmação de que o pedido é seu, como escrever do mesmo WhatsApp usado no formulário.",
        "Respondemos em até 15 dias.",
        "Se não ficar satisfeito com a resposta, você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD), pelo site gov.br/anpd.",
      ],
    },
    {
      titulo: "8. Segurança",
      paragrafos: [
        "Só a loja acessa seus dados, pelo painel administrativo, que exige senha e limita as tentativas de entrada.",
        "Toda a comunicação com o site é criptografada (HTTPS).",
        "As fotos que você envia ficam numa área privada: não têm link público e só a loja consegue abrir.",
      ],
    },
    {
      titulo: "9. Cookies",
      paragrafos: [
        "O site público não usa cookies de rastreamento nem de publicidade.",
        "Só o painel da loja usa cookies de sessão, necessários para o login.",
        "O código de indicação fica guardado só no seu navegador, até você fechar a aba.",
        "Os botões de WhatsApp, Instagram, Facebook e do mapa levam a sites de outras empresas, que têm políticas próprias.",
      ],
    },
    {
      titulo: "10. Menores de idade",
      paragrafos: ["A simulação de financiamento exige 18 anos ou mais: o formulário não aceita data de nascimento de menores."],
    },
    {
      titulo: "11. Mudanças nesta política",
      paragrafos: ["Se esta política mudar, avisaremos nesta página, com a nova data de atualização."],
    },
  ],
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
