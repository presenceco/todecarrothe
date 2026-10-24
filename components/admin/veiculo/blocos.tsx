"use client";

import { useState, useTransition } from "react";
import { EtiquetaBadge, StatusBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { criarOpcional, criarSelo, type RespostaCriarItem } from "@/lib/admin/acoes-veiculo";
import type { Opcional } from "@/lib/admin/veiculo";
import { cn } from "@/lib/cn";
import { STATUS_VEICULO, type Etiqueta, type StatusVeiculo } from "@/lib/status";
import { SELOS } from "@/lib/tipos";

/** Cartão do cadastro: mobile 18px 16px e título 700 17px (15); desktop 24px e título 700 18px (28). */
export function Cartao({
  titulo,
  extra,
  className,
  children,
}: {
  titulo?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-12 rounded-16 border border-gray-150 bg-white px-16 py-18 lg:gap-0 lg:p-24", className)}>
      {titulo && (
        <div className="flex items-baseline justify-between gap-12 lg:mb-16">
          <h2 className="text-17 font-bold lg:text-18">{titulo}</h2>
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

const SELECIONADO_TOM: Record<StatusVeiculo, string> = {
  disponivel: "has-checked:border-success has-checked:bg-success-bg has-checked:text-success",
  reservado: "has-checked:border-warning has-checked:bg-warning-bg has-checked:text-warning",
  vendido: "has-checked:border-neutral has-checked:bg-neutral-bg has-checked:text-neutral",
};

/**
 * Status do veículo. Mobile (15): três botões, o escolhido na cor do status. Desktop (28): linhas com
 * rádio e o selo do status; a escolhida com borda azul de 2px sobre #F5F8FE.
 */
export function SeletorStatus({ valor, onValor }: { valor: string; onValor: (v: StatusVeiculo) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Status</legend>
      <div className="grid grid-cols-[repeat(3,1fr)] gap-8 lg:flex lg:flex-col">
        {(Object.keys(STATUS_VEICULO) as StatusVeiculo[]).map((s) => {
          const st = STATUS_VEICULO[s];
          return (
            <label
              key={s}
              className={cn(
                "pressable box-border flex h-48 cursor-pointer items-center justify-center gap-12 rounded-12 border border-gray-200 bg-white text-14 font-semibold whitespace-nowrap text-gray-700",
                "has-checked:border-[1.5px] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                SELECIONADO_TOM[s],
                "lg:justify-start lg:border-gray-150 lg:px-14 lg:has-checked:border-2 lg:has-checked:border-brand lg:has-checked:bg-brand-25",
              )}
            >
              <input type="radio" name="status" value={s} checked={valor === s} onChange={() => onValor(s)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className="box-border hidden size-20 flex-none rounded-pill border-[1.5px] border-gray-250 peer-checked:border-6 peer-checked:border-brand lg:block"
              />
              <span className="lg:hidden">{st.rotulo}</span>
              {/* Envolvido: o selo é inline-flex e não pode disputar com o hidden. */}
              <span className="hidden lg:inline">
                <StatusBadge tom={st.tom} size="lg">
                  {st.rotulo}
                </StatusBadge>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Pílula de selo que liga e desliga. Ligado: #E5EEFB, texto azul, borda #B9CEF0. */
function PilulaSelo({ rotulo, ligado, onAlternar }: { rotulo: string; ligado: boolean; onAlternar: () => void }) {
  return (
    <label
      className={cn(
        "pressable box-border flex min-h-48 max-w-full cursor-pointer items-center gap-8 rounded-pill border py-6 pr-14 pl-10 text-14 font-semibold lg:min-h-42",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
        ligado ? "border-brand-200 bg-brand-50 text-brand" : "border-gray-200 bg-white text-gray-600 hover:border-gray-400",
      )}
    >
      <input type="checkbox" checked={ligado} onChange={onAlternar} className="sr-only" />
      <Icon name="check_circle" size={20} className={cn(ligado ? "icon-fill lg:[font-variation-settings:'FILL'_0]" : "text-gray-400")} />
      <span className="min-w-0 break-words">{rotulo}</span>
    </label>
  );
}

/**
 * Selos verificados (15/28): pílulas que ligam e desligam. Depois dos fixos vêm os escritos no painel;
 * "+ Adicionar selo" cria um selo novo, disponível para todos os veículos, já ligado neste.
 */
export function Selos({
  valor,
  onValor,
  ano,
  extras,
  onExtras,
  valorExtras,
  onValorExtras,
}: {
  valor: string[];
  onValor: (v: string[]) => void;
  ano: number;
  extras: Opcional[];
  onExtras: (l: Opcional[]) => void;
  valorExtras: string[];
  onValorExtras: (v: string[]) => void;
}) {
  const [criando, setCriando] = useState(false);
  const alternar = (lista: string[], chave: string) => (lista.includes(chave) ? lista.filter((v) => v !== chave) : [...lista, chave]);

  function criado(s: Opcional) {
    if (!extras.some((x) => x.id === s.id)) onExtras([...extras, s]);
    if (!valorExtras.includes(s.id)) onValorExtras([...valorExtras, s.id]);
    setCriando(false);
  }

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Selos verificados</legend>
      <div className="flex flex-wrap gap-8 lg:gap-10">
        {SELOS.map((s) => (
          <PilulaSelo key={s.chave} rotulo={s.rotulo(ano)} ligado={valor.includes(s.chave)} onAlternar={() => onValor(alternar(valor, s.chave))} />
        ))}
        {extras.map((s) => (
          <PilulaSelo key={s.id} rotulo={s.nome} ligado={valorExtras.includes(s.id)} onAlternar={() => onValorExtras(alternar(valorExtras, s.id))} />
        ))}
        {!criando && (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="pressable box-border flex h-48 items-center gap-6 rounded-pill border-[1.5px] border-dashed border-brand pr-14 pl-10 text-14 font-semibold whitespace-nowrap text-brand hover:bg-brand-100 lg:h-42"
          >
            <Icon name="add" size={20} />
            Adicionar selo
          </button>
        )}
      </div>
      {criando && (
        <NovoItem
          rotulo="Nome do selo"
          placeholder="Ex.: Laudo cautelar aprovado"
          maximo={40}
          criar={criarSelo}
          onCriado={criado}
          onCancelar={() => setCriando(false)}
          className="mt-12"
        />
      )}
    </fieldset>
  );
}

/**
 * Campo para criar um item das listas compartilhadas (opcional, selo, etiqueta): Enter ou "Adicionar" cria,
 * Esc ou o X cancela. Se já existir um item com o mesmo nome, o servidor devolve o existente.
 */
export function NovoItem({
  rotulo,
  placeholder,
  maximo,
  criar,
  onCriado,
  onCancelar,
  className,
}: {
  rotulo: string;
  placeholder: string;
  maximo: number;
  criar: (nome: string) => Promise<RespostaCriarItem>;
  onCriado: (item: Opcional) => void;
  onCancelar: () => void;
  className?: string;
}) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string>();
  const [pendente, iniciar] = useTransition();

  function adicionar() {
    if (pendente || nome.trim().length < 2) return;
    setErro(undefined);
    iniciar(async () => {
      const r = await criar(nome);
      if (!r.ok) return setErro(r.erro);
      setNome("");
      onCriado({ id: r.id, nome: r.nome });
    });
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="flex gap-8">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{rotulo}</span>
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
              if (e.key === "Escape") onCancelar();
            }}
            maxLength={maximo}
            placeholder={placeholder}
            className="box-border h-48 w-full rounded-12 border border-gray-200 px-14 text-16 outline-none focus:border-2 focus:border-brand lg:h-44 lg:text-15"
          />
        </label>
        <button
          type="button"
          onClick={adicionar}
          disabled={pendente || nome.trim().length < 2}
          className="pressable h-48 rounded-12 bg-brand px-16 text-15 font-bold text-white disabled:bg-gray-180 disabled:text-gray-500 lg:h-44"
        >
          Adicionar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          aria-label="Cancelar"
          className="pressable flex size-48 flex-none items-center justify-center rounded-12 border border-gray-200 lg:size-44"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      {erro && <p className="text-14 text-danger">{erro}</p>}
    </div>
  );
}

/** Caixa de seleção dos opcionais: 24px raio 7 no mobile (15); 20px raio 6 no desktop (28). */
function CaixaOpcional({ nome, marcado, onMarcar, className }: { nome: string; marcado: boolean; onMarcar: () => void; className?: string }) {
  return (
    <label className={cn("flex min-h-48 cursor-pointer items-center gap-12 text-15 text-ink-500 lg:min-h-0 lg:gap-10", className)}>
      <input type="checkbox" checked={marcado} onChange={onMarcar} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "box-border flex size-24 flex-none items-center justify-center rounded-7 border-[1.5px] lg:size-20 lg:rounded-6",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
          marcado ? "border-brand bg-brand text-white" : "border-gray-250 bg-white text-transparent",
        )}
      >
        <Icon name="check" size={18} className="lg:text-16!" />
      </span>
      {nome}
    </label>
  );
}

const VISIVEIS_MOBILE = 7;

/**
 * Opcionais (15/28). Mobile: cartão recolhível com os 7 primeiros e "Ver todos os N opcionais".
 * Desktop: todos em 3 colunas. "+ Adicionar opcional" cria um opcional para todos os veículos.
 */
export function Opcionais({ lista, onLista, valor, onValor }: { lista: Opcional[]; onLista: (l: Opcional[]) => void; valor: string[]; onValor: (v: string[]) => void }) {
  const [aberto, setAberto] = useState(true);
  const [todos, setTodos] = useState(false);
  const [criando, setCriando] = useState(false);
  const alternar = (id: string) => onValor(valor.includes(id) ? valor.filter((v) => v !== id) : [...valor, id]);

  function criado(o: Opcional) {
    if (!lista.some((x) => x.id === o.id)) onLista([...lista, o]);
    if (!valor.includes(o.id)) onValor([...valor, o.id]);
    setCriando(false);
    setTodos(true);
  }

  const botaoNovo = (
    <button type="button" onClick={() => setCriando(true)} className="text-14 font-semibold whitespace-nowrap text-brand hover:underline">
      + Adicionar opcional
    </button>
  );

  return (
    <section className="overflow-hidden rounded-16 border border-gray-150 bg-white lg:p-24">
      <div className="flex h-56 items-center justify-between pr-4 pl-16 lg:mb-16 lg:h-auto lg:items-baseline lg:p-0">
        <h2 className="text-17 font-bold lg:text-18">
          Opcionais
          <span className="font-medium text-gray-500 lg:hidden">
            {" "}
            · {valor.length} de {lista.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-label={aberto ? "Recolher opcionais" : "Mostrar opcionais"}
          className="pressable flex size-48 items-center justify-center lg:hidden"
        >
          <Icon name={aberto ? "expand_less" : "expand_more"} className="text-brand" />
        </button>
        <span className="hidden lg:inline">{botaoNovo}</span>
      </div>
      <div className={cn("border-t border-gray-120 px-16 pt-4 pb-12 lg:block lg:border-0 lg:p-0", !aberto && "hidden")}>
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-24 lg:gap-y-12">
          {lista.map((o, i) => (
            <CaixaOpcional
              key={o.id}
              nome={o.nome}
              marcado={valor.includes(o.id)}
              onMarcar={() => alternar(o.id)}
              className={!todos && i >= VISIVEIS_MOBILE ? "max-lg:hidden" : undefined}
            />
          ))}
        </div>
        {!todos && lista.length > VISIVEIS_MOBILE && (
          <button type="button" onClick={() => setTodos(true)} className="flex h-48 items-center text-15 font-semibold text-brand lg:hidden">
            Ver todos os {lista.length} opcionais
          </button>
        )}
        {criando ? (
          <NovoItem
            rotulo="Nome do opcional"
            placeholder="Ex.: Teto panorâmico"
            maximo={60}
            criar={criarOpcional}
            onCriado={criado}
            onCancelar={() => setCriando(false)}
            className="mt-8 lg:mt-16"
          />
        ) : (
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="pressable mt-4 flex h-48 w-full items-center justify-center gap-6 rounded-12 border-[1.5px] border-dashed border-brand text-15 font-bold whitespace-nowrap text-brand hover:bg-brand-100 lg:hidden"
          >
            <Icon name="add" size={20} />
            Adicionar opcional
          </button>
        )}
      </div>
    </section>
  );
}

/** Prévia do cartão no catálogo (28): foto 4:3 com a etiqueta, marca, modelo, versão · ano · km e preço. */
export function Previa({
  capa,
  etiqueta,
  etiquetaTexto,
  marca,
  modelo,
  linha,
  preco,
}: {
  capa: string | null;
  etiqueta: Etiqueta;
  etiquetaTexto: string | null;
  marca: string;
  modelo: string;
  linha: string;
  preco: string;
}) {
  return (
    <div className="overflow-hidden rounded-14 border border-gray-150">
      <div className="relative aspect-[4/3] bg-hatch">
        {/* eslint-disable-next-line @next/next/no-img-element -- prévia ao vivo, a foto pode ainda não ter passado pelo otimizador */}
        {capa && <img src={capa} alt="" className="absolute inset-0 size-full object-cover" />}
        <EtiquetaBadge etiqueta={etiqueta} texto={etiquetaTexto} className="absolute top-10 left-10" />
      </div>
      <div className="p-14">
        <p className="truncate text-14 font-bold tracking-[0.08em] text-brand uppercase">{marca || "Marca"}</p>
        <p className="truncate font-display text-20 font-extrabold italic">{modelo || "Modelo"}</p>
        <p className="truncate text-14 text-gray-500">{linha || "Versão · ano · km"}</p>
        <p className="mt-8 text-22 font-extrabold tabular-nums">{preco ? `R$ ${preco}` : "R$ —"}</p>
      </div>
    </div>
  );
}

