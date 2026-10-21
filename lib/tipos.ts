import type { Etiqueta } from "./status";

export type Cambio = "automatico" | "manual";
export type Combustivel = "flex" | "gasolina" | "diesel" | "hibrido";
export type TipoCarroceria = "hatch" | "seda" | "suv" | "picape";
export type Selo = "ipva_pago" | "unico_dono" | "revisoes_em_dia" | "chave_reserva" | "manual";

/** Foto pronta para o <Image>: URL pública e texto alternativo. */
export type Foto = { src: string; alt: string };

/** O que o cartão do catálogo precisa saber de um veículo. */
export type VeiculoResumo = {
  slug: string;
  marca: string;
  modelo: string;
  versao: string;
  anoFabricacao: number;
  anoModelo: number;
  km: number;
  cambio: Cambio;
  preco: number;
  etiqueta: Etiqueta;
  totalFotos: number;
  capa: Foto | null;
};

/** Veículo do catálogo: o cartão + os atributos usados nos filtros e na ordenação. */
export type VeiculoCatalogo = VeiculoResumo & {
  cor: string;
  combustivel: Combustivel;
  tipo: TipoCarroceria;
  /** Ordem "Mais recentes" (ms desde 1970). */
  publicadoEm: number;
};

/** Página de detalhe. */
export type VeiculoDetalhe = VeiculoCatalogo & {
  finalPlaca: string;
  selos: Selo[];
  opcionais: string[];
  fotos: Foto[];
};

export const ROTULO_CAMBIO: Record<Cambio, { longo: string; curto: string }> = {
  automatico: { longo: "Automático", curto: "Auto" },
  manual: { longo: "Manual", curto: "Manual" },
};

export const ROTULO_COMBUSTIVEL: Record<Combustivel, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  diesel: "Diesel",
  hibrido: "Híbrido",
};

export const ROTULO_TIPO: Record<TipoCarroceria, string> = {
  hatch: "Hatch",
  seda: "Sedã",
  suv: "SUV",
  picape: "Picape",
};

/** Selos verificados, na ordem das telas. O de IPVA leva o ano corrente ("IPVA 2026 pago"). */
export const SELOS: { chave: Selo; icone: "receipt_long" | "person" | "build" | "key" | "menu_book"; rotulo: (ano: number) => string }[] = [
  { chave: "ipva_pago", icone: "receipt_long", rotulo: (ano) => `IPVA ${ano} pago` },
  { chave: "unico_dono", icone: "person", rotulo: () => "Único dono" },
  { chave: "revisoes_em_dia", icone: "build", rotulo: () => "Revisões em dia" },
  { chave: "chave_reserva", icone: "key", rotulo: () => "Chave reserva" },
  { chave: "manual", icone: "menu_book", rotulo: () => "Manual" },
];
