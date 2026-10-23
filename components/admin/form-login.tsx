"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TextInput } from "@/components/ui/field";
import { entrar, type EstadoEntrar } from "@/lib/admin/acoes-auth";
import { AvisoEntrada, BotaoEntrada, CampoSenha, ManterConectado } from "./campos-entrada";

const AVISOS: Record<string, string> = {
  "link-expirado": "O link de redefinição expirou ou já foi usado. Peça um novo em “Esqueci minha senha”.",
};

/** Formulário de entrada (11/26). O e-mail digitado continua no campo se a senha estiver errada. */
export function FormLogin({ volta, aviso }: { volta?: string; aviso?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoEntrar, FormData>(entrar, {});
  return (
    <form action={acao} className="contents">
      {volta && <input type="hidden" name="volta" value={volta} />}
      <AvisoEntrada mensagem={estado.erro} />
      {!estado.erro && aviso && <AvisoEntrada mensagem={AVISOS[aviso]} tom="info" />}
      <TextInput
        name="email"
        label="E-mail"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={estado.email}
        aria-invalid={estado.erro ? true : undefined}
      />
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
