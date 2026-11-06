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

/** "personalizada": etiqueta escrita pelo admin (o texto vem de etiquetas_personalizadas). */
export type Etiqueta = keyof typeof ETIQUETAS | "nenhuma" | "personalizada";

/** Cores da etiqueta escrita pelo admin sem cor escolhida: branca com texto azul, para não se confundir com as três fixas. */
export const CLASSES_ETIQUETA_PERSONALIZADA = "bg-white text-brand";

/** Cores prontas da etiqueta escrita pelo admin. null: a padrão, branca com texto azul. */
export const CORES_ETIQUETA = [
  { nome: "Branca", cor: null },
  { nome: "Azul", cor: "#0045aa" },
  { nome: "Vermelha", cor: "#d92d20" },
  { nome: "Laranja", cor: "#ea580c" },
  { nome: "Amarela", cor: "#facc15" },
  { nome: "Verde", cor: "#15803d" },
  { nome: "Roxa", cor: "#7c3aed" },
  { nome: "Preta", cor: "#0b0f17" },
] as const;

export const REGEX_COR = /^#[0-9a-f]{6}$/;

/** Texto da etiqueta sobre a cor de fundo: branco ou escuro, o que tiver mais contraste (fórmula do WCAG). */
export function corDoTexto(fundo: string) {
  const canal = (i: number) => {
    const c = parseInt(fundo.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luz = 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
  // Contraste com o branco (luz 1) contra o escuro do site (#0b0f17, luz ≈ 0,005).
  return 1.05 / (luz + 0.05) >= (luz + 0.05) / 0.055 ? "#ffffff" : "#0b0f17";
}
