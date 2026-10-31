import "server-only";
import { normalizarCupom, REGEX_CUPOM } from "@/lib/cupom";
import { resumoErro } from "@/lib/log";
import { clienteServico } from "@/lib/supabase/servico";

/**
 * Id do cupom, se o código existir e estiver ativo. Inválido, inativo ou falha no banco: null. Quem chama
 * segue sem cupom: o cupom nunca bloqueia um envio.
 */
export async function idDoCupomAtivo(codigo: unknown) {
  const normalizado = normalizarCupom(codigo);
  if (!REGEX_CUPOM.test(normalizado)) return null;
  const { data, error } = await clienteServico().from("cupons").select("id").eq("codigo", normalizado).eq("ativo", true).maybeSingle();
  if (error) {
    console.error("idDoCupomAtivo", resumoErro(error));
    return null;
  }
  return data?.id ?? null;
}
