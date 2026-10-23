import Form from "next/form";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { chipClasses } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Simbolo } from "@/components/site/logo";
import { cn } from "@/lib/cn";
import { alternar, escreverFiltros, hrefFiltros, type ChipFiltro, type Filtros } from "@/lib/catalogo/filtros";
import type { NomeIcone } from "@/lib/icones";
import type { MarcaContada } from "./painel-filtros";

/* ---------------------------------------------------------------- Hero */

/**
 * Hero do estoque com um único h1 (o layout muda só por CSS).
 * Mobile (01): tagline, título de 32px e filete; a busca sobe 26px sobre ele.
 * Desktop (21): símbolo ao fundo, tagline, título de 60px, busca com botão e atalhos em pílula.
 * `soDesktop`: com filtro ativo, o mobile mostra a faixa compacta (08) no lugar do hero.
 */
export function Hero({ filtros, soDesktop }: { filtros: Filtros; soDesktop?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-black text-white", soDesktop && "max-lg:hidden")}>
      <div className="relative px-20 pt-14 pb-46 lg:mx-auto lg:max-w-page lg:px-32 lg:pt-36 lg:pb-56 xl:px-64">
        <Simbolo className="pointer-events-none absolute -top-60 right-40 hidden w-380 opacity-12 lg:block" />
        <p className="relative text-14 font-light tracking-tagline-36 text-silver lg:tracking-tagline-42">
          <span className="lg:hidden">SEMINOVOS · TERESINA</span>
          <span className="hidden lg:inline">SEMINOVOS · TERESINA-PI</span>
        </p>
        <h1 className="relative mt-8 max-w-300 font-display text-32 leading-105 font-extrabold italic lg:mt-12 lg:max-w-none lg:text-60 lg:leading-none">
          Seu próximo carro está aqui
        </h1>
        <div className="relative mt-28 hidden flex-wrap items-center gap-12 lg:flex">
          <Busca filtros={filtros} variante="desktop" />
          <Atalhos filtros={filtros} variante="desktop" />
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-filete opacity-50" />
    </div>
  );
}

/* ---------------------------------------------------------------- Busca */

/**
 * Busca por marca ou modelo. <Form> do Next: navega no cliente e mantém os outros filtros
 * (campos ocultos). Mobile: 52px, raio 14. Desktop: 56px com o botão "Buscar".
 */
export function Busca({ filtros, variante, sombra = false }: { filtros: Filtros; variante: "mobile" | "desktop"; sombra?: boolean }) {
  const outros = [...new URLSearchParams(escreverFiltros({ ...filtros, q: "" }))];
  const id = `busca-${variante}`;
  const desktop = variante === "desktop";
  return (
    <Form
      action="/"
      role="search"
      className={cn(
        "flex items-center bg-white focus-within:outline-2 focus-within:outline-brand-300",
        desktop ? "box-border h-56 w-520 gap-10 rounded-14 pr-8 pl-18" : "h-52 min-w-0 flex-1 gap-10 rounded-14 px-14",
        sombra && "shadow-search",
      )}
    >
      {outros.map(([chave, valor]) => (
        <input key={chave} type="hidden" name={chave} value={valor} />
      ))}
      <Icon name="search" size={desktop ? 24 : 22} className="text-brand" />
      <label htmlFor={id} className="sr-only">
        Buscar marca ou modelo
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={filtros.q}
        placeholder="Buscar marca ou modelo"
        enterKeyHint="search"
        autoComplete="off"
        maxLength={60}
        className="h-full min-w-0 flex-1 bg-transparent text-16 text-ink outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:cursor-pointer"
      />
      {desktop && (
        <button type="submit" className="pressable h-42 rounded-10 bg-brand px-18 text-15 font-semibold text-white hover:bg-brand-hover">
          Buscar
        </button>
      )}
    </Form>
  );
}

/* ---------------------------------------------------------------- Chips e atalhos */

/** Chips de marca (01): "Todas" preto quando nenhuma marca está escolhida; rolam na horizontal. */
export function ChipsMarca({ filtros, marcas }: { filtros: Filtros; marcas: readonly MarcaContada[] }) {
  return (
    <nav aria-label="Marcas" className="flex gap-8 overflow-x-auto px-16 pt-16 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
      <Link href={hrefFiltros({ ...filtros, marcas: [] })} scroll={false} aria-current={filtros.marcas.length === 0 ? "true" : undefined} className={chipClasses({ selected: filtros.marcas.length === 0, tone: "black" })}>
        Todas
      </Link>
      {marcas.map((m) => {
        const ativa = filtros.marcas.includes(m.slug);
        return (
          <Link
            key={m.slug}
            href={hrefFiltros({ ...filtros, marcas: alternar(filtros.marcas, m.slug) })}
            scroll={false}
            aria-current={ativa ? "true" : undefined}
            className={chipClasses({ selected: ativa })}
          >
            {m.nome}
          </Link>
        );
      })}
    </nav>
  );
}

type Atalho = { chave: string; icone: NomeIcone; rotulo: string; ativo: boolean; alternado: Filtros };

function atalhos(f: Filtros): Atalho[] {
  const ate60 = f.precoMax === 60000 && f.precoMin === null;
  return [
    { chave: "ate60", icone: "payments", rotulo: "Até R$ 60 mil", ativo: ate60, alternado: { ...f, precoMin: null, precoMax: ate60 ? null : 60000 } },
    {
      chave: "suv",
      icone: "directions_car",
      rotulo: "SUVs",
      ativo: f.tipos.includes("suv"),
      alternado: { ...f, tipos: alternar(f.tipos, "suv") },
    },
    {
      chave: "auto",
      icone: "hdr_auto",
      rotulo: "Automáticos",
      ativo: f.cambio === "automatico",
      alternado: { ...f, cambio: f.cambio === "automatico" ? null : "automatico" },
    },
  ];
}

/** Atalhos "Até R$ 60 mil", "SUVs", "Automáticos": cartões no mobile (01), pílulas no hero desktop (21). */
export function Atalhos({ filtros, variante }: { filtros: Filtros; variante: "mobile" | "desktop" }) {
  const itens = atalhos(filtros);
  if (variante === "desktop") {
    return (
      <nav aria-label="Atalhos" className="contents">
        {itens.map((a) => (
          <Link
            key={a.chave}
            href={hrefFiltros(a.alternado)}
            scroll={false}
            aria-label={a.rotulo}
            aria-current={a.ativo ? "true" : undefined}
            className={cn(
              "pressable flex h-50 items-center gap-8 rounded-pill border px-18 text-15 font-semibold",
              a.ativo ? "border-white bg-white text-ink" : "border-gray-700 text-white hover:border-gray-500",
            )}
          >
            <Icon name={a.icone} size={20} className={a.ativo ? "text-brand" : "text-brand-300"} />
            {a.rotulo}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label="Atalhos" className="grid grid-cols-[repeat(3,1fr)] gap-8 px-16 pt-12 lg:hidden">
      {itens.map((a) => (
        <Link
          key={a.chave}
          href={hrefFiltros(a.alternado)}
          scroll={false}
          aria-label={a.rotulo}
          aria-current={a.ativo ? "true" : undefined}
          className={cn(
            "pressable flex h-70 flex-col justify-center gap-4 rounded-14 border px-12",
            a.ativo ? "border-brand bg-brand-50" : "border-gray-150 bg-white hover:border-gray-200",
          )}
        >
          <Icon name={a.icone} size={22} className="text-brand" />
          <span className="text-14 font-semibold whitespace-nowrap text-ink">{a.rotulo}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ---------------------------------------------------------------- Filtros ativos e vazio */

/** Filtros ativos como chips removíveis (08): fundo #E5EEFB, "×" à direita. */
export function FiltrosAtivos({ chips }: { chips: readonly ChipFiltro[] }) {
  if (!chips.length) return null;
  return (
    <ul aria-label="Filtros ativos" className="flex flex-wrap gap-8 px-16 pt-16 lg:hidden">
      {chips.map((c) => (
        <li key={c.chave}>
          <Link
            href={hrefFiltros(c.semEste)}
            scroll={false}
            aria-label={`Remover filtro: ${c.rotulo}`}
            className="pressable flex h-48 items-center rounded-pill bg-brand-50 pr-4 pl-16 text-14 font-semibold whitespace-nowrap text-brand hover:bg-brand-100"
          >
            {c.rotulo}
            <span className="flex h-40 w-36 items-center justify-center">
              <Icon name="close" size={18} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Nenhum resultado (08). "Limpar filtros" volta ao catálogo inteiro. */
export function SemResultado() {
  return (
    <div className="flex flex-col items-center px-24 pt-40 text-center lg:rounded-16 lg:bg-white lg:pt-56 lg:pb-56 lg:shadow-card-soft">
      <div className="flex size-88 items-center justify-center rounded-pill bg-brand-50 text-brand">
        <Icon name="search_off" size={44} />
      </div>
      <h2 className="mt-20 font-display text-28 leading-110 font-extrabold italic">Nenhum carro com esses filtros</h2>
      <p className="mt-8 max-w-300 text-16 leading-145 text-gray-600">Tente tirar algum filtro ou ampliar a faixa de preço.</p>
      <ButtonLink href="/" scroll={false} variant="outline" size="md-bold" className="mt-20 gap-8 px-22">
        <Icon name="filter_alt_off" size={20} />
        Limpar filtros
      </ButtonLink>
    </div>
  );
}

/** "31 veículos" / "1 veículo" */
export function textoTotal(n: number) {
  return n === 1 ? "1 veículo" : `${n} veículos`;
}

