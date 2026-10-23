"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useRef, useState } from "react";
import { prepararFoto } from "@/components/formularios/fotos-consignacao";
import { Icon } from "@/components/ui/icon";
import { MAX_FOTOS_VEICULO } from "@/lib/admin/esquema-veiculo";
import { cn } from "@/lib/cn";
import { FOTOS_CONSIGNACAO } from "@/lib/formularios/esquemas";
import { urlFotoVeiculo } from "@/lib/supabase/config";
import { clienteNavegador } from "@/lib/supabase/navegador";

export type FotoForm = {
  chave: string;
  /** Caminho no Storage (vazio enquanto envia). */
  path: string;
  url: string;
  origem: "veiculo" | "consignacao";
  enviando?: boolean;
};

const TIPOS = FOTOS_CONSIGNACAO.tipos as readonly string[];
/** No mobile a grade mostra 6 miniaturas; a 6ª leva o "+N" e abre as demais (15). */
const VISIVEIS_MOBILE = 6;

function Miniatura({
  foto,
  indice,
  arrastando,
  sobreposta,
  extra,
  onRemover,
  onMostrarTodas,
}: {
  foto: FotoForm;
  indice: number;
  arrastando?: boolean;
  sobreposta?: boolean;
  extra?: number;
  onRemover?: () => void;
  onMostrarTodas?: () => void;
}) {
  const capa = indice === 0;
  return (
    <div
      className={cn(
        "relative box-border aspect-[4/3] overflow-hidden rounded-10 bg-hatch-sm",
        capa && !arrastando && "border-2 border-brand",
        arrastando && "border-2 border-dashed border-brand-300 bg-brand-100 [background-image:none]",
        sobreposta && "-rotate-3 scale-106 shadow-drag",
      )}
    >
      {!arrastando && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura do Storage ou prévia local */}
          <img src={foto.url} alt={`Foto ${indice + 1}${capa ? " (capa)" : ""}`} className="absolute inset-0 size-full object-cover" draggable={false} />
          {foto.enviando && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-brand">
              <Icon name="progress_activity" className="animate-spin" />
            </span>
          )}
          {capa && <span className="absolute top-5 right-5 rounded-6 bg-brand px-7 py-4 text-14 font-bold text-white lg:top-6 lg:right-6 lg:px-8">Capa</span>}
          {onRemover && !foto.enviando && (
            <button
              type="button"
              onClick={onRemover}
              aria-label={`Remover foto ${indice + 1}`}
              className="pressable absolute right-5 bottom-5 flex size-28 items-center justify-center rounded-pill bg-black/60 text-white before:absolute before:-inset-8 lg:right-6 lg:bottom-6"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-5 left-5 flex size-24 items-center justify-center rounded-6 bg-white/92 text-gray-700 lg:top-6 lg:left-6"
      >
        <Icon name="drag_indicator" size={18} />
      </span>
      {extra !== undefined && extra > 0 && (
        <button
          type="button"
          onClick={onMostrarTodas}
          aria-label={`Mostrar mais ${extra} fotos`}
          className="absolute inset-0 flex items-center justify-center rounded-10 bg-black/60 text-16 font-bold text-white lg:hidden"
        >
          +{extra}
        </button>
      )}
    </div>
  );
}

function ItemOrdenavel(props: { foto: FotoForm; indice: number; extra?: number; escondida?: boolean; onRemover: () => void; onMostrarTodas: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.foto.chave, disabled: props.foto.enviando });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("touch-manipulation", props.escondida && "max-lg:hidden")}
      {...attributes}
      {...listeners}
      aria-roledescription="foto arrastável"
    >
      <Miniatura foto={props.foto} indice={props.indice} arrastando={isDragging} extra={props.extra} onRemover={props.onRemover} onMostrarTodas={props.onMostrarTodas} />
    </li>
  );
}

/**
 * Fotos do veículo (15/28): até 20 JPG/PNG de até 10 MB, enviadas direto para o bucket na pasta do
 * veículo (sessão do admin). Arraste para ordenar (toque segurando, mouse ou teclado); a 1ª é a capa.
 * No desktop, também dá para soltar arquivos na área tracejada.
 */
export function FotosVeiculo({
  veiculoId,
  fotos,
  onFotos,
  erro,
}: {
  veiculoId: string;
  fotos: FotoForm[];
  onFotos: (atualizar: (atuais: FotoForm[]) => FotoForm[]) => void;
  erro?: string;
}) {
  const [ativa, setAtiva] = useState<string | null>(null);
  const [todas, setTodas] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [soltando, setSoltando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  // Id estável: sem ele o dnd-kit numera por contador e o HTML do servidor não bate com o do navegador.
  const idDnd = useId();
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const restantes = MAX_FOTOS_VEICULO - fotos.length;

  async function adicionar(lista: FileList | File[] | null) {
    if (!lista) return;
    const motivos: string[] = [];
    const aceitas: File[] = [];
    for (const arquivo of Array.from(lista)) {
      if (!TIPOS.includes(arquivo.type)) motivos.push(`${arquivo.name}: use JPG ou PNG.`);
      else if (arquivo.size > FOTOS_CONSIGNACAO.tamanhoMaximo) motivos.push(`${arquivo.name}: passa de 10 MB.`);
      else if (aceitas.length >= restantes) motivos.push(`${arquivo.name}: o limite é de ${MAX_FOTOS_VEICULO} fotos.`);
      else aceitas.push(arquivo);
    }
    setAvisos(motivos);
    if (entrada.current) entrada.current.value = "";
    if (!aceitas.length) return;

    const novas = aceitas.map((arquivo) => ({ chave: crypto.randomUUID(), arquivo, url: URL.createObjectURL(arquivo) }));
    onFotos((atuais) => [...atuais, ...novas.map((n) => ({ chave: n.chave, path: "", url: n.url, origem: "veiculo" as const, enviando: true }))]);

    const storage = clienteNavegador().storage.from("veiculos");
    for (const n of novas) {
      const arquivo = await prepararFoto(n.arquivo);
      const path = `${veiculoId}/${crypto.randomUUID()}.${arquivo.type === "image/png" ? "png" : "jpg"}`;
      const { error } = await storage.upload(path, arquivo, { contentType: arquivo.type, cacheControl: "31536000", upsert: false });
      if (error) {
        setAvisos((a) => [...a, `${n.arquivo.name}: não foi possível enviar. Tente de novo.`]);
        onFotos((atuais) => atuais.filter((f) => f.chave !== n.chave));
      } else {
        onFotos((atuais) => atuais.map((f) => (f.chave === n.chave ? { ...f, path, url: urlFotoVeiculo(path), enviando: false } : f)));
      }
      URL.revokeObjectURL(n.url);
    }
  }

  function aoSoltar(e: DragEndEvent) {
    setAtiva(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onFotos((atuais) => {
      const de = atuais.findIndex((f) => f.chave === active.id);
      const para = atuais.findIndex((f) => f.chave === over.id);
      return de < 0 || para < 0 ? atuais : arrayMove(atuais, de, para);
    });
  }

  const ativaIndice = fotos.findIndex((f) => f.chave === ativa);
  const mostrarTodas = todas || fotos.length <= VISIVEIS_MOBILE;
  const escolher = () => entrada.current?.click();

  return (
    <div className="flex flex-col gap-12 lg:gap-0">
      <input
        ref={entrada}
        id="campo-fotos"
        type="file"
        accept={TIPOS.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => adicionar(e.target.files)}
      />

      {/* Desktop: área para soltar arquivos (28). */}
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setSoltando(true);
          }
        }}
        onDragLeave={() => setSoltando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSoltando(false);
          adicionar(e.dataTransfer.files);
        }}
        className={cn(
          "mb-16 hidden h-108 items-center justify-center gap-14 rounded-14 border-2 border-dashed lg:flex",
          soltando ? "border-brand bg-brand-100" : "border-gray-240 bg-gray-50",
          erro && "border-danger",
        )}
      >
        <Icon name="cloud_upload" size={32} className="text-brand" />
        <div>
          <p className="text-15 font-semibold">
            Arraste as fotos aqui ou{" "}
            <button type="button" onClick={escolher} disabled={restantes <= 0} className="text-brand hover:underline disabled:text-gray-400">
              escolha no computador
            </button>
          </p>
          <p className="mt-2 text-14 text-gray-500">JPG ou PNG, até 10 MB cada</p>
        </div>
      </div>

      {fotos.length > 0 && (
        <DndContext
          id={idDnd}
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragStart={(e: DragStartEvent) => setAtiva(String(e.active.id))}
          onDragEnd={aoSoltar}
          onDragCancel={() => setAtiva(null)}
          accessibility={{
            screenReaderInstructions: { draggable: "Para mover a foto, pressione espaço, use as setas e pressione espaço de novo para soltar." },
          }}
        >
          <SortableContext items={fotos.map((f) => f.chave)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-8 lg:grid-cols-6 lg:gap-12">
              {fotos.map((foto, i) => (
                <ItemOrdenavel
                  key={foto.chave}
                  foto={foto}
                  indice={i}
                  escondida={!mostrarTodas && i >= VISIVEIS_MOBILE}
                  extra={!mostrarTodas && i === VISIVEIS_MOBILE - 1 ? fotos.length - VISIVEIS_MOBILE : undefined}
                  onRemover={() => onFotos((atuais) => atuais.filter((f) => f.chave !== foto.chave))}
                  onMostrarTodas={() => setTodas(true)}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>{ativaIndice >= 0 ? <Miniatura foto={fotos[ativaIndice]} indice={ativaIndice} sobreposta /> : null}</DragOverlay>
        </DndContext>
      )}

      {/* Mobile: botão tracejado (15). */}
      {restantes > 0 && (
        <button
          type="button"
          onClick={escolher}
          className={cn(
            "pressable flex h-50 items-center justify-center gap-6 rounded-12 border-[1.5px] border-dashed text-15 font-bold whitespace-nowrap text-brand hover:bg-brand-100 lg:hidden",
            erro ? "border-danger" : "border-brand",
          )}
        >
          <Icon name="add_a_photo" size={20} />
          Adicionar fotos
        </button>
      )}

      {(erro || avisos.length > 0) && (
        <div id="campo-fotos-erro" aria-live="polite" className="text-14 leading-140 text-danger lg:mt-12">
          {erro && <p>{erro}</p>}
          {avisos.map((m) => (
            <p key={m} className="break-words">
              {m}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
