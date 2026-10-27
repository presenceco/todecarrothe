"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetHandle } from "@/components/ui/sheet";
import { excluirVeiculo, mudarStatusVeiculo, type Resultado } from "@/lib/admin/acoes-estoque";
import type { LinhaEstoque } from "@/lib/admin/estoque";
import { cn } from "@/lib/cn";
import { anoFabModelo, km, moeda } from "@/lib/formato";
import { urlAssinada } from "@/lib/fotos-veiculo";
import type { NomeIcone } from "@/lib/icones";
import { STATUS_VEICULO, type StatusVeiculo } from "@/lib/status";

type Acao = { chave: string; rotulo: string; icone: NomeIcone; status?: StatusVeiculo; href?: string; perigo?: boolean };

const nome = (v: LinhaEstoque) => [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");

/**
 * Ações do veículo conforme o status (13 e 27): disponível → reservar/vender; reservado → voltar a
 * disponível/vender; vendido → "Reativar". "Ver no catálogo" só quando ele aparece lá.
 */
function acoesDoVeiculo(v: LinhaEstoque): Acao[] {
  const lista: Acao[] = [];
  if (v.status === "disponivel") lista.push({ chave: "reservar", rotulo: "Marcar como reservado", icone: "bookmark", status: "reservado" });
  if (v.status === "reservado") lista.push({ chave: "liberar", rotulo: "Marcar como disponível", icone: "check_circle", status: "disponivel" });
  if (v.status !== "vendido") lista.push({ chave: "vender", rotulo: "Marcar como vendido", icone: "sell", status: "vendido" });
  if (v.status === "vendido") lista.push({ chave: "reativar", rotulo: "Reativar", icone: "restart_alt", status: "disponivel" });
  if (v.status === "disponivel" && v.publicado) lista.push({ chave: "ver", rotulo: "Ver no catálogo", icone: "open_in_new", href: `/carros/${v.slug}` });
  lista.push({ chave: "excluir", rotulo: "Excluir", icone: "delete", perigo: true });
  return lista;
}

/** Executa uma Server Action e guarda a mensagem de erro, se houver. */
function useAcao() {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string>();
  function executar(acao: () => Promise<Resultado>, depois?: () => void) {
    setErro(undefined);
    iniciar(async () => {
      const r = await acao();
      if (r.ok) depois?.();
      else setErro(r.erro);
    });
  }
  return { pendente, erro, executar, limpar: () => setErro(undefined) };
}

/** Confirmação de exclusão (14): painel inferior no mobile, caixa centralizada no desktop. */
function ConfirmarExclusao({ v, aberto, onFechar }: { v: LinhaEstoque; aberto: boolean; onFechar: () => void }) {
  const { pendente, erro, executar, limpar } = useAcao();
  const idTitulo = useId();
  return (
    <Sheet
      open={aberto}
      onClose={() => {
        limpar();
        onFechar();
      }}
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
      <h2 id={idTitulo} className="text-22 leading-125 font-bold">
        Excluir {nome(v)}?
      </h2>
      <p className="text-16 leading-150 text-gray-700">
        Ele sai do catálogo e não dá para desfazer. Se foi vendido, use <strong>Marcar como vendido</strong>.
      </p>
      {erro && (
        <p role="alert" className="text-15 text-danger">
          {erro}
        </p>
      )}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <Button variant="neutral" size="lg" onClick={onFechar} disabled={pendente}>
          Cancelar
        </Button>
        <Button
          size="lg"
          disabled={pendente}
          aria-busy={pendente}
          onClick={() => executar(() => excluirVeiculo(v.id), onFechar)}
          className="gap-8 bg-danger text-white hover:bg-danger-hover"
        >
          {pendente && <Icon name="progress_activity" size={20} className="animate-spin" />}
          Excluir
        </Button>
      </div>
    </Sheet>
  );
}

/** "⋯" do cartão mobile: painel inferior com resumo do veículo e as ações (13). */
export function AcoesVeiculoMobile({ v }: { v: LinhaEstoque }) {
  const [aberto, setAberto] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const { pendente, erro, executar, limpar } = useAcao();
  const idTitulo = useId();
  const st = STATUS_VEICULO[v.status];
  const fechar = () => {
    limpar();
    setAberto(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Ações de ${nome(v)}`}
        aria-haspopup="dialog"
        onClick={() => setAberto(true)}
        className="pressable absolute top-2 right-2 z-1 flex size-48 items-center justify-center rounded-12 text-gray-700"
      >
        <Icon name="more_horiz" />
      </button>

      <Sheet open={aberto} onClose={fechar} labelledBy={idTitulo} className="rounded-t-24 bg-white pt-10 pb-[calc(24px+env(safe-area-inset-bottom,0px))] text-ink">
        <div data-sheet-drag>
          <SheetHandle />
          <div className="flex items-center gap-12 border-b border-gray-120 px-20 py-16">
            <div className="relative h-66 w-88 flex-none overflow-hidden rounded-10 bg-hatch-sm">
              {v.capa && <Image src={v.capa} alt="" fill sizes="88px" unoptimized={urlAssinada(v.capa)} className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 id={idTitulo} className="truncate text-17 font-bold">
                {nome(v)}
              </h2>
              <p className="text-14 text-gray-500">
                {anoFabModelo(v.anoFabricacao, v.anoModelo)} · {km(v.km)}
              </p>
              <div className="mt-6 flex items-center gap-10">
                <span className="text-17 font-extrabold whitespace-nowrap tabular-nums">{moeda(v.preco)}</span>
                <StatusBadge tom={st.tom} size="sm">
                  {st.rotulo}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>
        {erro && (
          <p role="alert" className="mx-20 mt-12 text-15 text-danger">
            {erro}
          </p>
        )}
        <div className="flex flex-col px-8 pt-8 pb-4">
          <Link href={`/admin/estoque/${v.id}`} className="pressable flex h-56 items-center gap-16 rounded-12 px-14 text-16 font-semibold hover:bg-gray-100">
            <Icon name="edit" />
            Editar
          </Link>
          {acoesDoVeiculo(v).map((a) =>
            a.href ? (
              <a key={a.chave} href={a.href} target="_blank" rel="noopener" className="pressable flex h-56 items-center gap-16 rounded-12 px-14 text-16 font-semibold hover:bg-gray-100">
                <Icon name={a.icone} />
                {a.rotulo}
              </a>
            ) : (
              <button
                key={a.chave}
                type="button"
                disabled={pendente}
                onClick={() => {
                  if (a.perigo) {
                    setAberto(false);
                    setConfirmar(true);
                  } else if (a.status) executar(() => mudarStatusVeiculo(v.id, a.status!), fechar);
                }}
                className={cn(
                  "pressable flex h-56 items-center gap-16 rounded-12 px-14 text-left text-16 font-semibold disabled:opacity-50",
                  a.perigo ? "text-danger hover:bg-danger-bg" : "hover:bg-gray-100",
                )}
              >
                <Icon name={a.icone} />
                {a.rotulo}
              </button>
            ),
          )}
        </div>
        <div className="px-20 pt-8">
          {/* 54px: 52 + borda, como na referência (docs/notas-referencia.md). */}
          <Button variant="neutral" size="custom" onClick={fechar} className="h-54 w-full rounded-14 text-16 font-bold">
            Cancelar
          </Button>
        </div>
      </Sheet>

      <ConfirmarExclusao v={v} aberto={confirmar} onFechar={() => setConfirmar(false)} />
    </>
  );
}

/** Ações da linha da tabela desktop (27): "Editar" e o menu "⋯" com as demais ações. */
export function AcoesVeiculoDesktop({ v, abrirAcima }: { v: LinhaEstoque; abrirAcima?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const { pendente, erro, executar, limpar } = useAcao();
  const caixa = useRef<HTMLDivElement>(null);
  const idMenu = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="flex justify-end gap-8">
      <ButtonLink href={`/admin/estoque/${v.id}`} variant="neutral" size="sm" className="gap-6 px-14">
        <Icon name="edit" size={18} />
        Editar
      </ButtonLink>
      <button
        type="button"
        aria-label={`Mais ações de ${nome(v)}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? idMenu : undefined}
        onClick={() => {
          limpar();
          setAberto((a) => !a);
        }}
        className={cn(
          "pressable box-border flex size-40 items-center justify-center rounded-10 text-gray-700",
          aberto ? "border-[1.5px] border-brand bg-brand-50" : "border border-gray-200 bg-white hover:bg-gray-100",
        )}
      >
        <Icon name="more_horiz" size={22} />
      </button>

      {aberto && (
        <div
          id={idMenu}
          role="menu"
          className={cn(
            "absolute right-20 z-20 flex w-274 flex-col rounded-14 border border-gray-150 bg-white p-6 shadow-menu",
            abrirAcima ? "bottom-60" : "top-60",
          )}
        >
          {erro && (
            <p role="alert" className="px-12 py-8 text-14 text-danger">
              {erro}
            </p>
          )}
          {acoesDoVeiculo(v).map((a) => {
            const classes = cn(
              "flex h-44 items-center gap-12 rounded-10 px-12 text-left text-15 font-medium whitespace-nowrap disabled:opacity-50",
              a.perigo ? "mt-0 h-45 border-t border-gray-120 text-danger hover:bg-danger-bg" : "hover:bg-gray-100",
            );
            return a.href ? (
              <a key={a.chave} role="menuitem" href={a.href} target="_blank" rel="noopener" onClick={() => setAberto(false)} className={classes}>
                <Icon name={a.icone} size={20} />
                {a.rotulo}
              </a>
            ) : (
              <button
                key={a.chave}
                type="button"
                role="menuitem"
                disabled={pendente}
                onClick={() => {
                  if (a.perigo) {
                    setAberto(false);
                    setConfirmar(true);
                  } else if (a.status) executar(() => mudarStatusVeiculo(v.id, a.status!), () => setAberto(false));
                }}
                className={classes}
              >
                <Icon name={a.icone} size={20} />
                {a.rotulo}
              </button>
            );
          })}
        </div>
      )}

      <ConfirmarExclusao v={v} aberto={confirmar} onFechar={() => setConfirmar(false)} />
    </div>
  );
}
