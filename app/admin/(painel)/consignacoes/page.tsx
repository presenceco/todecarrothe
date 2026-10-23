import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaConsignacoes } from "@/components/admin/consignacoes/lista-consignacoes";
import { PaginaCarregando } from "@/components/admin/estados";
import { listarConsignacoes, STATUS_CONSIGNACOES } from "@/lib/admin/consignacoes";
import { lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";

export const metadata: Metadata = { title: "Consignações" };

async function Consignacoes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = lerFiltrosLista(await searchParams, STATUS_CONSIGNACOES);
  const { usuario } = await exigirAdmin();
  const [dados, contadores] = await Promise.all([listarConsignacoes(filtros), contarNovos()]);
  return <ListaConsignacoes dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} />;
}

/** Consignações (35 mobile, 38 desktop), conforme a seção 10 do briefing. */
export default function ConsignacoesPage({ searchParams }: PageProps<"/admin/consignacoes">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Consignacoes searchParams={searchParams} />
    </Suspense>
  );
}
