import type { Metadata } from "next";
import { BarraTitulo } from "@/components/formularios/partes";
import { ListaSimular } from "@/components/formularios/lista-simular";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { listarCatalogo } from "@/lib/catalogo/consultas";
import { anoFabModelo } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Simular financiamento",
  description: "Escolha o carro e simule o financiamento com os principais bancos. A Tô de Carro responde no WhatsApp.",
  alternates: { canonical: "/simular" },
};

/** Escolha do veículo para simular (05). Também é o "Financiamento" do menu desktop. */
export default async function SimularPage() {
  const veiculos = await listarCatalogo();
  const itens = veiculos.map((v) => ({
    slug: v.slug,
    nome: [v.marca, v.modelo, v.versao].filter(Boolean).join(" "),
    ano: anoFabModelo(v.anoFabricacao, v.anoModelo),
    preco: v.preco,
    capa: v.capa?.src ?? null,
  }));
  return (
    <>
      <SiteHeader soDesktop />
      <BarraTitulo titulo="Simular financiamento" />
      <main>
        <ListaSimular itens={itens} />
      </main>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
