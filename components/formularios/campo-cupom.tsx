"use client";

import { useImperativeHandle, useRef, useState } from "react";
import { TextInput } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { normalizarCupom } from "@/lib/cupom";
import { verificarCupom, type EstadoCupom } from "@/lib/formularios/acoes-cupom";
import { comemorarCupom, guardarCupom, removerCupom, useCupomGuardado } from "@/lib/formularios/cupom-navegador";

export type CampoCupomRef = {
  /** Termina de conferir o que foi digitado (o "Tenho interesse" precisa da resposta antes de seguir). */
  conferir: () => Promise<EstadoCupom | "vazio">;
};

const AJUDA = "Se alguém indicou a Tô de Carro para você, digite o código";
const NAO_ENCONTRADO = "Cupom não encontrado. Confira o código ou envie sem cupom.";

/**
 * Cupom de indicação (opcional), nos formulários e no painel do "Tenho interesse". Confere ao sair do campo e
 * nunca bloqueia o envio. Com cupom guardado na aba, mostra "Cupom aplicado: JOAO" e o link "Remover".
 */
export function CampoCupom({ ref, valor, onValor }: { ref?: React.Ref<CampoCupomRef>; valor: string; onValor: (v: string) => void }) {
  const guardado = useCupomGuardado();
  const [estado, setEstado] = useState<"parado" | "conferindo" | "invalido">("parado");
  const [anuncio, setAnuncio] = useState("");
  const caixa = useRef<HTMLDivElement>(null);
  const emAndamento = useRef<{ codigo: string; resposta: Promise<EstadoCupom> } | null>(null);

  async function conferir(): Promise<EstadoCupom | "vazio"> {
    const codigo = normalizarCupom(valor);
    if (!codigo) {
      setEstado("parado");
      return "vazio";
    }
    if (guardado?.codigo === codigo) return guardado.conferir ? "conferir" : "valido";
    if (emAndamento.current?.codigo === codigo) return emAndamento.current.resposta;

    const resposta = (async (): Promise<EstadoCupom> => {
      setEstado("conferindo");
      // Sem conexão com o servidor, o cupom não é recusado: fica para conferir no envio.
      const r = await verificarCupom(codigo).catch(() => ({ estado: "conferir" as const }));
      if (r.estado === "invalido") {
        setEstado("invalido");
        setAnuncio(NAO_ENCONTRADO);
      } else {
        setEstado("parado");
        onValor(codigo);
        guardarCupom(codigo, r.estado === "conferir");
        if (r.estado === "valido") {
          setAnuncio("Cupom aplicado! Que bom ter você aqui por indicação.");
          comemorarCupom(caixa.current);
        } else setAnuncio("Cupom guardado. Vamos conferir ao enviar.");
      }
      emAndamento.current = null;
      return r.estado;
    })();
    emAndamento.current = { codigo, resposta };
    return resposta;
  }

  useImperativeHandle(ref, () => ({ conferir }));

  return (
    <div ref={caixa}>
      {guardado ? (
        <div className="flex items-center justify-between gap-12 rounded-12 border border-brand-200 bg-brand-25 px-14 py-4">
          <p className="flex min-w-0 items-center gap-8 text-15 font-semibold text-ink">
            <Icon name={guardado.conferir ? "schedule" : "check_circle"} size={20} fill={!guardado.conferir} className="flex-none text-brand" />
            <span className="min-w-0 break-words">
              {guardado.conferir ? `Cupom guardado: ${guardado.codigo}. Vamos conferir ao enviar.` : `Cupom aplicado: ${guardado.codigo}`}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              removerCupom();
              onValor("");
              setEstado("parado");
              setAnuncio("Cupom removido.");
            }}
            className="flex h-48 flex-none items-center text-15 font-semibold text-brand underline"
          >
            Remover
          </button>
        </div>
      ) : (
        <TextInput
          name="cupom"
          label={
            <>
              Tem cupom de indicação? <span className="font-normal text-gray-500">(opcional)</span>
            </>
          }
          hint={
            estado === "invalido" ? (
              <span className="text-warning">{NAO_ENCONTRADO}</span>
            ) : estado === "conferindo" ? (
              "Conferindo o cupom…"
            ) : (
              AJUDA
            )
          }
          value={valor}
          onChange={(e) => {
            onValor(e.target.value);
            if (estado === "invalido") setEstado("parado");
          }}
          onBlur={() => void conferir()}
          maxLength={20}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      )}
      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}
