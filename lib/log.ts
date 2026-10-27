/**
 * Resumo de um erro (Supabase: banco, Auth ou Storage) para o log: só o código e a mensagem.
 * Nunca `details`, `hint` nem o objeto inteiro: eles podem trazer os valores enviados (dados pessoais).
 */
export function resumoErro(erro: unknown): { code: string | null; message: string } {
  if (erro && typeof erro === "object") {
    const e = erro as { code?: unknown; message?: unknown };
    return { code: e.code == null ? null : String(e.code), message: typeof e.message === "string" ? e.message : "" };
  }
  return { code: null, message: String(erro) };
}
