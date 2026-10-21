"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { FOTOS_CONSIGNACAO } from "@/lib/formularios/esquemas";

export type FotoLocal = { id: string; arquivo: File; url: string };

const MB = 1024 * 1024;
/** Acima disso a foto é reduzida no navegador antes do envio (o envio pelo 4G fica bem mais rápido). */
const REDUZIR_ACIMA = 2 * MB;
const LADO_MAXIMO = 2400;

/**
 * Fotos da "Venda seu carro" (33/37): até 8 JPG ou PNG de até 10 MB, com prévia e botão para remover.
 * Os arquivos ficam no navegador até o envio; o formulário sobe cada um para o Storage com link assinado.
 */
export function FotosConsignacao({
  fotos,
  onFotos,
  erro,
  desabilitado,
}: {
  fotos: readonly FotoLocal[];
  onFotos: (fotos: FotoLocal[]) => void;
  erro?: string;
  desabilitado?: boolean;
}) {
  const [recusadas, setRecusadas] = useState<string[]>([]);
  const entrada = useRef<HTMLInputElement>(null);
  const idDica = useId();
  const restantes = FOTOS_CONSIGNACAO.maximo - fotos.length;

  // Libera as prévias (URLs de objeto) quando o componente sai da tela.
  const atuais = useRef(fotos);
  useEffect(() => {
    atuais.current = fotos;
  }, [fotos]);
  useEffect(() => () => atuais.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  function adicionar(lista: FileList | null) {
    if (!lista?.length) return;
    const novas: FotoLocal[] = [];
    const motivos: string[] = [];
    for (const arquivo of Array.from(lista)) {
      if (!(FOTOS_CONSIGNACAO.tipos as readonly string[]).includes(arquivo.type)) motivos.push(`${arquivo.name}: use JPG ou PNG.`);
      else if (arquivo.size > FOTOS_CONSIGNACAO.tamanhoMaximo) motivos.push(`${arquivo.name}: passa de 10 MB.`);
      else if (novas.length >= restantes) motivos.push(`${arquivo.name}: o limite é de ${FOTOS_CONSIGNACAO.maximo} fotos.`);
      else novas.push({ id: crypto.randomUUID(), arquivo, url: URL.createObjectURL(arquivo) });
    }
    setRecusadas(motivos);
    if (novas.length) onFotos([...fotos, ...novas]);
    if (entrada.current) entrada.current.value = "";
  }

  function remover(foto: FotoLocal) {
    URL.revokeObjectURL(foto.url);
    setRecusadas([]);
    onFotos(fotos.filter((f) => f.id !== foto.id));
  }

  /** Botão de escolher fotos: faixa larga quando não há nenhuma; depois, um quadrado na grade. */
  const botaoAdicionar = (vazio: boolean) => (
    <label
      className={cn(
        "pressable flex w-full cursor-pointer items-center justify-center rounded-10 border-[1.5px] border-dashed bg-white text-15 font-semibold text-brand hover:bg-brand-100",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
        vazio ? "h-56 gap-8" : "aspect-square",
        erro ? "border-danger" : "border-brand",
        desabilitado && "pointer-events-none opacity-50",
      )}
    >
      <Icon name="add_a_photo" size={vazio ? 22 : 24} />
      {vazio ? "Adicionar fotos" : <span className="sr-only">Adicionar mais fotos</span>}
      <input
        ref={entrada}
        id="campo-fotos"
        type="file"
        accept={FOTOS_CONSIGNACAO.tipos.join(",")}
        multiple
        disabled={desabilitado}
        onChange={(e) => adicionar(e.target.files)}
        aria-describedby={erro ? "campo-fotos-erro" : idDica}
        className="sr-only"
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-12">
      <p id={idDica} className="-mt-4 text-14 leading-140 text-gray-600">
        Frente, traseira, laterais, painel e bancos ajudam na avaliação
      </p>
      {fotos.length === 0 ? (
        botaoAdicionar(true)
      ) : (
        <ul className="grid grid-cols-4 gap-8 lg:grid-cols-8">
          {fotos.map((f, i) => (
            <li key={f.id} className="relative aspect-square overflow-hidden rounded-10 bg-gray-100">
              {/* Prévia local (blob:), sem passar pelo otimizador de imagens. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => remover(f)}
                disabled={desabilitado}
                aria-label={`Remover foto ${i + 1}`}
                className="pressable absolute top-4 right-4 flex size-28 items-center justify-center rounded-pill bg-black/60 text-white before:absolute before:-inset-8 disabled:opacity-0"
              >
                <Icon name="close" size={18} />
              </button>
            </li>
          ))}
          {restantes > 0 && (
            <li>
              {botaoAdicionar(false)}
            </li>
          )}
        </ul>
      )}
      <p className="text-14 text-gray-500">
        {fotos.length} de {FOTOS_CONSIGNACAO.maximo} fotos · JPG ou PNG, até 10 MB cada
      </p>
      {(erro || recusadas.length > 0) && (
        <div id="campo-fotos-erro" aria-live="polite" className="-mt-4 text-14 leading-140 text-danger">
          {erro && <p>{erro}</p>}
          {recusadas.map((m) => (
            <p key={m} className="break-words">
              {m}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Reduz fotos grandes (lado maior até 2400px, JPEG 85%) antes do envio. Mantém a orientação da câmera.
 * Se o navegador não conseguir, ou o resultado não ficar menor, envia o arquivo original.
 */
export async function prepararFoto(arquivo: File): Promise<File> {
  if (arquivo.size <= REDUZIR_ACIMA || typeof createImageBitmap !== "function") return arquivo;
  try {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return arquivo;
    ctx.fillStyle = "#fff"; // PNG com transparência vira JPEG com fundo branco
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    if (!blob || blob.size >= arquivo.size) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
