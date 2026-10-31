import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaCupons } from "@/components/admin/cupons/lista-cupons";
import { PaginaCarregando } from "@/components/admin/estados";
import { listarCupons, STATUS_CUPONS } from "@/lib/admin/cupons";
import { lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";

export const metadata: Metadata = { title: "Cupons de indicação" };

async function Cupons({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = lerFiltrosLista(await searchParams, STATUS_CUPONS);
  const { usuario } = await exigirAdmin();
  const [dados, contadores] = await Promise.all([listarCupons(filtros), contarNovos()]);
  return <ListaCupons dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} />;
}

/** Cupons de indicação: lista, com o item "Cupons" no menu lateral e no painel da conta. */
export default function CuponsPage({ searchParams }: PageProps<"/admin/cupons">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Cupons searchParams={searchParams} />
    </Suspense>
  );
}
