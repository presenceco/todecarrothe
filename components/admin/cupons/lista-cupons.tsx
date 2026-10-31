import Link from "next/link";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import type { UsuarioAdmin } from "@/components/admin/admin-sidebar";
import { BuscaDesktop, BuscaMobile } from "@/components/admin/busca-lista";
import { ListaVazia } from "@/components/admin/estados";
import { Paginacao } from "@/components/admin/paginacao";
import { StatusBadge } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { DarkChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import type { Cupom, StatusCupom } from "@/lib/admin/cupons";
import { hrefLista, type FiltrosLista } from "@/lib/admin/filtros";
import { cn } from "@/lib/cn";
import { diaMes } from "@/lib/formato";
import type { Contadores } from "@/lib/navegacao";

const BASE = "/admin/cupons";
const BUSCA = "Buscar código ou indicador";

function SituacaoCupom({ ativo, size }: { ativo: boolean; size: "lg" | "xl" }) {
  return (
    <StatusBadge tom={ativo ? "success" : "neutral"} size={size}>
      {ativo ? "Ativo" : "Inativo"}
    </StatusBadge>
  );
}

/** Cartão do cupom no mobile. */
function CartaoCupom({ c }: { c: Cupom }) {
  return (
    <article className="relative flex flex-col gap-12 rounded-16 border border-gray-150 bg-white p-16">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="truncate font-display text-22 leading-110 font-extrabold italic">
            <Link href={`${BASE}/${c.id}`} className="before:absolute before:inset-0">
              {c.codigo}
            </Link>
          </h2>
          <p className="mt-2 truncate text-15 text-gray-700">{c.indicadorNome}</p>
        </div>
        <SituacaoCupom ativo={c.ativo} size="xl" />
      </div>
      <dl className="grid grid-cols-4 gap-8 rounded-12 bg-gray-100 px-12 py-10 text-14">
        {(
          [
            ["Simul.", c.totais.simulacoes],
            ["Pedidos", c.totais.pedidos],
            ["Consig.", c.totais.consignacoes],
            ["Cliques", c.totais.cliques],
          ] as const
        ).map(([rotulo, total]) => (
          <div key={rotulo} className="min-w-0">
            <dt className="truncate text-gray-500">{rotulo}</dt>
            <dd className="font-semibold tabular-nums">{total}</dd>
          </div>
        ))}
      </dl>
      <p className="text-14 text-gray-500">{c.ultimoUso ? `Último uso em ${diaMes(c.ultimoUso)}` : "Ainda não foi usado"}</p>
    </article>
  );
}

const COLUNAS = "grid min-w-[980px] grid-cols-[140px_minmax(140px,1fr)_100px_110px_80px_130px_80px_100px] items-center gap-12 px-20";

/** Tabela de cupons do desktop. A linha abre o detalhe. */
function TabelaCupons({ linhas, rodape }: { linhas: Cupom[]; rodape: React.ReactNode }) {
  return (
    <div role="table" aria-label="Cupons de indicação" className="overflow-x-auto rounded-16 border border-gray-150 bg-white">
      <div role="row" className={cn(COLUNAS, "h-45 rounded-t-16 border-b border-gray-150 bg-gray-25 text-14 font-semibold tracking-[0.06em] text-gray-500")}>
        <span role="columnheader">CÓDIGO</span>
        <span role="columnheader">INDICADOR</span>
        <span role="columnheader">SITUAÇÃO</span>
        <span role="columnheader">SIMULAÇÕES</span>
        <span role="columnheader">PEDIDOS</span>
        <span role="columnheader">CONSIGNAÇÕES</span>
        <span role="columnheader">CLIQUES</span>
        <span role="columnheader">ÚLTIMO USO</span>
      </div>
      {linhas.map((c) => (
        <div key={c.id} role="row" className={cn(COLUNAS, "relative h-65 border-b border-gray-120 text-15 tabular-nums hover:bg-brand-row")}>
          <span role="cell" className="min-w-0">
            <Link href={`${BASE}/${c.id}`} className="block truncate font-bold before:absolute before:inset-0">
              {c.codigo}
            </Link>
          </span>
          <span role="cell" className="truncate font-semibold">
            {c.indicadorNome}
          </span>
          <span role="cell">
            <SituacaoCupom ativo={c.ativo} size="lg" />
          </span>
          <span role="cell">{c.totais.simulacoes}</span>
          <span role="cell">{c.totais.pedidos}</span>
          <span role="cell">{c.totais.consignacoes}</span>
          <span role="cell">{c.totais.cliques}</span>
          <span role="cell" className="text-gray-600">
            {c.ultimoUso ? diaMes(c.ultimoUso) : "—"}
          </span>
        </div>
      ))}
      {rodape}
    </div>
  );
}

/** Cupons de indicação: cartões no mobile e tabela no desktop, como as outras listas. */
export function ListaCupons({
  dados,
  filtros,
  usuario,
  contadores,
}: {
  dados: { linhas: Cupom[]; total: number; contagens: Record<StatusCupom | "todos", number> };
  filtros: FiltrosLista<StatusCupom>;
  usuario: UsuarioAdmin;
  contadores: Contadores;
}) {
  const { linhas, total, contagens } = dados;
  const abas = [
    { href: hrefLista(BASE, filtros, { status: null }), rotulo: "Todos", count: contagens.todos, selected: !filtros.status },
    { href: hrefLista(BASE, filtros, { status: "ativo" }), rotulo: "Ativos", count: contagens.ativo, selected: filtros.status === "ativo" },
    { href: hrefLista(BASE, filtros, { status: "inativo" }), rotulo: "Inativos", count: contagens.inativo, selected: filtros.status === "inativo" },
  ];
  const filtrado = !!(filtros.q || filtros.status);
  const vazio = (
    <ListaVazia
      icone="confirmation_number"
      titulo={filtrado ? "Nenhum cupom encontrado" : "Nenhum cupom ainda"}
      texto={filtrado ? "Tente outra busca ou outra situação." : "Crie um cupom para cada pessoa que indica clientes para a loja."}
    />
  );

  return (
    <>
      <AdminMobileHeader
        title="Cupons"
        badge={`${contagens.todos} ${contagens.todos === 1 ? "cupom" : "cupons"}`}
        action={<BuscaMobile inicial={filtros.q} status={filtros.status} placeholder={BUSCA} />}
        usuario={usuario}
        className="relative lg:hidden"
      >
        {abas.map((a) => (
          <DarkChipLink key={a.rotulo} href={a.href} selected={a.selected} count={a.count} scroll={false}>
            {a.rotulo}
          </DarkChipLink>
        ))}
      </AdminMobileHeader>
      <div className="flex flex-1 flex-col gap-12 px-16 pt-16 pb-8 lg:hidden">
        {linhas.length ? linhas.map((c) => <CartaoCupom key={c.id} c={c} />) : vazio}
        {total > linhas.length && <Paginacao base={BASE} filtros={filtros} total={total} className="px-4" />}
      </div>
      <AdminDock contadores={contadores} fab={{ href: `${BASE}/novo`, rotulo: "Criar cupom" }} />

      <div className="hidden flex-col gap-20 px-40 py-32 lg:flex">
        <div className="flex items-end justify-between gap-16">
          <div>
            <h1 className="text-28 font-bold">Cupons de indicação</h1>
            <p className="mt-4 text-15 text-gray-600">Identificam quem indicou cada cliente.</p>
          </div>
          <ButtonLink href={`${BASE}/novo`} size="custom" className="h-48 gap-8 rounded-12 px-22 text-15 font-bold">
            <Icon name="add" size={20} />
            Criar cupom
          </ButtonLink>
        </div>
        <div className="flex flex-wrap items-center gap-12">
          <BuscaDesktop inicial={filtros.q} status={filtros.status} placeholder={BUSCA} largura="w-320" />
          <SegmentedTabs items={abas} label="Situação" />
        </div>
        {linhas.length ? <TabelaCupons linhas={linhas} rodape={total > linhas.length ? <Paginacao base={BASE} filtros={filtros} total={total} /> : null} /> : vazio}
      </div>
    </>
  );
}
