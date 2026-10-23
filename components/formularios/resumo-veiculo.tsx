import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { anoFabModelo, km } from "@/lib/formato";
import type { VeiculoCatalogo } from "@/lib/tipos";

type Props = { v: VeiculoCatalogo };

/** Resumo escuro do veículo no topo da simulação mobile (04). */
export function ResumoEscuro({ v }: Props) {
  return (
    <div className="flex items-center gap-12 rounded-16 border border-ink-600 bg-ink-800 p-12 text-white">
      <div className="relative h-78 w-104 flex-none overflow-hidden rounded-10 bg-hatch-sm">
        {v.capa && <Image src={v.capa.src} alt={v.capa.alt} fill sizes="104px" className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="text-14 font-bold tracking-eyebrow text-brand-300 uppercase">{v.marca}</p>
        <p className="font-display text-19 leading-110 font-extrabold italic">{[v.modelo, v.versao].filter(Boolean).join(" ")}</p>
        <p className="mt-2 text-14 text-gray-350">
          {anoFabModelo(v.anoFabricacao, v.anoModelo)} · {km(v.km)}
        </p>
        <Price valor={v.preco} size="summary" className="mt-4" />
      </div>
    </div>
  );
}

/** Cartão do veículo na coluna da simulação desktop (23), com "Trocar veículo". */
export function ResumoClaro({ v }: Props) {
  return (
    <div className="overflow-hidden rounded-16 bg-white shadow-float">
      <div className="relative aspect-[4/3] bg-hatch">
        {v.capa && <Image src={v.capa.src} alt={v.capa.alt} fill sizes="400px" className="object-cover" />}
      </div>
      <div className="flex flex-col gap-16 p-24">
        <div>
          <p className="text-14 font-bold tracking-eyebrow text-brand uppercase">{v.marca}</p>
          <p className="mt-2 font-display text-34 leading-105 font-extrabold italic">{v.modelo}</p>
          <p className="mt-4 text-16 text-gray-600">{[v.versao, anoFabModelo(v.anoFabricacao, v.anoModelo), km(v.km)].filter(Boolean).join(" · ")}</p>
          <Price valor={v.preco} size="aside" className="mt-14" />
        </div>
        <div aria-hidden="true" className="h-1 bg-filete" />
        <p className="flex gap-10 text-15 leading-145 text-gray-700">
          <Icon name="chat" size={20} className="text-brand" />
          A gente simula com os bancos e te responde no WhatsApp.
        </p>
        <Link href="/simular" className="flex h-48 items-center self-start text-15 font-semibold text-brand hover:underline">
          Trocar veículo
        </Link>
      </div>
    </div>
  );
}
