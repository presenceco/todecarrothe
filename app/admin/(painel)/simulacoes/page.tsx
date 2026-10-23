import type { Metadata } from "next";
import { Suspense } from "react";
import { PaginaCarregando } from "@/components/admin/estados";
import { ListaSimulacoes } from "@/components/admin/simulacoes/lista-simulacoes";
import { lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";
import { listarSimulacoes, STATUS_SIMULACOES } from "@/lib/admin/simulacoes";

export const metadata: Metadata = { title: "Simulações" };

async function Simulacoes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = lerFiltrosLista(await searchParams, STATUS_SIMULACOES);
  const { usuario } = await exigirAdmin();
  const [dados, contadores] = await Promise.all([listarSimulacoes(filtros), contarNovos()]);
  return <ListaSimulacoes dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} />;
}

/** Simulações (18 mobile, 31 desktop). */
export default function SimulacoesPage({ searchParams }: PageProps<"/admin/simulacoes">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Simulacoes searchParams={searchParams} />
    </Suspense>
  );
}
