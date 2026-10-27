import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badges";
import type { LinhaEstoque } from "@/lib/admin/estoque";
import { anoFabModelo, km, moeda } from "@/lib/formato";
import { urlAssinada } from "@/lib/fotos-veiculo";
import { STATUS_VEICULO } from "@/lib/status";
import { AcoesVeiculoDesktop, AcoesVeiculoMobile } from "./acoes-veiculo";

/** "Rascunho": cadastrado mas ainda não publicado no catálogo. */
function SeloRascunho() {
  return <span className="ml-6 inline-block rounded-6 border border-gray-200 px-6 align-[2px] text-14 leading-18 font-semibold text-gray-600">Rascunho</span>;
}

/** Cartão do veículo no estoque mobile (12): foto 100×75, nome, versão, ano · km, preço e status; "⋯" abre as ações. */
export function CartaoEstoque({ v }: { v: LinhaEstoque }) {
  const st = STATUS_VEICULO[v.status];
  return (
    <article className="relative flex gap-12 rounded-16 border border-gray-150 bg-white p-12">
      <div className="relative h-75 w-100 flex-none overflow-hidden rounded-10 bg-hatch-sm">
        {v.capa && <Image src={v.capa} alt="" fill sizes="100px" unoptimized={urlAssinada(v.capa)} className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 className="truncate pr-36 text-16 font-bold">
          {/* O cartão inteiro abre a edição; o "⋯" fica por cima. */}
          <Link href={`/admin/estoque/${v.id}`} className="before:absolute before:inset-0 before:rounded-16">
            {v.marca} {v.modelo}
          </Link>
        </h2>
        <p className="truncate pr-36 text-14 text-gray-500">
          {v.versao}
          {!v.publicado && <SeloRascunho />}
        </p>
        <p className="text-14 text-gray-700 tabular-nums">
          {anoFabModelo(v.anoFabricacao, v.anoModelo)} · {km(v.km)}
        </p>
        <div className="mt-6 flex items-center justify-between gap-8">
          <span className="text-18 font-extrabold whitespace-nowrap tabular-nums">{moeda(v.preco)}</span>
          <StatusBadge tom={st.tom}>{st.rotulo}</StatusBadge>
        </div>
      </div>
      <AcoesVeiculoMobile v={v} />
    </article>
  );
}

const COLUNAS = "grid grid-cols-[96px_2.2fr_1fr_1fr_1fr_1fr_160px] items-center px-20";

/** Tabela do estoque desktop (27). Linhas de 72px + divisória; o menu "⋯" das últimas linhas abre para cima. */
export function TabelaEstoque({ linhas, rodape }: { linhas: readonly LinhaEstoque[]; rodape: React.ReactNode }) {
  return (
    <div role="table" aria-label="Veículos do estoque" className="rounded-16 border border-gray-150 bg-white">
      <div role="rowgroup">
        <div
          role="row"
          className={`${COLUNAS} h-45 rounded-t-16 border-b border-gray-150 bg-gray-25 text-14 font-semibold tracking-[0.06em] text-gray-500`}
        >
          <span role="columnheader">FOTO</span>
          <span role="columnheader">MODELO / VERSÃO</span>
          <span role="columnheader">ANO</span>
          <span role="columnheader">KM</span>
          <span role="columnheader">PREÇO</span>
          <span role="columnheader">STATUS</span>
          <span role="columnheader" className="text-right">
            AÇÕES
          </span>
        </div>
      </div>
      <div role="rowgroup">
        {linhas.map((v, i) => {
          const st = STATUS_VEICULO[v.status];
          return (
            <div
              key={v.id}
              role="row"
              className={`${COLUNAS} relative h-73 border-b border-gray-120 text-15 tabular-nums focus-within:z-10 has-[[aria-expanded=true]]:z-10`}
            >
              <div role="cell" className="relative h-54 w-72 overflow-hidden rounded-8 bg-hatch-sm">
                {v.capa && <Image src={v.capa} alt="" fill sizes="72px" unoptimized={urlAssinada(v.capa)} className="object-cover" />}
              </div>
              {/* Nome e versão sem algarismos tabulares (na referência o atalho "font" desliga o tabular-nums da linha). */}
              <div role="cell" className="min-w-0 normal-nums">
                <p className="truncate font-semibold">
                  {v.marca} {v.modelo}
                  {!v.publicado && <SeloRascunho />}
                </p>
                <p className="truncate text-14 text-gray-500">{v.versao}</p>
              </div>
              <span role="cell">{anoFabModelo(v.anoFabricacao, v.anoModelo)}</span>
              <span role="cell">{km(v.km)}</span>
              <span role="cell" className="font-bold">
                {moeda(v.preco)}
              </span>
              <span role="cell">
                <StatusBadge tom={st.tom} size="lg">
                  {st.rotulo}
                </StatusBadge>
              </span>
              <div role="cell">
                <AcoesVeiculoDesktop v={v} abrirAcima={i >= 3 && i >= linhas.length - 3} />
              </div>
            </div>
          );
        })}
      </div>
      {rodape}
    </div>
  );
}
