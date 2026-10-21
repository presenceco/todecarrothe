import type { Metadata } from "next";
import { Suspense } from "react";
import { Vitrine, VitrineCarregando } from "@/components/catalogo/vitrine";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: { absolute: "Tô de Carro Seminovos · Seminovos em Teresina-PI" },
  description:
    "Estoque de seminovos revisados e com procedência em Teresina-PI. Filtre por marca, preço, ano e câmbio, simule o financiamento e fale direto no WhatsApp.",
  // Filtros geram muitas URLs do mesmo conteúdo; a página canônica é o estoque inteiro.
  alternates: { canonical: "/" },
};

export default function EstoquePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Os filtros vêm da URL (dado de requisição): ficam dentro do Suspense; o resto é estático. */}
        <Suspense fallback={<VitrineCarregando />}>
          <Vitrine searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
