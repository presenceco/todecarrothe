import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Moldura de "Criar cupom" e do detalhe: barra preta com voltar no mobile, caminho e título no desktop. */
export function MolduraCupom({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="box-content flex h-60 items-center gap-4 bg-black px-4 pt-[env(safe-area-inset-top,0px)] text-white lg:hidden">
        <Link href="/admin/cupons" aria-label="Voltar para os cupons" className="pressable flex size-48 flex-none items-center justify-center rounded-12">
          <Icon name="arrow_back" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-17 font-semibold">{titulo}</h1>
          {subtitulo && <p className="truncate text-14 text-gray-350">{subtitulo}</p>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-16 p-16 lg:gap-24 lg:px-40 lg:pt-32 lg:pb-48">
        <div className="hidden min-w-0 lg:block">
          <Link href="/admin/cupons" className="flex items-center gap-6 text-14 font-medium text-gray-500 hover:text-ink">
            <Icon name="arrow_back" size={18} />
            Cupons
          </Link>
          <p className="mt-6 truncate text-28 font-bold">{titulo}</p>
          {subtitulo && <p className="mt-2 truncate text-15 text-gray-600">{subtitulo}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
