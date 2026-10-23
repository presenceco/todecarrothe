"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { mudarStatus, salvarAnotacoes, type Lista } from "@/lib/admin/acoes-listas";
import { cn } from "@/lib/cn";
import type { Tom } from "@/lib/status";

export type OpcaoStatus = { valor: string; rotulo: string; tom: Tom };

/** Status escolhido: fundo e texto do tom (escuro: borda do tom; claro: borda clara do tom). */
const ESCOLHIDO: Record<Tom, { escuro: string; claro: string }> = {
  info: { escuro: "border-info bg-info-bg text-info", claro: "border-brand-300 bg-info-bg text-info" },
  warning: { escuro: "border-warning bg-warning-bg text-warning", claro: "border-warning-border bg-warning-bg text-warning" },
  success: { escuro: "border-success bg-success-bg text-success", claro: "border-success/40 bg-success-bg text-success" },
  neutral: { escuro: "border-neutral bg-neutral-bg text-neutral", claro: "border-neutral/40 bg-neutral-bg text-neutral" },
  danger: { escuro: "border-danger bg-danger-bg text-danger", claro: "border-danger/40 bg-danger-bg text-danger" },
};

/**
 * Status com um toque no detalhe. Escuro: cabeçalho preto do mobile (17/19), pílulas de 48px que quebram
 * linha. Claro: painel lateral do desktop (30/32), pílulas de 40px. Muda na hora (otimista) e salva.
 */
export function StatusEscolha({
  lista,
  id,
  atual,
  opcoes,
  variante,
  compacto,
}: {
  lista: Lista;
  id: string;
  atual: string;
  opcoes: OpcaoStatus[];
  variante: "escuro" | "claro";
  /** Painel da simulação (32): pílulas de 36px com padding 12. */
  compacto?: boolean;
}) {
  const [status, setStatus] = useOptimistic(atual);
  const [, iniciar] = useTransition();
  const [erro, setErro] = useState(false);
  const escuro = variante === "escuro";

  return (
    <div>
      <div role="radiogroup" aria-label="Status" className={cn("flex flex-wrap", escuro ? "gap-8" : "gap-6")}>
        {opcoes.map((o) => {
          const escolhido = o.valor === status;
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={escolhido}
              onClick={() => {
                if (escolhido) return;
                setErro(false);
                iniciar(async () => {
                  setStatus(o.valor);
                  const r = await mudarStatus(lista, id, o.valor);
                  if (!r.ok) setErro(true);
                });
              }}
              className={cn(
                "pressable box-border flex items-center rounded-pill border text-14 font-semibold whitespace-nowrap",
                escuro ? "h-48 px-16" : compacto ? "h-36 px-12" : "h-40 px-14",
                escolhido
                  ? cn("border-[1.5px]", ESCOLHIDO[o.tom][escuro ? "escuro" : "claro"])
                  : escuro
                    ? "border-gray-700 text-white hover:border-gray-500"
                    : "border-gray-150 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
      {erro && (
        <p role="alert" className={cn("mt-8 text-14", escuro ? "text-[#ff9b93]" : "text-danger")}>
          Não foi possível mudar o status. Tente de novo.
        </p>
      )}
    </div>
  );
}

const TOM_LINHA: Record<Tom, string> = {
  info: "bg-info-bg text-info",
  warning: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
  neutral: "bg-neutral-bg text-neutral",
  danger: "bg-danger-bg text-danger",
};

/** Status na linha da tabela do desktop (29, 38): pílula do tom com seta; por baixo, o seletor nativo. */
export function StatusLinha({ lista, id, atual, opcoes, rotuloItem }: { lista: Lista; id: string; atual: string; opcoes: OpcaoStatus[]; rotuloItem: string }) {
  const [status, setStatus] = useOptimistic(atual);
  const [, iniciar] = useTransition();
  const o = opcoes.find((x) => x.valor === status) ?? opcoes[0];
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-4 rounded-pill py-5 pr-6 pl-11 text-14 font-semibold whitespace-nowrap",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand",
        TOM_LINHA[o.tom],
      )}
    >
      {o.rotulo}
      <Icon name="expand_more" size={16} />
      <select
        aria-label={`Status de ${rotuloItem}`}
        value={status}
        onChange={(e) => {
          const novo = e.target.value;
          iniciar(async () => {
            setStatus(novo);
            await mudarStatus(lista, id, novo);
          });
        }}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {opcoes.map((x) => (
          <option key={x.valor} value={x.valor}>
            {x.rotulo}
          </option>
        ))}
      </select>
    </span>
  );
}

/**
 * Anotações da loja (17/30): salvam sozinhas ao sair do campo, com o aviso discreto "Salvo".
 * Cartão (mobile): mínimo 112px, padding 14. Painel (desktop): mínimo 96px, padding 12px 14px.
 */
export function Anotacoes({ lista, id, inicial, placeholder, variante }: { lista: Lista; id: string; inicial: string; placeholder: string; variante: "cartao" | "painel" }) {
  const [estado, setEstado] = useState<"parado" | "salvando" | "salvo" | "erro">("parado");
  const ultimo = useRef(inicial);
  const [, iniciar] = useTransition();
  const idCampo = `anotacoes-${variante}-${id}`;

  function salvar(texto: string) {
    if (texto === ultimo.current) return;
    setEstado("salvando");
    iniciar(async () => {
      const r = await salvarAnotacoes(lista, id, texto);
      if (r.ok) {
        ultimo.current = texto;
        setEstado("salvo");
      } else setEstado("erro");
    });
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={idCampo} className="sr-only">
        Anotações da loja
      </label>
      <textarea
        id={idCampo}
        defaultValue={inicial}
        placeholder={placeholder}
        maxLength={5000}
        onBlur={(e) => salvar(e.target.value)}
        onChange={() => estado !== "parado" && setEstado("parado")}
        className={cn(
          "box-border block w-full resize-y rounded-12 border border-gray-200 bg-white text-15 leading-145 text-ink outline-none placeholder:text-gray-400 focus:border-2 focus:border-brand focus:shadow-focus",
          variante === "cartao" ? "min-h-112 p-14 max-lg:text-16" : "min-h-96 px-14 py-12",
        )}
      />
      <p className={cn("flex items-center justify-between gap-8 text-14 text-gray-500", variante === "cartao" ? "mt-10" : "mt-6")}>
        Só a equipe da loja vê estas anotações.
        <span aria-live="polite" className={cn("flex items-center gap-4 font-medium", estado === "erro" ? "text-danger" : "text-success")}>
          {estado === "salvando" && <span className="text-gray-500">Salvando…</span>}
          {estado === "salvo" && (
            <>
              <Icon name="check" size={16} />
              Salvo
            </>
          )}
          {estado === "erro" && "Não foi possível salvar"}
        </span>
      </p>
    </div>
  );
}

/** "Copiar dados": copia o texto formatado e mostra "Copiado" por 2 segundos. */
export function BotaoCopiar({ texto, variante, alto }: { texto: string; variante: "rodape" | "painel"; /** 54px (52 + borda), painel da simulação (32). */ alto?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Sem permissão de área de transferência: seleciona num campo temporário.
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }
  return (
    <Button
      variant="neutral"
      size="custom"
      onClick={copiar}
      className={cn(
        "h-52 text-15 font-bold",
        alto && "box-content",
        variante === "rodape" ? "gap-6 rounded-14 border-[1.5px]" : "gap-8 rounded-12",
        copiado && "border-success text-success",
      )}
    >
      <Icon name={copiado ? "check" : "content_copy"} size={20} />
      <span aria-live="polite">{copiado ? "Copiado" : "Copiar dados"}</span>
    </Button>
  );
}
