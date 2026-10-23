import Link from "next/link";
import { ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { linkWhatsappLoja } from "@/lib/loja";
import { Logo } from "./logo";
import { DesktopNav } from "./desktop-nav";
import { SiteMenu } from "./site-menu";

/**
 * Header do site.
 * Mobile (01): 64px, logo à esquerda, WhatsApp redondo verde e menu à direita.
 * Desktop (21): 84px, logo, navegação e "Fale no WhatsApp". Com o item novo "Venda seu carro" a
 * linha da tela 21 só cabe a partir de 1440px; abaixo disso as distâncias encolhem e, entre 1024 e
 * 1279px, o botão do WhatsApp fica só com o ícone.
 */
export function SiteHeader({ soDesktop = false }: { /** Páginas com barra própria no mobile (detalhe, formulários). */ soDesktop?: boolean }) {
  return (
    <header className={cn("bg-black pt-[env(safe-area-inset-top,0px)] text-white", soDesktop && "hidden lg:block")}>
      {/* Mobile */}
      <div className={cn("flex h-64 items-center justify-between pr-12 pl-16 lg:hidden", soDesktop && "hidden")}>
        <Link href="/" aria-label="Tô de Carro Seminovos, início" className="pressable">
          <Logo size="header" />
        </Link>
        <div className="flex items-center gap-4">
          <a
            href={linkWhatsappLoja()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="pressable flex size-48 items-center justify-center rounded-pill bg-whatsapp text-white hover:bg-whatsapp-dark"
          >
            <Icon name="chat" fill />
          </a>
          <SiteMenu />
        </div>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden h-84 max-w-page items-center gap-16 px-32 lg:flex xl:gap-32 xl:px-64 min-[1440px]:gap-48">
        <Link href="/" aria-label="Tô de Carro Seminovos, início" className="pressable flex-none">
          <Logo size="desktop" />
        </Link>
        <DesktopNav />
        <ButtonAnchor
          href={linkWhatsappLoja()}
          variant="whatsapp"
          size="custom"
          aria-label="Fale no WhatsApp"
          className="h-48 w-48 gap-8 rounded-pill text-15 font-bold xl:w-auto xl:rounded-12 xl:px-20"
        >
          <Icon name="chat" size={20} fill />
          <span className="hidden xl:inline">Fale no WhatsApp</span>
        </ButtonAnchor>
      </div>
    </header>
  );
}
