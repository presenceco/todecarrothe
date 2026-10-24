import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaginaCarregando } from "@/components/admin/estados";
import { FormVeiculo } from "@/components/admin/veiculo/form-veiculo";
import { exigirAdmin } from "@/lib/admin/sessao";
import { carregarVeiculo, listarEtiquetas, listarOpcionais, listarSelos, modelosPorMarca } from "@/lib/admin/veiculo";
import { anoAtual } from "@/lib/formato";

export const metadata: Metadata = { title: "Editar veículo" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirAdmin();
  if (!UUID.test(id)) notFound();
  const [dados, opcionais, etiquetas, selos, modelos] = await Promise.all([carregarVeiculo(id), listarOpcionais(), listarEtiquetas(), listarSelos(), modelosPorMarca()]);
  if (!dados) notFound();
  return <FormVeiculo key={dados.id} dados={dados} opcionais={opcionais} etiquetas={etiquetas} selos={selos} modelos={modelos} anoAtual={anoAtual()} />;
}

/** Editar veículo (15 mobile, 28 desktop). */
export default function EditarVeiculoPage({ params }: PageProps<"/admin/estoque/[id]">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Editar params={params} />
    </Suspense>
  );
}
