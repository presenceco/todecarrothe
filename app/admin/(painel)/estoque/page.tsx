import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import { BuscaDesktop, BuscaMobile } from "@/components/admin/busca-lista";
import { CartaoEstoque, TabelaEstoque } from "@/components/admin/estoque/lista-estoque";
import { ListaVazia, PaginaCarregando } from "@/components/admin/estados";
import { Paginacao } from "@/components/admin/paginacao";
import { ButtonLink } from "@/components/ui/button";
import { DarkChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { STATUS_ESTOQUE, listarEstoque } from "@/lib/admin/estoque";
import { hrefLista, lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";
import { STATUS_VEICULO } from "@/lib/status";

export const metadata: Metadata = { title: "Estoque" };

const BASE = "/admin/estoque";
const BUSCA = "Buscar marca, modelo ou placa";

async function Estoque({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = lerFiltrosLista(await searchParams, STATUS_ESTOQUE);
  const { usuario } = await exigirAdmin();
  const [dados, contadores] = await Promise.all([listarEstoque(filtros), contarNovos()]);
  const { linhas, contagens, geral, total } = dados;

  const abas = [
    { href: hrefLista(BASE, filtros, { status: null }), rotulo: "Todos", count: contagens.todos, selected: !filtros.status },
    ...STATUS_ESTOQUE.map((s) => ({
      href: hrefLista(BASE, filtros, { status: s }),
      rotulo: STATUS_VEICULO[s].rotulo,
      count: contagens[s],
      selected: filtros.status === s,
    })),
  ];
  const vazio = (
    <ListaVazia
      icone="directions_car"
      titulo={filtros.q || filtros.status ? "Nenhum veículo encontrado" : "Nenhum veículo cadastrado"}
      texto={filtros.q || filtros.status ? "Tente outra busca ou outro status." : "Cadastre o primeiro veículo do estoque."}
    />
  );
  const paginacao = <Paginacao base={BASE} filtros={filtros} total={total} />;

  return (
    <>
      {/* Mobile (12) */}
      <AdminMobileHeader
        title="Estoque"
        badge={`${geral.total} ${geral.total === 1 ? "veículo" : "veículos"}`}
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
        {linhas.length ? linhas.map((v) => <CartaoEstoque key={v.id} v={v} />) : vazio}
        {total > linhas.length && <Paginacao base={BASE} filtros={filtros} total={total} className="px-4" />}
      </div>
      <AdminDock contadores={contadores} fab={{ href: `${BASE}/novo`, rotulo: "Cadastrar" }} />

      {/* Desktop (27) */}
      <div className="hidden flex-col gap-20 px-40 py-32 lg:flex">
        <div className="flex items-end justify-between gap-16">
          <div>
            <h1 className="text-28 font-bold">Estoque</h1>
            <p className="mt-4 text-15 text-gray-600">
              {geral.total} {geral.total === 1 ? "veículo" : "veículos"} · {geral.disponiveis} {geral.disponiveis === 1 ? "disponível" : "disponíveis"}
            </p>
          </div>
          <ButtonLink href={`${BASE}/novo`} size="md-bold" className="gap-8 px-20">
            <Icon name="add" size={20} />
            Cadastrar veículo
          </ButtonLink>
        </div>
        <div className="flex items-center gap-12">
          <BuscaDesktop inicial={filtros.q} status={filtros.status} placeholder={BUSCA} />
          <SegmentedTabs items={abas} label="Status" />
        </div>
        {linhas.length ? <TabelaEstoque linhas={linhas} rodape={paginacao} /> : vazio}
      </div>
    </>
  );
}

/** Estoque do admin (12, 13 e 14 no mobile; 27 no desktop). */
export default function EstoquePage({ searchParams }: PageProps<"/admin/estoque">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Estoque searchParams={searchParams} />
    </Suspense>
  );
}
