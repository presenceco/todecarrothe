import type { Metadata } from "next";
import { Suspense } from "react";
import { PaginaCarregando } from "@/components/admin/estados";
import { ListaPedidos } from "@/components/admin/pedidos/lista-pedidos";
import { lerFiltrosLista } from "@/lib/admin/filtros";
import { listarPedidos, STATUS_PEDIDOS } from "@/lib/admin/pedidos";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";

export const metadata: Metadata = { title: "Pedidos" };

async function Pedidos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = lerFiltrosLista(await searchParams, STATUS_PEDIDOS);
  const { usuario } = await exigirAdmin();
  const [dados, contadores] = await Promise.all([listarPedidos(filtros), contarNovos()]);
  return <ListaPedidos dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} />;
}

/** Pedidos de busca (16 mobile, 29 desktop). */
export default function PedidosPage({ searchParams }: PageProps<"/admin/pedidos">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Pedidos searchParams={searchParams} />
    </Suspense>
  );
}
