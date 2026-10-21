import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { linkWhatsappLoja, loja } from "@/lib/loja";

const definida = loja.politicaPrivacidade !== null;

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como a ${loja.nome} usa os dados enviados pelos formulários do catálogo.`,
  alternates: { canonical: "/politica-de-privacidade" },
  // Sem o texto definitivo, a página não deve aparecer nos buscadores.
  robots: definida ? undefined : { index: false, follow: true },
};

/**
 * Política de privacidade (link da autorização dos formulários). Não há tela aprovada: segue o padrão de
 * "A loja". O texto vem de `loja.politicaPrivacidade`; enquanto não existir, mostra um aviso.
 */
export default function PoliticaPrivacidadePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-20 pt-24 pb-48 lg:px-0 lg:pt-56 lg:pb-72">
        <p className="text-14 font-light tracking-tagline-36 text-gray-600 lg:tracking-tagline-42">PRIVACIDADE</p>
        <h1 className="mt-8 font-display text-32 leading-105 font-extrabold italic lg:mt-10 lg:text-44 lg:leading-102">Política de privacidade</h1>
        {loja.politicaPrivacidade ? (
          <div className="mt-20 flex flex-col gap-14 text-16 leading-155 text-gray-700 lg:mt-28 lg:text-17">
            {loja.politicaPrivacidade.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
        ) : (
          <div className="mt-20 rounded-16 border border-gray-150 bg-white p-20 lg:mt-28 lg:p-28">
            <p className="flex gap-12 text-16 leading-150 text-gray-700">
              <Icon name="info" size={22} className="text-brand" />
              <span>
                O texto completo desta política está sendo preparado pela {loja.nome}. Se tiver qualquer dúvida sobre o uso dos seus dados, fale com a
                gente pelo WhatsApp.
              </span>
            </p>
            <ButtonAnchor href={linkWhatsappLoja("Olá! Tenho uma dúvida sobre a política de privacidade.")} variant="whatsapp" size="lg" className="mt-20 box-border w-full gap-8 lg:w-auto lg:px-24">
              <Icon name="chat" size={20} fill />
              Falar no WhatsApp
            </ButtonAnchor>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
