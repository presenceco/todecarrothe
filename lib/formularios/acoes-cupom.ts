"use server";

import { normalizarCupom, REGEX_CUPOM } from "@/lib/cupom";
import { resumoErro } from "@/lib/log";
import { idDoCupomAtivo } from "./cupom-servidor";
import { dentroDoLimite, type Limite } from "./protecao";

/**
 * valido: existe e está ativo. invalido: não existe ou está inativo.
 * conferir: o IP passou do limite de verificações. Muitos clientes de uma operadora saem pelo mesmo IP, então
 * o cupom não é recusado: fica guardado e é conferido no envio.
 */
export type EstadoCupom = "valido" | "invalido" | "conferir";

const LIMITE_VERIFICACOES: Limite = { quantidade: 30, janela: "1 hour" };

/** Confere um código digitado ou vindo do link. Nunca devolve o nome do indicador nem outro dado do cupom. */
export async function verificarCupom(codigo: string): Promise<{ estado: EstadoCupom; codigo: string }> {
  const normalizado = normalizarCupom(codigo);
  if (!REGEX_CUPOM.test(normalizado)) return { estado: "invalido", codigo: normalizado };
  try {
    if (!(await dentroDoLimite("cupom", LIMITE_VERIFICACOES))) return { estado: "conferir", codigo: normalizado };
  } catch (e) {
    console.error("verificarCupom limite", resumoErro(e));
    return { estado: "conferir", codigo: normalizado };
  }
  return { estado: (await idDoCupomAtivo(normalizado)) ? "valido" : "invalido", codigo: normalizado };
}
