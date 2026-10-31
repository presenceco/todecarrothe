import "server-only";
import { resumoErro } from "@/lib/log";
import { clienteServico } from "@/lib/supabase/servico";

/**
 * E-mail do painel em ADMIN_EMAIL (opcional): reserva de `emailDoAdmin`, se a busca no Supabase Auth falhar, e
 * desempate entre admins. Nunca vai para o navegador.
 */
function emailDoPainel() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

/**
 * E-mail do dono, para a entrada e o "Esqueci minha senha": o do usuário com app_metadata.role = "admin" no
 * Supabase Auth (cliente de serviço). ADMIN_EMAIL só entra se a busca falhar. Sem admin cadastrado, null.
 */
export async function emailDoAdmin() {
  const resposta = await clienteServico()
    .auth.admin.listUsers({ perPage: 1000 })
    .catch((error: unknown) => ({ data: null, error }));
  const { data, error } = resposta;
  if (error || !data) {
    console.error("emailDoAdmin", resumoErro(error));
    return emailDoPainel();
  }
  const admins = data.users.filter((u) => u.app_metadata?.role === "admin" && u.email);
  // Mais de um admin: prefere o de ADMIN_EMAIL, se for um deles.
  const escolhido = admins.find((u) => u.email!.toLowerCase() === emailDoPainel()) ?? admins[0];
  return escolhido?.email?.toLowerCase() ?? null;
}
