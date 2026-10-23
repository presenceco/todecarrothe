import Image from "next/image";
import Link from "next/link";
import { Logo, Simbolo } from "@/components/site/logo";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { NomeIcone } from "@/lib/icones";
import { linkWhatsappLoja, loja } from "@/lib/loja";

export type ResumoConfirmacao = {
  rotulo: string;
  titulo: string;
  /** Texto à direita (preço) ou abaixo do título. */
  destaque?: string;
  detalhe?: string;
  foto?: string | null;
  /** Sem veículo do estoque (pedido, consignação, valor aproximado): ícone no lugar da foto. */
  icone?: NomeIcone;
};

/**
 * Confirmação de envio (06 simulação; o mesmo padrão em /nao-encontrou/enviado e /venda-seu-carro/enviado):
 * selo azul com ✓, título, resumo, horário de resposta, "Voltar ao estoque" e "Falar agora no WhatsApp".
 * No mobile ocupa a tela, com os botões no pé; no desktop fica numa coluna centralizada.
 */
export function Confirmacao({
  titulo,
  texto,
  resumo,
  mensagemWhatsapp,
}: {
  titulo: string;
  texto: string;
  resumo: ResumoConfirmacao | null;
  mensagemWhatsapp: string;
}) {
  return (
    <>
      <div className="flex h-64 items-center justify-center bg-black pt-[env(safe-area-inset-top,0px)] box-content lg:hidden">
        <Link href="/" aria-label="Tô de Carro Seminovos, início">
          <Logo size="header" />
        </Link>
      </div>
      <main className="relative flex min-h-[calc(100dvh-64px)] flex-col overflow-hidden px-24 lg:mx-auto lg:min-h-0 lg:max-w-520 lg:px-0 lg:pt-72 lg:pb-96">
        <Simbolo className="pointer-events-none absolute top-120 -right-120 w-420 opacity-6 lg:hidden" />
        <div className="relative flex flex-1 flex-col justify-center">
          <div className="flex size-96 items-center justify-center rounded-pill bg-brand text-white shadow-success">
            <Icon name="check" size={56} className="[font-variation-settings:'wght'_600]" />
          </div>
          <h1 className="mt-32 font-display text-34 leading-105 font-extrabold italic">{titulo}</h1>
          <p className="mt-12 text-18 leading-145 text-gray-700">{texto}</p>

          {resumo && (
            <div className="mt-28 flex items-center gap-12 rounded-16 border border-gray-150 bg-white p-12">
              {resumo.icone ? (
                <div className="flex h-60 w-80 flex-none items-center justify-center rounded-10 bg-brand-100 text-brand">
                  <Icon name={resumo.icone} size={28} />
                </div>
              ) : (
                <div className="relative h-60 w-80 flex-none overflow-hidden rounded-10 bg-hatch-sm">
                  {resumo.foto && <Image src={resumo.foto} alt={`${resumo.titulo} – foto 1`} fill sizes="80px" className="object-cover" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-14 text-gray-500">{resumo.rotulo}</p>
                <p className="text-16 font-bold">{resumo.titulo}</p>
                {resumo.detalhe && <p className="text-14 text-gray-600">{resumo.detalhe}</p>}
                {/* Abaixo de 375px o preço não cabe ao lado: desce para baixo do título. */}
                {resumo.destaque && <p className="mt-2 text-17 font-extrabold tabular-nums min-[375px]:hidden">{resumo.destaque}</p>}
              </div>
              {resumo.destaque && <p className="hidden text-17 font-extrabold whitespace-nowrap tabular-nums min-[375px]:block">{resumo.destaque}</p>}
            </div>
          )}

          <p className="mt-20 flex gap-10 text-15 leading-145 text-gray-700">
            <Icon name="schedule" size={20} className="text-brand" />
            <span>{loja.horarioResposta}</span>
          </p>
        </div>

        <div className="relative flex flex-col gap-8 pt-16 pb-[calc(32px+env(safe-area-inset-bottom,0px))] lg:pt-32 lg:pb-0">
          <ButtonLink href="/" size="lg">
            Voltar ao estoque
          </ButtonLink>
          <ButtonAnchor href={linkWhatsappLoja(mensagemWhatsapp)} variant="whatsapp-outline" size="lg" className="box-border gap-8">
            <Icon name="chat" size={20} fill />
            Falar agora no WhatsApp
          </ButtonAnchor>
        </div>
      </main>
    </>
  );
}
