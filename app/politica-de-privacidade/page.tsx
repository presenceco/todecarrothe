import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { loja, politicaPrivacidade } from "@/lib/loja";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${loja.nome} usa os dados enviados pelos formulários do catálogo, por quanto tempo guarda e como pedir a exclusão.`,
  alternates: { canonical: "/politica-de-privacidade" },
};

/** "2026-10-27" → "27 de outubro de 2026" (data pura, sem fuso). */
function dataPorExtenso(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(ano, mes - 1, dia));
}

/**
 * Política de privacidade (link da autorização dos formulários). Não há tela aprovada: segue o padrão de
 * "Onde estamos" (selo, título em Exo itálico) com as seções do texto em `politicaPrivacidade` (lib/loja.ts).
 */
export default function PoliticaPrivacidadePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-20 pt-24 pb-48 lg:px-0 lg:pt-56 lg:pb-72">
        <p className="text-14 font-light tracking-tagline-36 text-gray-600 lg:tracking-tagline-42">PRIVACIDADE</p>
        <h1 className="mt-8 font-display text-32 leading-105 font-extrabold italic lg:mt-10 lg:text-44 lg:leading-102">Política de privacidade</h1>
        <p className="mt-10 text-14 text-gray-500 lg:mt-14">
          Última atualização: <time dateTime={politicaPrivacidade.atualizadaEm}>{dataPorExtenso(politicaPrivacidade.atualizadaEm)}</time>
        </p>
        <div className="mt-24 flex flex-col gap-28 lg:mt-36 lg:gap-36">
          {politicaPrivacidade.secoes.map((secao) => (
            <section key={secao.titulo} aria-labelledby={`secao-${secao.titulo.split(".")[0]}`}>
              <h2 id={`secao-${secao.titulo.split(".")[0]}`} className="text-19 leading-125 font-bold text-ink lg:text-22">
                {secao.titulo}
              </h2>
              <div className="mt-10 flex flex-col gap-12 text-16 leading-155 text-gray-700 lg:mt-12 lg:text-17">
                {secao.paragrafos.map((paragrafo) => (
                  <p key={paragrafo}>{paragrafo}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
