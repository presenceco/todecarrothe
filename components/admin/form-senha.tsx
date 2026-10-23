"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TextInput } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { pedirRedefinicao, redefinirSenha, type EstadoEsqueci, type EstadoRedefinir } from "@/lib/admin/acoes-auth";
import { AvisoEntrada, BotaoEntrada, CampoSenha } from "./campos-entrada";

function VoltarAoLogin() {
  return (
    <Link href="/admin/login" className="flex h-48 items-center justify-center gap-6 text-14 font-semibold text-brand hover:underline lg:-mb-12">
      <Icon name="arrow_back" size={18} />
      Voltar para o login
    </Link>
  );
}

/** "Esqueci minha senha": e-mail → link do Supabase. Depois do envio, mostra o aviso no lugar do formulário. */
export function FormEsqueci() {
  const [estado, acao, pendente] = useActionState<EstadoEsqueci, FormData>(pedirRedefinicao, {});
  if (estado.enviado) {
    return (
      <>
        <AvisoEntrada
          tom="info"
          mensagem={`Se ${estado.email} for o e-mail do painel, você vai receber um link para criar uma senha nova. Confira também o spam.`}
        />
        <VoltarAoLogin />
      </>
    );
  }
  return (
    <form action={acao} className="contents">
      <AvisoEntrada mensagem={estado.erro} />
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
      />
      <BotaoEntrada pendente={pendente}>Enviar link</BotaoEntrada>
      <VoltarAoLogin />
    </form>
  );
}

/** Nova senha, aberta pelo link do e-mail (a sessão de recuperação vem de /admin/auth/confirmar). */
export function FormRedefinir() {
  const [estado, acao, pendente] = useActionState<EstadoRedefinir, FormData>(redefinirSenha, {});
  return (
    <form action={acao} className="contents">
      <AvisoEntrada mensagem={estado.erro} />
      <CampoSenha name="senha" label="Nova senha" autoComplete="new-password" erro={!!estado.erro} />
      <CampoSenha name="confirmar" label="Repita a nova senha" autoComplete="new-password" erro={!!estado.erro} />
      <p className="-mt-6 text-14 leading-140 text-gray-500">Pelo menos 10 caracteres, com letra maiúscula, minúscula e número.</p>
      <BotaoEntrada pendente={pendente}>Salvar e entrar</BotaoEntrada>
    </form>
  );
}
