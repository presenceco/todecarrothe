"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { cn } from "@/lib/cn";
import type { NomeIcone } from "@/lib/icones";

/**
 * Barra preta dos formulários no mobile (04, 05, 07): voltar + título 600 17px.
 * Use `como="p"` quando a página já tem o próprio h1 visível no mobile (07).
 */
export function BarraTitulo({ titulo, voltarPara = "/", como: Titulo = "h1" }: { titulo: string; voltarPara?: string; como?: "h1" | "p" }) {
  const router = useRouter();
  return (
    <div className="box-content flex h-60 items-center gap-4 bg-black px-4 pt-[env(safe-area-inset-top,0px)] text-white lg:hidden">
      <IconButton
        icon="arrow_back"
        label="Voltar"
        onClick={() => {
          if (document.referrer.startsWith(window.location.origin) && window.history.length > 1) router.back();
          else router.push(voltarPara);
        }}
      />
      <Titulo className="text-17 font-semibold">{titulo}</Titulo>
    </div>
  );
}

/**
 * Cartão de seção dos formulários: mobile (04) 18px 16px, título 700 17px;
 * desktop (23/24) 24px, título 700 18px. `tituloDesktop` troca o título no desktop ("Troca e CNH").
 */
export function CartaoForm({
  titulo,
  tituloDesktop,
  children,
  className,
}: {
  titulo?: React.ReactNode;
  tituloDesktop?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-14 rounded-16 border border-gray-150 bg-white px-16 py-18 lg:gap-16 lg:p-24", className)}>
      {titulo && <h2 className={cn("text-17 font-bold lg:text-18", !!tituloDesktop && "lg:hidden")}>{titulo}</h2>}
      {tituloDesktop && <h2 className="hidden text-17 font-bold lg:block lg:text-18">{tituloDesktop}</h2>}
      {children}
    </section>
  );
}

type CampoMascaraProps = Omit<ComponentProps<typeof TextInput>, "onChange" | "value"> & {
  value: string;
  mascara?: (v: string) => string;
  onValor: (v: string) => void;
};

/** Campo de texto controlado com máscara aplicada a cada tecla. */
export function CampoMascara({ value, mascara, onValor, ...props }: CampoMascaraProps) {
  return <TextInput value={value} onChange={(e) => onValor(mascara ? mascara(e.target.value) : e.target.value)} {...props} />;
}

/** Mensagem de erro abaixo de um grupo de opções. */
export function ErroGrupo({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} className="-mt-6 text-14 text-danger lg:-mt-8">
      {mensagem}
    </p>
  );
}

/** Aviso geral (limite de envios, falha de rede, veículo indisponível). */
export function AvisoGeral({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p role="alert" className="flex gap-10 rounded-12 border border-danger/20 bg-danger-bg px-14 py-12 text-15 leading-140 text-danger">
      <Icon name="error" size={20} />
      {mensagem}
    </p>
  );
}

/** Campo isca para robôs: fora da tela e fora da ordem de tabulação. */
export function CampoIsca({ value, onValor }: { value: string; onValor: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-1 w-1 overflow-hidden">
      <label>
        Site
        <input type="text" name="site" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onValor(e.target.value)} />
      </label>
    </div>
  );
}

/** Autorização com o link para a política (abre em outra aba, sem perder o que foi digitado). */
export function Autorizacao({ texto, marcado, onMarcar, erro }: { texto: string; marcado: boolean; onMarcar: (v: boolean) => void; erro?: string }) {
  return (
    <div>
      <ConsentCheckbox checked={marcado} onChange={(e) => onMarcar(e.target.checked)} aria-invalid={erro ? true : undefined}>
        {texto} ·{" "}
        <Link href="/politica-de-privacidade" target="_blank" className="font-semibold text-brand underline">
          Política de privacidade
        </Link>
      </ConsentCheckbox>
    </div>
  );
}

const DICA = "Marque a autorização para enviar";

/**
 * Envio. Mobile: rodapé fixo com o botão e a dica embaixo (04, 07).
 * Desktop: "linha" = botão de 320px com a dica ao lado (23) · "bloco" = botão largo com a dica embaixo (24).
 * Sem a autorização marcada o botão fica cinza e desabilitado.
 */
export function RodapeEnvio({
  rotulo,
  rotuloEnviando = "Enviando…",
  icone,
  autorizado,
  enviando,
  desktop,
}: {
  rotulo: string;
  /** Texto durante o envio (ex.: "Enviando fotos 2 de 5…"). */
  rotuloEnviando?: string;
  icone?: NomeIcone;
  autorizado: boolean;
  enviando: boolean;
  desktop: "linha" | "bloco";
}) {
  const conteudo = (
    <>
      {enviando ? rotuloEnviando : rotulo}
      {icone && !enviando && <Icon name={icone} size={20} />}
      {enviando && <Icon name="progress_activity" size={20} className="animate-spin" />}
    </>
  );
  const dica = !autorizado && <p className="text-14 text-gray-500">{DICA}</p>;
  return (
    <>
      {/* 20px acima do rodapé: o gap-16 do formulário + 4. */}
      <StickyFooter className="-mx-16 mt-4 lg:hidden">
        <Button type="submit" size="lg" disabled={!autorizado || enviando} aria-busy={enviando} className="w-full gap-8">
          {conteudo}
        </Button>
        {!autorizado && <p className="mt-8 text-center text-14 text-gray-500">{DICA}</p>}
      </StickyFooter>
      {desktop === "linha" ? (
        <div className="hidden items-center gap-16 lg:flex">
          <Button type="submit" size="custom" disabled={!autorizado || enviando} aria-busy={enviando} className="h-56 w-320 gap-8 rounded-14 text-16 font-bold">
            {conteudo}
          </Button>
          {dica}
        </div>
      ) : (
        <div className="hidden lg:block">
          <Button type="submit" size="custom" disabled={!autorizado || enviando} aria-busy={enviando} className="h-56 w-full gap-8 rounded-14 text-16 font-bold">
            {conteudo}
          </Button>
          {!autorizado && <p className="mt-8 text-center text-14 text-gray-500">{DICA}</p>}
        </div>
      )}
    </>
  );
}
