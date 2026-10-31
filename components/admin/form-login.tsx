"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoEntrar } from "@/lib/admin/acoes-auth";
import { AvisoEntrada, BotaoEntrada, CampoSenha, ManterConectado } from "./campos-entrada";

const AVISOS: Record<string, string> = {
  "link-expirado": "O link de redefinição expirou ou já foi usado. Peça um novo em “Esqueci minha senha”.",
};

/**
 * Formulário de entrada (11/26): só a senha, em qualquer ambiente. O e-mail do painel fica no servidor.
 */
export function FormLogin({ volta, aviso }: { volta?: string; aviso?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoEntrar, FormData>(entrar, {});
  return (
    <form action={acao} className="contents">
      {volta && <input type="hidden" name="volta" value={volta} />}
      <AvisoEntrada mensagem={estado.erro} />
      {!estado.erro && aviso && <AvisoEntrada mensagem={AVISOS[aviso]} tom="info" />}
      <CampoSenha name="senha" label="Senha" autoComplete="current-password" erro={!!estado.erro} />
      <div className="flex items-center justify-between gap-12">
        <ManterConectado />
        <Link href="/admin/esqueci-senha" className="flex h-48 items-center text-14 font-semibold whitespace-nowrap text-brand hover:underline lg:h-20">
          Esqueci minha senha
        </Link>
      </div>
      <BotaoEntrada pendente={pendente}>Entrar</BotaoEntrada>
    </form>
  );
}
