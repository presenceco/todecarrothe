import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmacao, type ResumoConfirmacao } from "@/components/formularios/confirmacao";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { FAIXAS_PRECO } from "@/lib/formularios/esquemas";

export const metadata: Metadata = { title: "Pedido enviado", robots: { index: false, follow: false } };

const TITULO = "Recebemos seu pedido!";
const TEXTO = "A Tô de Carro vai procurar e te chama no WhatsApp quando encontrar";

/** O resumo vem da URL: o carro procurado, o ano mínimo e a faixa. Nada de dado pessoal na URL. */
async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const carro = typeof sp.carro === "string" ? sp.carro.trim().slice(0, 80) : "";
  const ano = typeof sp.ano === "string" && /^\d{4}$/.test(sp.ano) ? sp.ano : null;
  const faixa = FAIXAS_PRECO.find((f) => f.value === sp.faixa)?.label;

  const resumo: ResumoConfirmacao | null = carro
    ? { rotulo: "Carro procurado", titulo: carro, icone: "travel_explore", detalhe: [ano && `A partir de ${ano}`, faixa].filter(Boolean).join(" · ") || undefined }
    : null;
  const mensagem = carro ? `Olá! Acabei de fazer um pedido de busca pelo catálogo: ${carro}.` : "Olá! Acabei de fazer um pedido de busca pelo catálogo.";

  return <Confirmacao titulo={TITULO} texto={TEXTO} resumo={resumo} mensagemWhatsapp={mensagem} />;
}

/** Pedido de busca enviado: o mesmo padrão da 06. */
export default function PedidoEnviadoPage({ searchParams }: PageProps<"/nao-encontrou/enviado">) {
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
