import type { Metadata } from "next";
import { Suspense } from "react";
import { SimularVeiculo } from "@/components/formularios/simular-veiculo";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { obterVeiculo, slugsDoBuild } from "@/lib/catalogo/consultas";

export function generateStaticParams() {
  return slugsDoBuild();
}

export async function generateMetadata({ params }: PageProps<"/simular/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = await obterVeiculo(slug);
  const nome = v ? [v.marca, v.modelo, v.versao].filter(Boolean).join(" ") : "Veículo";
  return {
    title: `Simular financiamento · ${nome}`,
    description: `Simule o financiamento do ${nome} com os principais bancos. A Tô de Carro responde no WhatsApp.`,
    // Uma página por carro com o mesmo formulário: fora do índice, para não competir com o detalhe.
    robots: { index: false, follow: true },
  };
}

export default function SimularVeiculoPage({ params }: PageProps<"/simular/[slug]">) {
  return (
    <>
      <SiteHeader soDesktop />
      <main>
        <Suspense fallback={<div aria-busy="true" className="min-h-dvh" />}>
          <SimularVeiculo params={params} />
        </Suspense>
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
