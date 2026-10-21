import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmacao, type ResumoConfirmacao } from "@/components/formularios/confirmacao";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FORMAS_VENDA } from "@/lib/formularios/esquemas";

export const metadata: Metadata = { title: "Carro enviado", robots: { index: false, follow: false } };

const TITULO = "Recebemos os dados do seu carro!";
const TEXTO = "Em breve a Tô de Carro te chama no WhatsApp para combinar a avaliação";

/** O resumo vem da URL: marca e modelo, ano e forma de venda. Nada de dado pessoal na URL. */
async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const carro = typeof sp.carro === "string" ? sp.carro.trim().slice(0, 80) : "";
  const ano = typeof sp.ano === "string" && /^\d{4}\/\d{4}$/.test(sp.ano) ? sp.ano : null;
  const forma = FORMAS_VENDA.find((f) => f.value === sp.forma)?.label;

  const resumo: ResumoConfirmacao | null = carro
    ? { rotulo: forma ? `Seu carro · ${forma}` : "Seu carro", titulo: carro, detalhe: ano ?? undefined, icone: "directions_car" }
    : null;
  const mensagem = carro
    ? `Olá! Acabei de enviar os dados do meu ${carro}${ano ? ` ${ano}` : ""} pelo catálogo${forma ? ` (${forma.toLowerCase()})` : ""}.`
    : "Olá! Acabei de enviar os dados do meu carro pelo catálogo.";

  return <Confirmacao titulo={TITULO} texto={TEXTO} resumo={resumo} mensagemWhatsapp={mensagem} />;
}

/** Carro enviado (34): o mesmo padrão da 06. */
export default function CarroEnviadoPage({ searchParams }: PageProps<"/venda-seu-carro/enviado">) {
  return (
    <>
      <SiteHeader soDesktop />
      <Suspense fallback={<Confirmacao titulo={TITULO} texto={TEXTO} resumo={null} mensagemWhatsapp="Olá!" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
      <SiteFooter className="hidden lg:block" />
    </>
  );
}
