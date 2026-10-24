/**
 * Validação dos formulários públicos (Zod), a mesma no navegador e no servidor.
 * A entrada são os textos dos campos (com máscara); a saída são valores prontos para gravar.
 */
import { z } from "zod";
import { cpfValido } from "@/lib/cpf";
import { dataBrParaIso, digitos, idade, moedaParaNumero } from "@/lib/mascaras";

/** Ano máximo aceito (o seguinte ao atual), calculado na hora da validação. */
const maxAno = () => new Date().getFullYear() + 1;

const nome = z
  .string()
  .trim()
  .min(2, { error: "Informe seu nome." })
  .max(120, { error: "Use até 120 caracteres." });

const nomeCompleto = nome.refine((v) => v.split(/\s+/).length >= 2, { error: "Informe nome e sobrenome, como no documento." });

/** WhatsApp com DDD: 11 dígitos (celular começando com 9) ou 10 (fixo). Grava só os dígitos, sem o 55. */
const whatsapp = z
  .string()
  .transform((v) => digitos(v).replace(/^55(?=\d{10,11}$)/, ""))
  .refine((d) => /^[1-9][1-9]\d{8,9}$/.test(d) && (d.length === 10 || d[2] === "9"), {
    error: "Informe um WhatsApp com DDD, ex.: (86) 9 9812-4471.",
  });

/** Dinheiro obrigatório (aceita R$ 0,00 quando `zeroOk`). */
const dinheiro = (mensagem: string, zeroOk = false) =>
  z
    .string()
    .transform((v) => moedaParaNumero(v))
    .refine((n) => n !== null && (zeroOk ? n >= 0 : n > 0), { error: mensagem })
    .transform((n) => n as number);

const dinheiroOpcional = z
  .string()
  .optional()
  .transform((v) => (v ? moedaParaNumero(v) : null))
  .refine((n) => n === null || n > 0, { error: "Informe um valor ou deixe em branco." });

const simNao = (mensagem: string) =>
  z
    .enum(["sim", "nao"], { error: mensagem })
    .transform((v) => v === "sim");

const anoTroca = z
  .string()
  .optional()
  .transform((v) => (v ? Number(digitos(v)) : null));

const autorizado = z.literal(true, { error: "Marque a autorização para enviar." });

/** Campo isca: invisível para pessoas; robô que preenche é descartado. */
/** Campo isca: quem decide é o servidor (`pareceRobo`), que responde com uma confirmação falsa. */
const isca = z.string().optional();

/** Exige modelo e ano da troca quando a resposta é "sim" (campos condicionais). */
function validarTroca(dados: { temTroca: boolean; trocaModelo?: string; trocaAno: number | null }, ctx: z.RefinementCtx) {
  if (!dados.temTroca) return;
  if (!dados.trocaModelo || dados.trocaModelo.trim().length < 2) {
    ctx.addIssue({ code: "custom", path: ["trocaModelo"], message: "Informe o modelo do carro da troca." });
  }
  if (!dados.trocaAno || dados.trocaAno < 1950 || dados.trocaAno > maxAno()) {
    ctx.addIssue({ code: "custom", path: ["trocaAno"], message: "Informe o ano (4 dígitos)." });
  }
}

/* ------------------------------------------------------------------ Simulação */

/**
 * Simulação de financiamento. Com veículo, `precoVeiculo` limita a entrada; sem veículo, o
 * "Valor aproximado do carro" é obrigatório e é ele que limita a entrada.
 */
export function esquemaSimulacao(precoVeiculo: number | null) {
  return z
    .object({
      nome: nomeCompleto,
      cpf: z
        .string()
        .transform(digitos)
        .refine(cpfValido, { error: "CPF inválido. Confira os números." }),
      nascimento: z
        .string()
        .transform((v) => dataBrParaIso(v))
        .refine((iso) => iso !== null, { error: "Data inválida. Use dd/mm/aaaa." })
        .refine((iso) => idade(iso!) >= 18, { error: "É preciso ter 18 anos ou mais para financiar." })
        .refine((iso) => idade(iso!) <= 100, { error: "Confira o ano de nascimento." })
        .transform((iso) => iso as string),
      whatsapp,
      renda: dinheiro("Informe sua renda mensal."),
      valorAproximado: precoVeiculo === null ? dinheiro("Informe o valor aproximado do carro.") : z.string().optional().transform(() => null),
      entrada: z
        .string()
        .transform((v) => moedaParaNumero(v) ?? 0),
      prazo: z.enum(["24", "36", "48", "60"], { error: "Escolha o prazo." }).transform(Number),
      // Parcela mensal que o cliente busca (opcional).
      parcela: dinheiroOpcional,
      temTroca: simNao("Responda se tem veículo para dar na troca."),
      trocaModelo: z.string().trim().max(80).optional(),
      trocaAno: anoTroca,
      possuiCnh: simNao("Responda se possui CNH."),
      autorizado,
      site: isca,
    })
    .superRefine((d, ctx) => {
      validarTroca(d, ctx);
      const limite = precoVeiculo ?? d.valorAproximado;
      if (limite !== null && d.entrada > limite) {
        ctx.addIssue({
          code: "custom",
          path: ["entrada"],
          message: precoVeiculo !== null ? "A entrada não pode passar do preço do veículo." : "A entrada não pode passar do valor do carro.",
        });
      }
      // A parcela não pode passar do valor a financiar (preço menos entrada).
      if (limite !== null && d.parcela !== null && d.parcela > Math.max(0, limite - d.entrada)) {
        ctx.addIssue({ code: "custom", path: ["parcela"], message: "A parcela não pode passar do valor a financiar." });
      }
    });
}

export type CamposSimulacao = {
  nome: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  renda: string;
  valorAproximado: string;
  entrada: string;
  prazo: string;
  parcela: string;
  temTroca: string;
  trocaModelo: string;
  trocaAno: string;
  possuiCnh: string;
  autorizado: boolean;
  site: string;
};

/* ------------------------------------------------------------------ Pedido de busca */

export const FAIXAS_PRECO = [
  { value: "ate_50", label: "Até R$ 50 mil" },
  { value: "50_80", label: "R$ 50 a 80 mil" },
  { value: "80_110", label: "R$ 80 a 110 mil" },
  { value: "110_150", label: "R$ 110 a 150 mil" },
  { value: "150_200", label: "R$ 150 a 200 mil" },
  { value: "acima_200", label: "Acima de R$ 200 mil" },
] as const;

/** Quantidade de parcelas do pedido de busca financiado. */
export const PRAZOS_PEDIDO = [12, 24, 36, 48, 60] as const;

/** Fotos enviadas pelo cliente (consignação e carro de entrada do pedido): até 8 JPG/PNG de até 10 MB. */
export const FOTOS_CLIENTE = { maximo: 8, tamanhoMaximo: 10 * 1024 * 1024, tipos: ["image/jpeg", "image/png"] } as const;

const fotosCliente = z
  .array(z.object({ tipo: z.string(), tamanho: z.number() }))
  .max(FOTOS_CLIENTE.maximo, { error: `Envie no máximo ${FOTOS_CLIENTE.maximo} fotos.` })
  .refine((fs) => fs.every((f) => (FOTOS_CLIENTE.tipos as readonly string[]).includes(f.tipo)), { error: "Use fotos JPG ou PNG." })
  .refine((fs) => fs.every((f) => f.tamanho <= FOTOS_CLIENTE.tamanhoMaximo), { error: "Cada foto pode ter até 10 MB." });

export const esquemaPedido = z
  .object({
    nome,
    whatsapp,
    marcaModelo: z.string().trim().min(2, { error: "Informe a marca e o modelo que procura." }).max(80, { error: "Use até 80 caracteres." }),
    anoMinimo: z
      .string()
      .refine((v) => /^\d{4}$/.test(v) && Number(v) >= 2010 && Number(v) <= maxAno(), { error: "Escolha o ano mínimo." })
      .transform(Number),
    faixa: z.enum(FAIXAS_PRECO.map((f) => f.value) as [string, ...string[]], { error: "Escolha a faixa de preço." }),
    pagamento: z.enum(["a_vista", "financiado"], { error: "Escolha a forma de pagamento." }),
    // Só com "Financiado" (opcionais): em quantas vezes, entrada e o valor de parcela que busca.
    prazo: z
      .enum(["", ...PRAZOS_PEDIDO.map(String)] as [string, ...string[]])
      .optional()
      .transform((v) => (v ? Number(v) : null)),
    entrada: dinheiroOpcional,
    parcela: dinheiroOpcional,
    temTroca: z.boolean(),
    trocaModelo: z.string().trim().max(80).optional(),
    trocaAno: anoTroca,
    // Fotos do carro de entrada (opcionais; só com "Tenho carro para dar de entrada").
    fotos: fotosCliente.default([]),
    autorizado,
    site: isca,
  })
  .superRefine(validarTroca)
  // À vista: descarta prazo, entrada e parcela que tenham ficado preenchidos antes de trocar a forma de pagamento.
  // Sem troca: descarta as fotos escolhidas antes de desligar o interruptor.
  .transform((d) => ({
    ...d,
    ...(d.pagamento === "financiado" ? {} : { prazo: null, entrada: null, parcela: null }),
    fotos: d.temTroca ? d.fotos : [],
  }));

export type CamposPedido = {
  nome: string;
  whatsapp: string;
  marcaModelo: string;
  anoMinimo: string;
  faixa: string;
  pagamento: string;
  prazo: string;
  entrada: string;
  parcela: string;
  temTroca: boolean;
  trocaModelo: string;
  trocaAno: string;
  autorizado: boolean;
  site: string;
};

/* ------------------------------------------------------------------ Venda seu carro */

export const FORMAS_VENDA = [
  { value: "venda_direta", label: "Venda direta" },
  { value: "troca", label: "Troca" },
  { value: "consignacao", label: "Consignação" },
] as const;

export const esquemaConsignacao = z
  .object({
    forma: z.enum(["venda_direta", "troca", "consignacao"], { error: "Escolha como prefere vender." }),
    marca: z.string().trim().min(2, { error: "Escolha a marca." }).max(40),
    modelo: z.string().trim().min(1, { error: "Informe o modelo." }).max(60, { error: "Use até 60 caracteres." }),
    versao: z.string().trim().max(80, { error: "Use até 80 caracteres." }).optional().default(""),
    anoFabModelo: z.string().refine((v) => /^\d{4}\/\d{4}$/.test(v), { error: "Use o formato 2019/2020." }),
    km: z
      .string()
      .refine((v) => digitos(v).length > 0, { error: "Informe a quilometragem." })
      .transform((v) => Number(digitos(v)))
      .refine((n) => n <= 2000000, { error: "Confira a quilometragem." }),
    cambio: z.enum(["automatico", "manual"], { error: "Escolha o câmbio." }),
    cor: z.string().trim().min(2, { error: "Informe a cor." }).max(30),
    quitado: simNao("Responda se o carro está quitado."),
    valorPretendido: dinheiroOpcional,
    detalhes: z.string().trim().max(2000, { error: "Use até 2.000 caracteres." }).optional().default(""),
    nome,
    whatsapp,
    fotos: fotosCliente,
    autorizado,
    site: isca,
  })
  .transform((d, ctx) => {
    const [fab, mod] = d.anoFabModelo.split("/").map(Number);
    if (fab < 1950 || fab > maxAno() || mod < fab || mod > fab + 1) {
      ctx.addIssue({ code: "custom", path: ["anoFabModelo"], message: "Confira os anos: o do modelo é igual ou um a mais que o de fabricação." });
      return z.NEVER;
    }
    return { ...d, anoFabricacao: fab, anoModelo: mod };
  });

export type CamposConsignacao = {
  forma: string;
  marca: string;
  modelo: string;
  versao: string;
  anoFabModelo: string;
  km: string;
  cambio: string;
  cor: string;
  quitado: string;
  valorPretendido: string;
  detalhes: string;
  nome: string;
  whatsapp: string;
  autorizado: boolean;
  site: string;
};

/* ------------------------------------------------------------------ Erros */

export type ErrosCampos = Partial<Record<string, string>>;

/** Primeira mensagem de cada campo, para mostrar abaixo dele. */
export function errosPorCampo(erro: z.ZodError): ErrosCampos {
  const erros: ErrosCampos = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "formulario");
    if (!erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}
