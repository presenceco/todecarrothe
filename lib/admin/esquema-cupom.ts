import { z } from "zod";
import { normalizarCupom, REGEX_CUPOM } from "@/lib/cupom";
import { digitos } from "@/lib/mascaras";

/** Campos do formulário de cupom como o navegador guarda (WhatsApp com máscara). */
export type CamposCupom = {
  codigo: string;
  indicadorNome: string;
  indicadorWhatsapp: string;
  observacao: string;
  ativo: boolean;
};

/** Validação do cupom (cliente e servidor). */
export const esquemaCupom = z.object({
  codigo: z
    .string()
    .transform(normalizarCupom)
    .refine((c) => REGEX_CUPOM.test(c), { error: "Use de 3 a 15 letras ou números, sem espaços." }),
  indicadorNome: z.string().trim().min(2, { error: "Informe o nome do indicador." }).max(120, { error: "Use até 120 caracteres." }),
  indicadorWhatsapp: z
    .string()
    .transform((v) => digitos(v))
    .refine((d) => d === "" || d.length === 10 || d.length === 11, { error: "Informe o WhatsApp com DDD ou deixe em branco." })
    .transform((d) => d || null),
  observacao: z.string().trim().max(500, { error: "Use até 500 caracteres." }),
  ativo: z.boolean(),
});
