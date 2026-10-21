import { VehicleCard } from "@/components/catalogo/vehicle-card";
import { CtaNaoEncontrou } from "@/components/catalogo/cta-nao-encontrou";
import { listarCatalogo } from "@/lib/catalogo/consultas";
import {
  aplicarFiltros,
  atributosFiltro,
  chipsAtivos,
  contarMarcas,
  FILTROS_VAZIOS,
  lerFiltros,
} from "@/lib/catalogo/filtros";
import { compararMarcas } from "@/lib/marcas";
import { FiltrosLateral } from "./filtros-lateral";
import { FiltrosMobile } from "./filtros-mobile";
import { Ordenar } from "./ordenar";
import { Atalhos, Busca, ChipsMarca, FiltrosAtivos, HeroDesktop, HeroMobile, SemResultado, textoTotal } from "./partes";

type ParametrosBusca = Promise<Record<string, string | string[] | undefined>>;

/**
 * Estoque (telas 01, 02, 08 e 21). Lê os filtros da URL, aplica sobre o catálogo em cache e monta:
 * - mobile sem filtro: hero, busca sobreposta, chips de marca e atalhos (01);
 * - mobile com filtro: faixa preta compacta e chips removíveis (08);
 * - desktop: hero com busca e atalhos, coluna de filtros e grade de 3 colunas (21).
 */
export async function Vitrine({ searchParams }: { searchParams: ParametrosBusca }) {
  const filtros = lerFiltros(await searchParams);
  const todos = await listarCatalogo();
  const resultados = aplicarFiltros(todos, filtros);
  const marcas = contarMarcas(todos, compararMarcas);
  const chips = chipsAtivos(filtros, new Map(marcas.map((m) => [m.slug, m.nome])));
  const filtrado = chips.length > 0;
  const atributos = atributosFiltro(todos);
  const anosModelo = todos.map((v) => v.anoModelo);
  const anos = anosModelo.length ? { min: Math.min(...anosModelo), max: Math.max(...anosModelo) } : { min: 2010, max: 2026 };
  const filtrosMobile = { filtros, atributos, marcas, anos };

  return (
    <>
      {filtrado ? (
        <div className="flex gap-8 bg-black px-16 pt-8 pb-16 lg:hidden">
          <Busca filtros={filtros} variante="mobile" />
          <FiltrosMobile {...filtrosMobile} />
        </div>
      ) : (
        <>
          <HeroMobile />
          <div className="relative -mt-26 flex gap-8 px-16 lg:hidden">
            <Busca filtros={filtros} variante="mobile" sombra />
            <FiltrosMobile {...filtrosMobile} sombra />
          </div>
          <ChipsMarca filtros={filtros} marcas={marcas} />
          <Atalhos filtros={filtros} variante="mobile" />
        </>
      )}
      <HeroDesktop filtros={filtros} />
      <FiltrosAtivos chips={chips} />

      <div className="mx-auto max-w-page lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:items-start lg:gap-32 lg:px-32 lg:pt-40 lg:pb-64 xl:px-64">
        <FiltrosLateral filtros={filtros} marcas={marcas} anos={anos} className="hidden lg:flex" />

        <section aria-labelledby="titulo-resultados">
          {resultados.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-16 pt-24 pb-12 lg:mb-20 lg:p-0">
                <h2 id="titulo-resultados" className="text-17 font-bold lg:text-20">
                  {textoTotal(resultados.length)}
                </h2>
                <Ordenar filtros={filtros} />
              </div>
              <ul className="flex flex-col gap-16 px-16 lg:grid lg:grid-cols-3 lg:gap-24 lg:px-0">
                {resultados.map((v, i) => (
                  <li key={v.slug}>
                    <VehicleCard veiculo={v} preload={i === 0} className="h-full" />
                  </li>
                ))}
                <li>
                  <CtaNaoEncontrou className="h-full" />
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2 id="titulo-resultados" className="sr-only">
                Nenhum veículo encontrado
              </h2>
              <SemResultado />
              <div className="px-16 pt-24 lg:grid lg:grid-cols-3 lg:gap-24 lg:px-0">
                <CtaNaoEncontrou className="h-full" />
              </div>
            </>
          )}
        </section>
      </div>
      <div className="h-28 lg:hidden" />
    </>
  );
}

/** Esqueleto enquanto a vitrine carrega: mesmo formato do estado inicial, sem pular a página. */
export function VitrineCarregando() {
  const cartao = (i: number) => (
    <li key={i} className="overflow-hidden rounded-16 bg-white shadow-card">
      <div className="aspect-[4/3] bg-hatch" />
      <div className="flex flex-col gap-10 p-16 lg:p-18">
        <div className="h-14 w-80 rounded-6 bg-gray-120" />
        <div className="h-26 w-160 rounded-6 bg-gray-120" />
        <div className="h-16 w-120 rounded-6 bg-gray-120" />
        <div className="mt-16 h-48 rounded-12 bg-gray-120" />
      </div>
    </li>
  );
  return (
    <div aria-busy="true" aria-label="Carregando o estoque">
      <HeroMobile />
      <div className="relative -mt-26 flex gap-8 px-16 lg:hidden">
        <div className="h-52 flex-1 rounded-14 bg-white shadow-search" />
        <div className="size-52 rounded-14 bg-brand shadow-filter-button" />
      </div>
      <HeroDesktop filtros={FILTROS_VAZIOS} />
      <div className="mx-auto max-w-page lg:grid lg:grid-cols-[296px_minmax(0,1fr)] lg:items-start lg:gap-32 lg:px-32 lg:pt-40 lg:pb-64 xl:px-64">
        <div className="hidden h-640 rounded-16 bg-white shadow-card-soft lg:block" />
        <ul className="flex flex-col gap-16 px-16 pt-80 lg:grid lg:grid-cols-3 lg:gap-24 lg:px-0 lg:pt-66">
          {[0, 1, 2].map(cartao)}
        </ul>
      </div>
    </div>
  );
}
