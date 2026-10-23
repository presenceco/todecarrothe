import { Icon } from "@/components/ui/icon";
import type { NomeIcone } from "@/lib/icones";

/** Lista vazia do admin (sem tela própria: mínima, com os mesmos tokens). */
export function ListaVazia({ icone, titulo, texto }: { icone: NomeIcone; titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center rounded-16 border border-dashed border-gray-200 bg-white px-24 py-48 text-center">
      <span aria-hidden="true" className="flex size-56 items-center justify-center rounded-pill bg-brand-100 text-brand">
        <Icon name={icone} size={28} />
      </span>
      <p className="mt-14 text-17 font-bold">{titulo}</p>
      <p className="mt-4 text-15 text-gray-600">{texto}</p>
    </div>
  );
}

/** Enquanto a página do painel carrega: cabeçalho preto no mobile e blocos neutros. */
export function PaginaCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="flex flex-1 flex-col">
      <div className="h-[calc(134px+env(safe-area-inset-top,0px))] bg-black lg:hidden" />
      <div className="flex flex-col gap-12 p-16 lg:gap-20 lg:px-40 lg:py-32">
        <div className="hidden h-57 w-240 animate-pulse rounded-12 bg-gray-150 lg:block" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-119 animate-pulse rounded-16 bg-white lg:h-73" />
        ))}
      </div>
    </div>
  );
}
