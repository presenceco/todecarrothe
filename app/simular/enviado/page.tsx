import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmacao } from "@/components/formularios/confirmacao";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { obterVeiculo } from "@/lib/catalogo/consultas";
import { moeda } from "@/lib/formato";

export const metadata: Metadata = { title: "Simulação enviada", robots: { index: false, follow: false } };

const TITULO = "Recebemos seus dados!";
const TEXTO = "Em breve a Tô de Carro te chama no WhatsApp com a simulação";

/** Resumo vem da URL: o slug do veículo (ou o valor aproximado). Nada de dado pessoal na URL. */
async function Conteudo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const slug = typeof sp.veiculo === "string" ? sp.veiculo : null;
  const valor = typeof sp.valor === "string" && /^\d{1,9}$/.test(sp.valor) ? Number(sp.valor) : null;
  const v = slug ? await obterVeiculo(slug) : null;

  const resumo = v
    ? {
        rotulo: "Veículo da simulação",
        titulo: [v.marca, v.modelo, v.versao].filter(Boolean).join(" "),
        destaque: moeda(v.preco),
        foto: v.capa?.src ?? null,
      }
    : valor
      ? { rotulo: "Simulação sem veículo escolhido", titulo: "Valor aproximado", destaque: moeda(valor), icone: "calculate" as const }
      : null;

  const mensagem = v
    ? `Olá! Acabei de enviar uma simulação para o ${resumo!.titulo} pelo catálogo.`
    : "Olá! Acabei de enviar uma simulação de financiamento pelo catálogo.";

  return <Confirmacao titulo={TITULO} texto={TEXTO} resumo={resumo} mensagemWhatsapp={mensagem} />;
}

/** Simulação enviada (06). */
export default function SimulacaoEnviadaPage({ searchParams }: PageProps<"/simular/enviado">) {
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
