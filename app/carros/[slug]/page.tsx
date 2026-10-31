import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { DetalheVeiculo } from "@/components/veiculo/detalhe";
import { obterVeiculo, slugsDoBuild } from "@/lib/catalogo/consultas";
import { anoFabModelo, km, numeroPreco } from "@/lib/formato";
import { ROTULO_CAMBIO, ROTULO_COMBUSTIVEL } from "@/lib/tipos";

/** Todos os veículos do catálogo saem prontos do build; um carro publicado depois é gerado na 1ª visita. */
export function generateStaticParams() {
  return slugsDoBuild();
}

export async function generateMetadata({ params }: PageProps<"/carros/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = await obterVeiculo(slug);
  if (!v) return { title: "Veículo não encontrado", robots: { index: false } };

  const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
  const titulo = `${nome} ${anoFabModelo(v.anoFabricacao, v.anoModelo)}`;
  const descricao = `R$ ${numeroPreco(v.preco)} · ${km(v.km)} · ${ROTULO_CAMBIO[v.cambio].longo} · ${ROTULO_COMBUSTIVEL[v.combustivel]} · ${v.cor}. Seminovo revisado em Teresina-PI: simule o financiamento ou fale no WhatsApp.`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/carros/${v.slug}` },
    openGraph: {
      type: "website",
      title: `${titulo} · R$ ${numeroPreco(v.preco)}`,
      description: descricao,
      url: `/carros/${v.slug}`,
      siteName: "Tô de Carro Seminovos",
      locale: "pt_BR",
      images: v.fotos[0] ? [{ url: v.fotos[0].src, width: 1200, height: 900, alt: v.fotos[0].alt }] : undefined,
    },
  };
}

export default function VeiculoPage({ params }: PageProps<"/carros/[slug]">) {
  return (
    <>
      <SiteHeader soDesktop />
      <main>
        <Suspense fallback={<div aria-busy="true" className="min-h-dvh bg-gray-100" />}>
          <DetalheVeiculo params={params} />
        </Suspense>
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
