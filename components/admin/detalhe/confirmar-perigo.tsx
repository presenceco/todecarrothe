"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetHandle } from "@/components/ui/sheet";

/**
 * Confirmação de ação sem volta, no padrão da tela 14: painel inferior no mobile, caixa centralizada no
 * desktop. `acao` roda ao confirmar; com erro, mostra a mensagem e continua aberta.
 */
export function ConfirmarPerigo({
  aberto,
  onFechar,
  titulo,
  texto,
  rotulo = "Excluir",
  acao,
  depois,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  texto: string;
  rotulo?: string;
  acao: () => Promise<{ ok: true } | { ok: false; erro: string }>;
  depois?: () => void;
}) {
  const [erro, setErro] = useState<string>();
  const [pendente, iniciar] = useTransition();
  const idTitulo = useId();
  const fechar = () => {
    if (pendente) return;
    setErro(undefined);
    onFechar();
  };

  return (
    <Sheet
      open={aberto}
      onClose={fechar}
      labelledBy={idTitulo}
      centroNoDesktop
      className="flex flex-col gap-14 rounded-t-24 bg-white px-20 pt-10 pb-[calc(28px+env(safe-area-inset-bottom,0px))] text-ink lg:p-28"
    >
      <div data-sheet-drag className="lg:hidden">
        <SheetHandle />
      </div>
      <div aria-hidden="true" className="mt-10 flex size-56 items-center justify-center rounded-pill bg-danger-bg text-danger lg:mt-0">
        <Icon name="delete" size={30} />
      </div>
      <h2 id={idTitulo} className="text-22 leading-125 font-bold break-words">
        {titulo}
      </h2>
      <p className="text-16 leading-150 text-gray-700">{texto}</p>
      {erro && (
        <p role="alert" className="text-15 text-danger">
          {erro}
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <Button variant="neutral" size="lg" onClick={fechar} disabled={pendente}>
          Cancelar
        </Button>
        <Button
          size="lg"
          disabled={pendente}
          aria-busy={pendente}
          onClick={() => {
            setErro(undefined);
            iniciar(async () => {
              const r = await acao();
              if (r.ok) {
                onFechar();
                depois?.();
              } else setErro(r.erro);
            });
          }}
          className="gap-8 bg-danger text-white hover:bg-danger-hover"
        >
          {pendente && <Icon name="progress_activity" size={20} className="animate-spin" />}
          {rotulo}
        </Button>
      </div>
    </Sheet>
  );
}
