import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { linkWhatsappLoja, loja } from "@/lib/loja";

export const metadata: Metadata = {
  title: "A loja",
  description: `${loja.nome}: ${loja.endereco.linha1}, ${loja.endereco.linha2}. ${loja.horario.join(" · ")}.`,
  alternates: { canonical: "/a-loja" },
};

/** A loja (10 mobile, 25 desktop): fachada, apresentação, mapa, endereço, horário, WhatsApp e "Como chegar". */
export default function ALojaPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-page lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-48 lg:px-32 lg:pt-56 lg:pb-72 xl:px-64">
        <div className="relative aspect-[4/3] bg-hatch lg:overflow-hidden lg:rounded-16">
          {loja.fotoFachada && (
            <Image src={loja.fotoFachada} alt={`Fachada da ${loja.nome}`} fill preload sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-20 px-16 pt-24 lg:gap-24 lg:p-0">
          <div className="px-4 lg:p-0">
            <p className="text-14 font-light tracking-tagline-36 text-gray-600 lg:tracking-tagline-42">A LOJA</p>
            <h1 className="mt-8 font-display text-32 leading-105 font-extrabold italic lg:mt-10 lg:text-52 lg:leading-102">{loja.nome}</h1>
            <p className="mt-10 text-16 leading-150 text-gray-700 lg:mt-14 lg:max-w-520 lg:text-18 lg:leading-155">{loja.sobre}</p>
          </div>

          <div className="overflow-hidden rounded-16 border border-gray-150 bg-white">
            <a
              href={loja.mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${loja.endereco.linha1}, ${loja.endereco.linha2} no mapa`}
              className="relative block h-180 bg-hatch lg:h-220"
            >
              {loja.imagemMapa && <Image src={loja.imagemMapa} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />}
              <span className="absolute top-44 left-1/2 flex size-48 -translate-x-1/2 items-center justify-center rounded-pill bg-brand text-white shadow-map-pin lg:top-64">
                <Icon name="location_on" fill />
              </span>
            </a>
            <div className="flex flex-col gap-14 p-16 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-24 lg:py-20">
              <p className="flex gap-12 text-16 leading-145">
                <Icon name="location_on" size={22} className="text-brand" />
                <span>
                  {loja.endereco.linha1}
                  <br />
                  {loja.endereco.linha2}
                </span>
              </p>
              <p className="flex gap-12 text-16 leading-145">
                <Icon name="schedule" size={22} className="text-brand" />
                <span>
                  {loja.horario.map((linha, i) => (
                    <span key={linha}>
                      {i > 0 && <br />}
                      {linha}
                    </span>
                  ))}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <ButtonAnchor href={linkWhatsappLoja()} variant="whatsapp" size="lg" className="gap-8 lg:h-56 lg:px-24">
              <Icon name="chat" size={20} fill />
              Fale no WhatsApp
            </ButtonAnchor>
            <ButtonAnchor href={loja.mapaUrl} variant="outline" size="lg" className="box-border gap-8 lg:h-56 lg:px-24">
              <Icon name="directions" size={20} />
              Como chegar
            </ButtonAnchor>
          </div>
        </div>
      </main>
      <div className="h-28 lg:hidden" />
      <SiteFooter />
    </>
  );
}
