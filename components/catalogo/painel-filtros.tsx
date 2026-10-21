"use client";

import { FilterCheckbox } from "@/components/ui/checkbox";
import { OptionGroup } from "@/components/ui/option-group";
import { RangeSlider } from "@/components/ui/range-slider";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/cn";
import {
  alternar,
  CAMBIOS,
  COMBUSTIVEIS,
  KM_MAXIMOS,
  milReais,
  PRECO,
  rotuloPreco,
  TIPOS,
  type Filtros,
} from "@/lib/catalogo/filtros";
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL, ROTULO_TIPO } from "@/lib/tipos";

export type MarcaContada = { slug: string; nome: string; total: number };

type Props = {
  filtros: Filtros;
  /** Mudança imediata (seleções). */
  onChange: (f: Filtros) => void;
  /** Mudança da faixa de preço ao soltar a alça (o desktop navega só aqui). */
  onPrecoCommit?: (f: Filtros) => void;
  marcas: readonly MarcaContada[];
  anos: { min: number; max: number };
  /** sheet: painel inferior do mobile (02) · lateral: coluna de filtros do desktop (21). */
  variante: "sheet" | "lateral";
};

const KM_OPCOES = [...KM_MAXIMOS.map((km) => ({ value: String(km), label: `${km / 1000} mil` })), { value: "", label: "Qualquer" }];
const opcoes = <T extends string>(valores: readonly T[], rotulos: Record<T, string>) => valores.map((v) => ({ value: v, label: rotulos[v] }));
const ROTULO_CAMBIO_LONGO = Object.fromEntries(CAMBIOS.map((c) => [c, ROTULO_CAMBIO[c].longo])) as Record<(typeof CAMBIOS)[number], string>;

export function PainelFiltros({ filtros, onChange, onPrecoCommit, marcas, anos, variante }: Props) {
  const sheet = variante === "sheet";
  const titulo = "text-15 font-bold";
  const legenda = cn(titulo, "mb-10");
  const altura = sheet ? 48 : 44;
  const grade = sheet ? "grid grid-cols-4 gap-8" : "grid grid-cols-2 gap-8";

  const anosOpcoes = Array.from({ length: anos.max - anos.min + 1 }, (_, i) => String(anos.max - i)).map((a) => ({ value: a, label: a }));
  const definirPreco = (f: Filtros, [min, max]: [number, number]): Filtros => ({
    ...f,
    precoMin: min > PRECO.min ? min : null,
    precoMax: max < PRECO.max ? max : null,
  });

  const marca = sheet ? (
    <OptionGroup
      name="marca"
      type="checkbox"
      shape="pill"
      legend="Marca"
      legendClassName={legenda}
      options={marcas.map((m) => ({ value: m.slug, label: m.nome }))}
      value={filtros.marcas}
      onValueChange={(v) => onChange({ ...filtros, marcas: alternar(filtros.marcas, v) })}
      className="-mr-20 flex gap-8 overflow-x-auto pr-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    />
  ) : (
    <fieldset>
      <legend className={legenda}>Marca</legend>
      <div className="flex flex-col gap-2">
        {marcas.map((m) => (
          <FilterCheckbox
            key={m.slug}
            name="marca"
            value={m.slug}
            count={m.total}
            checked={filtros.marcas.includes(m.slug)}
            onChange={() => onChange({ ...filtros, marcas: alternar(filtros.marcas, m.slug) })}
          >
            {m.nome}
          </FilterCheckbox>
        ))}
      </div>
    </fieldset>
  );

  const preco = (
    <div>
      {sheet ? (
        <div className="flex items-baseline justify-between">
          <span className={titulo}>Faixa de preço</span>
          <span className="text-15 font-bold text-brand tabular-nums">{rotuloPreco(filtros.precoMin, filtros.precoMax, true)}</span>
        </div>
      ) : (
        <>
          <div className={titulo}>Faixa de preço</div>
          <div className="mt-4 text-14 font-semibold text-brand">{rotuloPreco(filtros.precoMin, filtros.precoMax, true)}</div>
        </>
      )}
      <RangeSlider
        min={PRECO.min}
        max={PRECO.max}
        passo={PRECO.passo}
        valor={[filtros.precoMin ?? PRECO.min, filtros.precoMax ?? PRECO.max]}
        onChange={sheet ? (v) => onChange(definirPreco(filtros, v)) : undefined}
        onCommit={(v) => (onPrecoCommit ?? onChange)(definirPreco(filtros, v))}
        rotulos={["Preço mínimo", "Preço máximo"]}
        textoValor={(n) => (n >= PRECO.max ? `${milReais(n)} ou mais` : milReais(n))}
        sombra={sheet}
        className={sheet ? "mt-12" : "mt-8"}
      />
      {sheet && (
        <div className="mt-2 flex justify-between text-14 text-gray-500">
          <span>{milReais(PRECO.min)}</span>
          <span>{milReais(PRECO.max)}+</span>
        </div>
      )}
    </div>
  );

  const ano = (
    <div>
      <div className={legenda}>Ano</div>
      <div className="flex gap-8">
        <SelectField
          name="anoDe"
          aria-label="Ano de"
          size={sheet ? "md" : "sm"}
          placeholder="De"
          options={[...anosOpcoes].reverse()}
          value={filtros.anoDe !== null ? String(filtros.anoDe) : ""}
          onChange={(e) => onChange({ ...filtros, anoDe: e.target.value ? Number(e.target.value) : null })}
        />
        <SelectField
          name="anoAte"
          aria-label="Ano até"
          size={sheet ? "md" : "sm"}
          placeholder="Até"
          options={anosOpcoes}
          value={filtros.anoAte !== null ? String(filtros.anoAte) : ""}
          onChange={(e) => onChange({ ...filtros, anoAte: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  );

  // Câmbio: uma escolha, mas dá para desmarcar tocando de novo (por isso checkbox, não radio).
  const cambio = (
    <OptionGroup
      name="cambio"
      type="checkbox"
      legend="Câmbio"
      legendClassName={legenda}
      height={altura}
      options={opcoes(CAMBIOS, ROTULO_CAMBIO_LONGO)}
      value={filtros.cambio ? [filtros.cambio] : []}
      onValueChange={(v, marcado) => onChange({ ...filtros, cambio: marcado ? (v as Filtros["cambio"]) : null })}
      className={cn("grid grid-cols-2", sheet ? "gap-6" : "gap-8")}
    />
  );

  const km = (
    <OptionGroup
      name="km"
      legend="Km máximo"
      legendClassName={legenda}
      height={altura}
      options={KM_OPCOES}
      value={filtros.kmMax !== null ? String(filtros.kmMax) : ""}
      onValueChange={(v) => onChange({ ...filtros, kmMax: v ? Number(v) : null })}
      className={grade}
    />
  );

  const combustivel = (
    <OptionGroup
      name="combustivel"
      type="checkbox"
      legend="Combustível"
      legendClassName={legenda}
      height={altura}
      options={opcoes(COMBUSTIVEIS, ROTULO_COMBUSTIVEL)}
      value={filtros.combustiveis}
      onValueChange={(v) => onChange({ ...filtros, combustiveis: alternar(filtros.combustiveis, v as Filtros["combustiveis"][number]) })}
      className={grade}
    />
  );

  const tipo = (
    <OptionGroup
      name="tipo"
      type="checkbox"
      legend="Tipo"
      legendClassName={legenda}
      height={altura}
      options={opcoes(TIPOS, ROTULO_TIPO)}
      value={filtros.tipos}
      onValueChange={(v) => onChange({ ...filtros, tipos: alternar(filtros.tipos, v as Filtros["tipos"][number]) })}
      className={grade}
    />
  );

  if (sheet) {
    return (
      <>
        {marca}
        {preco}
        <div className="grid grid-cols-2 gap-12">
          {ano}
          {cambio}
        </div>
        {km}
        {combustivel}
        {tipo}
      </>
    );
  }

  return (
    <>
      {marca}
      {preco}
      {ano}
      {km}
      {cambio}
      {combustivel}
      {tipo}
    </>
  );
}

/** Filtros sem o que o painel controla (a busca por texto e a ordenação continuam). */
export function limparPainel(f: Filtros): Filtros {
  return { ...f, marcas: [], precoMin: null, precoMax: null, anoDe: null, anoAte: null, cambio: null, kmMax: null, combustiveis: [], tipos: [] };
}
