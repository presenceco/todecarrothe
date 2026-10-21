import { cacheLife } from "next/cache";
import { anoAtual } from "@/lib/formato";

/**
 * Ano corrente no fuso da loja. Com Cache Components, ler a data precisa ser explícito:
 * o valor fica em cache e é refeito a cada hora (a virada do ano aparece em até uma hora).
 */
export async function AnoAtual() {
  "use cache";
  cacheLife("hours");
  return <>{anoAtual()}</>;
}
