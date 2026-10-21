"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { ConsentCheckbox, FilterCheckbox } from "@/components/ui/checkbox";
import { Textarea, TextInput } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { OptionGroup, RotuloPrazo } from "@/components/ui/option-group";
import { SelectField } from "@/components/ui/select-field";
import { Sheet, SheetHandle } from "@/components/ui/sheet";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { Switch } from "@/components/ui/switch";

const MARCAS = ["Toyota", "Jeep", "Fiat", "Volkswagen", "Hyundai", "Chevrolet", "Honda", "Renault"].map((m) => ({ value: m, label: m }));
const opcoes = (lista: string[]) => lista.map((v) => ({ value: v, label: v }));
const ANOS = Array.from({ length: 17 }, (_, i) => String(2010 + i)).map((a) => ({ value: a, label: a }));

/** Painel inferior de filtros (tela 02), sem o controle de faixa de preço (etapa 4). */
export function FiltrosDemo() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button onClick={() => setAberto(true)} className="px-20">
        Abrir filtros (02)
      </Button>
      <Sheet
        open={aberto}
        onClose={() => setAberto(false)}
        labelledBy="titulo-filtros"
        className="flex h-[calc(100dvh-44px)] flex-col overflow-hidden rounded-t-24 bg-white"
      >
        <div data-sheet-drag className="flex-none">
          <SheetHandle className="mt-10" />
          <div className="flex items-center justify-between py-6 pr-8 pl-20">
            <h2 id="titulo-filtros" className="font-display text-24 font-extrabold italic">
              Filtros
            </h2>
            <div className="flex items-center">
              <button type="button" className="pressable px-8 text-15 font-semibold text-brand">
                Limpar
              </button>
              <IconButton icon="close" label="Fechar filtros" onClick={() => setAberto(false)} />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-20 overflow-y-auto overscroll-contain px-20 pt-4 pb-20">
          <OptionGroup
            name="marca"
            type="checkbox"
            shape="pill"
            legend="Marca"
            legendClassName="mb-10 text-15 font-bold"
            options={MARCAS}
            defaultValue={["Toyota", "Jeep"]}
            className="-mr-20 flex gap-8 overflow-x-auto pr-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="mb-10 text-15 font-bold">Ano</div>
              <div className="flex gap-8">
                <SelectField name="anoDe" aria-label="Ano de" size="md" placeholder="De" options={ANOS} defaultValue="2020" />
                <SelectField name="anoAte" aria-label="Ano até" size="md" placeholder="Até" options={ANOS} defaultValue="2024" />
              </div>
            </div>
            <OptionGroup
              name="cambio"
              legend="Câmbio"
              legendClassName="mb-10 text-15 font-bold"
              options={opcoes(["Automático", "Manual"])}
              defaultValue="Automático"
              className="grid grid-cols-2 gap-6"
            />
          </div>
          <OptionGroup
            name="km"
            legend="Km máximo"
            legendClassName="mb-10 text-15 font-bold"
            options={opcoes(["30 mil", "50 mil", "80 mil", "Qualquer"])}
            defaultValue="80 mil"
            className="grid grid-cols-4 gap-8"
          />
          <OptionGroup
            name="combustivel"
            legend="Combustível"
            legendClassName="mb-10 text-15 font-bold"
            options={opcoes(["Flex", "Gasolina", "Diesel", "Híbrido"])}
            defaultValue="Flex"
            className="grid grid-cols-4 gap-8"
          />
          <OptionGroup
            name="tipo"
            type="checkbox"
            legend="Tipo"
            legendClassName="mb-10 text-15 font-bold"
            options={opcoes(["Hatch", "Sedã", "SUV", "Picape"])}
            defaultValue={["Sedã", "SUV"]}
            className="grid grid-cols-4 gap-8"
          />
        </div>
        <div className="flex-none border-t border-gray-120 bg-white px-20 pt-12 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
          <Button size="lg" className="w-full" onClick={() => setAberto(false)}>
            Ver 24 veículos
          </Button>
        </div>
      </Sheet>
    </>
  );
}

const ACOES = [
  { icone: "edit", rotulo: "Editar", cor: "" },
  { icone: "bookmark", rotulo: "Marcar como reservado", cor: "" },
  { icone: "sell", rotulo: "Marcar como vendido", cor: "" },
  { icone: "open_in_new", rotulo: "Ver no catálogo", cor: "" },
  { icone: "delete", rotulo: "Excluir", cor: "text-danger" },
] as const;

/** Painel de ações do veículo (tela 13). */
export function AcoesDemo() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Button variant="neutral" onClick={() => setAberto(true)} className="px-20">
        Abrir ações (13)
      </Button>
      <Sheet open={aberto} onClose={() => setAberto(false)} label="Ações do veículo" className="rounded-t-24 bg-white pt-10 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <div data-sheet-drag>
          <SheetHandle />
          <div className="flex items-center gap-12 border-b border-gray-120 px-20 py-16">
            <div className="h-66 w-88 flex-none rounded-10 bg-hatch-sm" />
            <div className="min-w-0 flex-1">
              <div className="text-17 font-bold">Toyota Corolla XEi 2.0</div>
              <div className="text-14 text-gray-500">2022/2023 · 38.000 km</div>
              <div className="mt-6 flex items-center gap-10">
                <span className="text-17 font-extrabold whitespace-nowrap tabular-nums">R$ 129.900</span>
                <StatusBadge tom="success" size="sm">
                  Disponível
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col px-8 pt-8 pb-4">
          {ACOES.map((a) => (
            <button
              key={a.rotulo}
              type="button"
              onClick={() => setAberto(false)}
              className={`pressable flex h-56 items-center gap-16 rounded-12 px-14 text-16 font-semibold whitespace-nowrap hover:bg-gray-100 ${a.cor}`}
            >
              <Icon name={a.icone} />
              {a.rotulo}
            </button>
          ))}
        </div>
        <div className="px-20 pt-8">
          <Button variant="neutral" size="custom" className="h-54 w-full rounded-14 text-16 font-bold" onClick={() => setAberto(false)}>
            Cancelar
          </Button>
        </div>
      </Sheet>
    </>
  );
}

/** Campos e controles dos formulários (telas 04 e 07). */
export function FormDemo() {
  const [autorizado, setAutorizado] = useState(false);
  const [troca, setTroca] = useState(true);
  return (
    <form className="flex flex-col gap-16 bg-gray-100 pt-20" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-16 px-16">
        <section className="flex flex-col gap-14 rounded-16 border border-gray-150 bg-white px-16 py-18">
          <h2 className="text-17 font-bold">Seus dados</h2>
          <TextInput name="nome" label="Nome completo" defaultValue="Ana Paula Rocha" autoComplete="name" />
          <TextInput name="cpf" label="CPF" placeholder="000.000.000-00" inputMode="numeric" />
          <TextInput name="nascimento" label="Data de nascimento" placeholder="dd/mm/aaaa" inputMode="numeric" />
          <TextInput name="whatsapp" label="WhatsApp" placeholder="(86) 9 0000-0000" type="tel" error="Informe um WhatsApp com DDD." />
          <SelectField name="faixa" label="Faixa de preço" placeholder="Selecione" options={opcoes(["Até R$ 50 mil", "R$ 50 a 80 mil", "R$ 80 a 110 mil"])} />
        </section>
        <section className="flex flex-col gap-14 rounded-16 border border-gray-150 bg-white px-16 py-18">
          <h2 className="text-17 font-bold">Financiamento</h2>
          <OptionGroup
            name="prazo"
            legend="Prazo desejado"
            legendClassName="mb-6 text-14 font-semibold text-gray-700"
            height={52}
            options={[24, 36, 48, 60].map((m) => ({ value: String(m), label: <RotuloPrazo meses={m} /> }))}
            defaultValue="48"
            className="grid grid-cols-4 gap-8"
          />
          <OptionGroup
            name="troca"
            legend="Tem veículo para dar na troca?"
            legendClassName="mb-14 text-17 font-bold"
            textSize={15}
            options={opcoes(["Sim", "Não"])}
            defaultValue="Sim"
          />
          <Switch checked={troca} onChange={(e) => setTroca(e.target.checked)}>
            Tenho carro para dar de entrada
          </Switch>
          <Textarea name="anotacoes" label="Anotações da loja" placeholder="Escreva aqui o andamento da busca…" hint="Só a equipe da loja vê estas anotações." />
          <FilterCheckbox count={5} defaultChecked>
            Toyota
          </FilterCheckbox>
        </section>
        <ConsentCheckbox checked={autorizado} onChange={(e) => setAutorizado(e.target.checked)}>
          Autorizo o uso dos meus dados para a simulação de crédito ·{" "}
          <a href="/politica-de-privacidade" target="_blank" className="font-semibold text-brand underline">
            Política de privacidade
          </a>
        </ConsentCheckbox>
      </div>
      <StickyFooter>
        <Button type="submit" size="lg" disabled={!autorizado} className="w-full gap-8">
          Enviar para simulação
          <Icon name="send" size={20} />
        </Button>
        {!autorizado && <p className="mt-8 text-center text-14 text-gray-500">Marque a autorização para enviar</p>}
      </StickyFooter>
    </form>
  );
}
