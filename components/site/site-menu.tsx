"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { linkWhatsappLoja, loja } from "@/lib/loja";
import { NAV_SITE, rotaAtiva } from "@/lib/navegacao";
import { Logo, Simbolo } from "./logo";

/** Botão de menu do header mobile e a gaveta preta da tela 09 (328px, à direita). */
export function SiteMenu() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const fechar = () => setAberto(false);

  return (
    <>
      <IconButton
        icon="menu"
        iconSize={28}
        label="Abrir menu"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="text-white"
      />
      <Sheet open={aberto} onClose={fechar} side="right" label="Menu" className="flex w-328 max-w-[calc(100vw-32px)] flex-col bg-black text-white shadow-drawer">
        <div className="flex h-64 flex-none items-center justify-between pt-[env(safe-area-inset-top,0px)] pr-4 pl-20 box-content">
          <Logo size="menu" />
          <IconButton icon="close" iconSize={26} label="Fechar menu" onClick={fechar} />
        </div>
        <div className="h-1 flex-none bg-filete opacity-45" />

        <nav aria-label="Menu" className="flex flex-col gap-4 overflow-y-auto px-12 py-16">
          {NAV_SITE.map((item) => {
            const ativo = rotaAtiva(pathname, item.ativoEm);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={fechar}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "pressable flex h-56 items-center gap-14 rounded-12 px-12",
                  ativo ? "bg-white/9" : "hover:bg-white/6",
                )}
              >
                <Icon name={item.icone} size={22} className="text-brand-300" />
                <span className="flex-1 text-17 font-semibold whitespace-nowrap">{item.rotuloMenu}</span>
                <Icon name="chevron_right" size={20} className="text-gray-600" />
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="relative flex flex-col gap-20 overflow-hidden px-20 pt-20 pb-[calc(28px+env(safe-area-inset-bottom,0px))]">
          <Simbolo className="pointer-events-none absolute -right-70 -bottom-60 w-240 opacity-10" />
          <a
            href={linkWhatsappLoja()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "whatsapp", size: "lg", className: "relative gap-8" })}
          >
            <Icon name="chat" size={22} fill />
            Fale no WhatsApp
          </a>
          <p className="relative flex gap-12 text-15 leading-145 text-silver">
            <Icon name="location_on" size={20} className="text-brand-300" />
            <span>
              {loja.endereco.map((linha, i) => (
                <span key={linha}>
                  {i > 0 && <br />}
                  {linha}
                </span>
              ))}
            </span>
          </p>
          <p className="relative flex gap-12 text-15 leading-145 text-silver">
            <Icon name="schedule" size={20} className="text-brand-300" />
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
      </Sheet>
    </>
  );
}
