/** Rótulos e cores dos status e das etiquetas, como nas telas (mapa ST e BD do HTML de referência). */

export type Tom = "success" | "warning" | "neutral" | "info" | "danger";

type Definicao = { rotulo: string; tom: Tom };

export const STATUS_VEICULO = {
  disponivel: { rotulo: "Disponível", tom: "success" },
  reservado: { rotulo: "Reservado", tom: "warning" },
  vendido: { rotulo: "Vendido", tom: "neutral" },
} as const satisfies Record<string, Definicao>;

export const STATUS_PEDIDO = {
  novo: { rotulo: "Novo", tom: "info" },
  em_busca: { rotulo: "Em busca", tom: "warning" },
  encontrado: { rotulo: "Encontrado", tom: "success" },
  finalizado: { rotulo: "Finalizado", tom: "neutral" },
} as const satisfies Record<string, Definicao>;

export const STATUS_SIMULACAO = {
  nova: { rotulo: "Nova", tom: "info" },
  em_analise: { rotulo: "Em análise", tom: "warning" },
  aprovada: { rotulo: "Aprovada", tom: "success" },
  recusada: { rotulo: "Recusada", tom: "danger" },
} as const satisfies Record<string, Definicao>;

export const STATUS_CONSIGNACAO = {
  nova: { rotulo: "Nova", tom: "info" },
  em_avaliacao: { rotulo: "Em avaliação", tom: "warning" },
  negocio_fechado: { rotulo: "Negócio fechado", tom: "success" },
  recusada: { rotulo: "Recusada", tom: "danger" },
} as const satisfies Record<string, Definicao>;

export type StatusVeiculo = keyof typeof STATUS_VEICULO;
export type StatusPedido = keyof typeof STATUS_PEDIDO;
export type StatusSimulacao = keyof typeof STATUS_SIMULACAO;
export type StatusConsignacao = keyof typeof STATUS_CONSIGNACAO;

/** Classes de fundo e texto de cada tom (selos com ponto, segmentos de status). */
export const CLASSES_TOM: Record<Tom, { fundo: string; texto: string; ponto: string }> = {
  success: { fundo: "bg-success-bg", texto: "text-success", ponto: "bg-success" },
  warning: { fundo: "bg-warning-bg", texto: "text-warning", ponto: "bg-warning" },
  neutral: { fundo: "bg-neutral-bg", texto: "text-neutral", ponto: "bg-neutral" },
  info: { fundo: "bg-info-bg", texto: "text-info", ponto: "bg-info" },
  danger: { fundo: "bg-danger-bg", texto: "text-danger", ponto: "bg-danger" },
};

/** Etiqueta do cartão no catálogo (Destaque, Novidade, Baixa km). */
export const ETIQUETAS = {
  destaque: { rotulo: "Destaque", classes: "bg-destaque text-ink" },
  novidade: { rotulo: "Novidade", classes: "bg-brand text-white" },
  baixa_km: { rotulo: "Baixa km", classes: "bg-black text-white" },
} as const;

export type Etiqueta = keyof typeof ETIQUETAS | "nenhuma";
