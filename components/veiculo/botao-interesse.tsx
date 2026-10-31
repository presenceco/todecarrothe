"use client";

import { useId, useRef, useState } from "react";
import { CampoCupom, type CampoCupomRef } from "@/components/formularios/campo-cupom";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetHandle } from "@/components/ui/sheet";
import { linkInteresse } from "@/lib/catalogo/interesse";
import { lerCupom, registrarCliqueCupom } from "@/lib/formularios/cupom-navegador";

/** Abre o WhatsApp na mesma aba (funciona no Safari do iPhone, inclusive depois de uma espera). */
function irParaWhatsapp(mensagem: string, slug: string, cupom?: string) {
  if (cupom) registrarCliqueCupom(slug, cupom);
  window.location.href = linkInteresse(mensagem, cupom);
}

/**
 * "Tenho interesse" da página do carro (03/22). É um link de verdade: sem JavaScript, abre o WhatsApp sem cupom.
 * Com cupom guardado na aba, vai direto, com o cupom na mensagem. Sem cupom, abre o painel "Tem cupom de
 * indicação?": campo vazio segue sem cupom; com cupom inválido, avisa, e um segundo toque segue sem cupom.
 */
export function BotaoInteresse({
  slug,
  mensagem,
  className,
  size,
  children,
}: {
  slug: string;
  mensagem: string;
  className?: string;
  size: React.ComponentProps<typeof ButtonAnchor>["size"];
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const [digitado, setDigitado] = useState("");
  const [seguindo, setSeguindo] = useState(false);
  const avisado = useRef(false);
  const campo = useRef<CampoCupomRef>(null);
  const idTitulo = useId();

  async function continuar() {
    if (seguindo) return;
    const guardado = lerCupom();
    if (guardado) return irParaWhatsapp(mensagem, slug, guardado.codigo);
    setSeguindo(true);
    const estado = (await campo.current?.conferir()) ?? "vazio";
    setSeguindo(false);
    // Conferido agora: o campo já guardou o código normalizado.
    if (estado === "valido" || estado === "conferir") return irParaWhatsapp(mensagem, slug, lerCupom()?.codigo);
    if (estado === "invalido" && !avisado.current) {
      avisado.current = true;
      return;
    }
    irParaWhatsapp(mensagem, slug);
  }

  return (
    <>
      <ButtonAnchor
        href={linkInteresse(mensagem)}
        variant="whatsapp-outline"
        size={size}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          const guardado = lerCupom();
          if (guardado) irParaWhatsapp(mensagem, slug, guardado.codigo);
          else {
            avisado.current = false;
            setAberto(true);
          }
        }}
      >
        {children}
      </ButtonAnchor>

      <Sheet
        open={aberto}
        onClose={() => setAberto(false)}
        labelledBy={idTitulo}
        centroNoDesktop
        className="flex flex-col gap-16 rounded-t-24 bg-white px-20 pt-10 pb-[calc(28px+env(safe-area-inset-bottom,0px))] text-ink lg:p-28"
      >
        <div data-sheet-drag className="lg:hidden">
          <SheetHandle />
        </div>
        <h2 id={idTitulo} className="mt-8 text-22 leading-125 font-bold lg:mt-0">
          Tem cupom de indicação?
        </h2>
        <CampoCupom ref={campo} valor={digitado} onValor={setDigitado} />
        <Button variant="whatsapp" size="lg" onClick={() => void continuar()} disabled={seguindo} aria-busy={seguindo} className="gap-8">
          <Icon name="chat" size={20} fill />
          Continuar no WhatsApp
        </Button>
      </Sheet>
    </>
  );
}
