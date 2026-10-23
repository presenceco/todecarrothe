import type { Metadata } from "next";
import { Suspense } from "react";
import { PaginaCarregando } from "@/components/admin/estados";
import { FormVeiculo } from "@/components/admin/veiculo/form-veiculo";
import { exigirAdmin } from "@/lib/admin/sessao";
import { listarOpcionais, modelosPorMarca, novoVeiculo } from "@/lib/admin/veiculo";
import { anoAtual } from "@/lib/formato";

export const metadata: Metadata = { title: "Cadastrar veículo" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `?consignacao=<id>`: "Cadastrar no estoque" a partir de uma consignação em Negócio fechado. */
async function Novo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  await exigirAdmin();
  const consignacao = typeof sp.consignacao === "string" && UUID.test(sp.consignacao) ? sp.consignacao : undefined;
  const [dados, opcionais, modelos] = await Promise.all([novoVeiculo(consignacao), listarOpcionais(), modelosPorMarca()]);
  return <FormVeiculo key={dados.id} dados={dados} opcionais={opcionais} modelos={modelos} anoAtual={anoAtual()} />;
}

/** Cadastrar veículo (15/28 vazios). */
export default function NovoVeiculoPage({ searchParams }: PageProps<"/admin/estoque/novo">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Novo searchParams={searchParams} />
    </Suspense>
  );
}
