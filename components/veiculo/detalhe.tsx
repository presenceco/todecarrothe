import Link from "next/link";
import { notFound } from "next/navigation";
import { AnoAtual } from "@/components/site/ano-atual";
import { Logo, Simbolo } from "@/components/site/logo";
import { EtiquetaBadge } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { obterVeiculo } from "@/lib/catalogo/consultas";
import { hrefFiltros, FILTROS_VAZIOS } from "@/lib/catalogo/filtros";
import { mensagemInteresse, urlVeiculo } from "@/lib/catalogo/interesse";
import { anoFabModelo, km } from "@/lib/formato";
import { slugificar } from "@/lib/slug";
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL, SELOS, type VeiculoDetalhe } from "@/lib/tipos";
import type { NomeIcone } from "@/lib/icones";
import { BotaoCompartilhar, BotaoVoltar } from "./acoes-barra";
import { BotaoInteresse } from "./botao-interesse";
import { Galeria } from "./galeria";
import { Opcionais } from "./opcionais";

/**
 * Detalhe do veículo (03 mobile, 22 desktop), uma árvore só:
 * mobile em coluna (galeria, dados, financiar, selos, ficha, opcionais, rodapé fixo);
 * desktop em grade (galeria, ficha e opcionais à esquerda; painel fixo de 440px à direita).
 */
export async function DetalheVeiculo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await obterVeiculo(slug);
  if (!v) notFound();

  const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
  const meta = [v.versao, anoFabModelo(v.anoFabricacao, v.anoModelo), km(v.km)].filter(Boolean).join(" · ");
  const simular = `/simular/${v.slug}`;
  const interesse = mensagemInteresse(v);

  return (
    <>
      {/* Barra do mobile (03): voltar, logo, compartilhar */}
      <div className="flex h-60 items-center justify-between bg-black pt-[env(safe-area-inset-top,0px)] px-4 text-white box-content lg:hidden">
        <BotaoVoltar />
        <Link href="/" aria-label="Tô de Carro Seminovos, início">
          <Logo size="compact" />
        </Link>
        <BotaoCompartilhar titulo={`${nome} · Tô de Carro Seminovos`} url={urlVeiculo(v.slug)} />
      </div>

      {/* Trilha do desktop (22) */}
      <nav aria-label="Você está em" className="mx-auto hidden max-w-page items-center gap-8 px-32 py-24 text-14 font-medium text-gray-500 lg:flex xl:px-64">
        <Link href="/" className="flex items-center gap-8 hover:text-ink">
          <Icon name="arrow_back" size={18} />
          Estoque
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={hrefFiltros({ ...FILTROS_VAZIOS, marcas: [slugificar(v.marca)] })} className="hover:text-ink">
          {v.marca}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          {[v.modelo, v.versao].filter(Boolean).join(" ")}
        </span>
      </nav>

      <div className="mx-auto max-w-page lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-x-40 lg:gap-y-24 lg:px-32 lg:pb-72 xl:px-64">
        <div className="lg:col-start-1">
          <Galeria fotos={v.fotos} etiqueta={v.etiqueta} etiquetaTexto={v.etiquetaTexto} nome={nome} />
        </div>

        <aside
          aria-label="Resumo e contato"
          className="flex flex-col gap-20 px-16 pt-20 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:rounded-16 lg:bg-white lg:p-28 lg:shadow-float"
        >
          <div>
            <EtiquetaBadge etiqueta={v.etiqueta} texto={v.etiquetaTexto} estilo="contorno" className="mb-14 hidden lg:inline-flex" />
            <p className="text-14 font-bold tracking-eyebrow text-brand uppercase">{v.marca}</p>
            <h1 className="mt-2 font-display text-34 leading-105 font-extrabold italic lg:text-44 lg:leading-102">{v.modelo}</h1>
            <p className="mt-4 text-16 text-gray-600 lg:text-18">{meta}</p>
            <Price valor={v.preco} size="detail" className="mt-14 lg:mt-18" />
          </div>

          <CartaoFinanciar href={simular} />

          <div className="hidden flex-col gap-10 lg:flex">
            <ButtonLink href={simular} size="custom" className="h-56 gap-8 rounded-14 text-16 font-bold">
              <Icon name="calculate" size={20} />
              Simular financiamento
            </ButtonLink>
            <BotaoInteresse slug={v.slug} mensagem={interesse} size="custom" className="h-56 gap-8 rounded-14 text-16 font-bold">
              <Icon name="chat" size={20} fill />
              Tenho interesse
            </BotaoInteresse>
          </div>

          {v.selos.length + v.selosExtras.length > 0 && (
            <>
              <div aria-hidden="true" className="hidden h-1 bg-filete lg:block" />
              <Selos v={v} />
            </>
          )}
        </aside>

        <div className="px-16 pt-20 lg:col-start-1 lg:p-0">
          <FichaTecnica v={v} />
        </div>
        <div className="px-16 pt-20 lg:col-start-1 lg:p-0">
          <Opcionais itens={v.opcionais} />
        </div>
      </div>

      {/* Rodapé fixo do mobile (03) */}
      <div className="h-24 lg:hidden" />
      <StickyFooter shadow className="flex gap-8 lg:hidden">
        <BotaoInteresse slug={v.slug} mensagem={interesse} size="lg-15" className="box-border gap-6 px-14">
          <Icon name="chat" size={20} fill />
          Tenho interesse
        </BotaoInteresse>
        {/*
          Respiro lateral do texto: 12px a partir de 403px; entre 388 e 402px (inclui 390) o texto vai a 14px com 10px
          de respiro para caber ao lado de "Tenho interesse"; abaixo de 388px o botão diz só "Simular".
        */}
        <ButtonLink href={simular} size="lg-15" aria-label="Simular financiamento" className="min-w-0 flex-1 px-12 max-[402px]:px-10">
          <span className="max-[402px]:text-14 max-[387px]:hidden">Simular financiamento</span>
          <span className="hidden max-[387px]:inline">Simular</span>
        </ButtonLink>
      </StickyFooter>
    </>
  );
}

/** "Quer financiar?" (azul, marca d'água clareada). No mobile traz o botão; no desktop os botões vêm abaixo. */
function CartaoFinanciar({ href }: { href: string }) {
  return (
    <div className="relative overflow-hidden rounded-16 bg-brand p-20 text-white shadow-finance-cta lg:p-22 lg:shadow-none">
      <Simbolo className="pointer-events-none absolute -right-36 -bottom-44 w-170 opacity-18 brightness-[2.2] saturate-0 lg:-right-40 lg:-bottom-50" />
      <p className="relative font-display text-22 leading-110 font-extrabold italic">Quer financiar?</p>
      <p className="relative mt-6 max-w-270 text-16 leading-140 lg:max-w-300">Envie seus dados e a gente simula para você</p>
      <ButtonLink href={href} variant="inverse" size="md-bold" className="relative mt-16 w-full gap-8 lg:hidden">
        <Icon name="calculate" size={20} />
        Simular financiamento
      </ButtonLink>
    </div>
  );
}

const ITEM_SELO =
  "flex min-h-42 items-center gap-6 rounded-pill border border-gray-150 bg-white py-8 pr-12 pl-10 text-14 font-semibold lg:min-h-0 lg:gap-10 lg:border-0 lg:bg-transparent lg:p-0 lg:text-15 lg:font-medium";

/**
 * "Verificado pela loja": pílulas no mobile (03), lista no desktop (22). O IPVA leva o ano corrente.
 * Os selos escritos pelo admin vêm depois dos fixos, com o mesmo visual.
 */
function Selos({ v }: { v: VeiculoDetalhe }) {
  const selos = SELOS.filter((s) => v.selos.includes(s.chave));
  return (
    <section aria-labelledby="titulo-selos">
      <h2 id="titulo-selos" className="mb-12 text-17 font-bold lg:text-15">
        Verificado pela loja
      </h2>
      <ul className="flex flex-wrap gap-8 lg:flex-col lg:gap-10">
        {selos.map((s) => (
          <li key={s.chave} className={ITEM_SELO}>
            <Icon name="verified" size={20} fill className="text-brand" />
            {s.chave === "ipva_pago" ? (
              <span>
                IPVA <AnoAtual /> pago
              </span>
            ) : (
              s.rotulo(0)
            )}
          </li>
        ))}
        {v.selosExtras.map((nome) => (
          <li key={nome} className={ITEM_SELO}>
            <Icon name="verified" size={20} fill className="text-brand" />
            <span className="min-w-0 break-words">{nome}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Ficha técnica: 2 colunas no mobile (03), cartão com 3 colunas no desktop (22). */
function FichaTecnica({ v }: { v: VeiculoDetalhe }) {
  const itens: { icone: NomeIcone; rotulo: string; valor: string }[] = [
    { icone: "calendar_month", rotulo: "Ano", valor: anoFabModelo(v.anoFabricacao, v.anoModelo) },
    { icone: "speed", rotulo: "Quilometragem", valor: km(v.km) },
    { icone: "settings", rotulo: "Câmbio", valor: ROTULO_CAMBIO[v.cambio].longo },
    { icone: "palette", rotulo: "Cor", valor: v.cor },
    { icone: "local_gas_station", rotulo: "Combustível", valor: ROTULO_COMBUSTIVEL[v.combustivel] },
    { icone: "pin", rotulo: "Final da placa", valor: v.finalPlaca },
  ];
  return (
    <section aria-labelledby="titulo-ficha" className="lg:rounded-16 lg:bg-white lg:p-28 lg:shadow-hairline">
      <h2 id="titulo-ficha" className="mb-12 text-17 font-bold lg:mb-20 lg:font-display lg:text-24 lg:font-extrabold lg:italic">
        Ficha técnica
      </h2>
      <dl className="grid grid-cols-2 gap-1 overflow-hidden rounded-16 border border-gray-150 bg-gray-150 lg:grid-cols-3 lg:rounded-14">
        {itens.map((i) => (
          <div key={i.rotulo} className="flex items-start gap-10 bg-white p-14 lg:gap-12 lg:px-20 lg:py-18">
            <Icon name={i.icone} className="text-22 leading-none text-brand lg:text-24" />
            <div>
              <dt className="text-14 text-gray-500">{i.rotulo}</dt>
              <dd className="mt-2 text-16 font-semibold lg:text-17">{i.valor}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
