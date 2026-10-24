import { z } from "zod";
import { MARCAS } from "@/lib/marcas";
import { digitos } from "@/lib/mascaras";
import { ETIQUETAS, STATUS_VEICULO } from "@/lib/status";
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL, ROTULO_TIPO, SELOS } from "@/lib/tipos";

/** Cores do seletor "Cor" (15/28 mostram um select). "Outra" cobre o que não estiver na lista. */
export const CORES = ["Branco", "Preto", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Marrom", "Bege", "Amarelo", "Dourado", "Laranja", "Vinho", "Outra"] as const;

export const OPCOES_MARCA = [...MARCAS].sort((a, b) => a.localeCompare(b, "pt-BR")).map((m) => ({ value: m, label: m }));
export const OPCOES_CAMBIO = Object.entries(ROTULO_CAMBIO).map(([value, r]) => ({ value, label: r.longo }));
export const OPCOES_COMBUSTIVEL = Object.entries(ROTULO_COMBUSTIVEL).map(([value, label]) => ({ value, label }));
export const OPCOES_TIPO = Object.entries(ROTULO_TIPO).map(([value, label]) => ({ value, label }));
export const OPCOES_COR = CORES.map((c) => ({ value: c, label: c }));
export const OPCOES_ETIQUETA = [
  { value: "nenhuma", label: "Nenhuma" },
  ...Object.entries(ETIQUETAS).map(([value, e]) => ({ value, label: e.rotulo })),
];

export const MAX_FOTOS_VEICULO = 20;

/** Campos do formulário de veículo como o navegador guarda (textos com máscara). */
export type CamposVeiculo = {
  marca: string;
  modelo: string;
  versao: string;
  anoFabModelo: string;
  km: string;
  cambio: string;
  cor: string;
  combustivel: string;
  tipo: string;
  finalPlaca: string;
  preco: string;
  status: string;
  /** Uma das fixas ("nenhuma", "destaque"…) ou o id de uma etiqueta personalizada. */
  etiqueta: string;
  selos: string[];
  /** Ids dos selos personalizados ligados. */
  selosExtras: string[];
  opcionais: string[];
};

const anoMaximo = () => new Date().getFullYear() + 1;

/** Validação do cadastro (cliente e servidor). Rascunho e publicação pedem os mesmos campos (o banco exige todos). */
export const esquemaVeiculo = z
  .object({
    marca: z.string().trim().min(2, { error: "Escolha a marca." }).max(40),
    modelo: z.string().trim().min(1, { error: "Informe o modelo." }).max(60, { error: "Use até 60 caracteres." }),
    versao: z.string().trim().max(80, { error: "Use até 80 caracteres." }),
    anoFabModelo: z.string().refine((v) => /^\d{4}\/\d{4}$/.test(v), { error: "Use o formato 2022/2023." }),
    km: z
      .string()
      .refine((v) => digitos(v).length > 0, { error: "Informe a quilometragem." })
      .transform((v) => Number(digitos(v)))
      .refine((n) => n <= 2_000_000, { error: "Confira a quilometragem." }),
    cambio: z.enum(Object.keys(ROTULO_CAMBIO) as [string, ...string[]], { error: "Escolha o câmbio." }),
    cor: z.string().trim().min(2, { error: "Escolha a cor." }).max(30),
    combustivel: z.enum(Object.keys(ROTULO_COMBUSTIVEL) as [string, ...string[]], { error: "Escolha o combustível." }),
    tipo: z.enum(Object.keys(ROTULO_TIPO) as [string, ...string[]], { error: "Escolha a carroceria." }),
    finalPlaca: z.string().refine((v) => /^\d$/.test(v), { error: "Só o último número da placa." }),
    preco: z
      .string()
      .refine((v) => digitos(v).length > 0, { error: "Informe o preço." })
      .transform((v) => Number(digitos(v)))
      .refine((n) => n >= 1000 && n <= 50_000_000, { error: "Confira o preço." }),
    status: z.enum(Object.keys(STATUS_VEICULO) as [string, ...string[]]),
    etiqueta: z.union([z.enum(OPCOES_ETIQUETA.map((e) => e.value) as [string, ...string[]]), z.uuid()], { error: "Escolha a etiqueta." }),
    selos: z.array(z.enum(SELOS.map((s) => s.chave) as [string, ...string[]])).max(SELOS.length),
    selosExtras: z.array(z.uuid()).max(30),
    opcionais: z.array(z.uuid()).max(200),
  })
  .transform((d, ctx) => {
    const [fab, mod] = d.anoFabModelo.split("/").map(Number);
    if (fab < 1950 || fab > anoMaximo() || mod < fab || mod > fab + 1) {
      ctx.addIssue({ code: "custom", path: ["anoFabModelo"], message: "O ano do modelo é igual ou um a mais que o de fabricação." });
      return z.NEVER;
    }
    return { ...d, anoFabricacao: fab, anoModelo: mod };
  });

export type VeiculoValidado = z.output<typeof esquemaVeiculo>;
