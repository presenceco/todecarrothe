import Link from "next/link";
import { ChipLink, DarkChipLink } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { hrefLista, type FiltrosLista } from "@/lib/admin/filtros";
import type { Indicacao } from "@/lib/admin/indicacao";

/** Selo com o código do cupom, nos cartões e nas linhas das listas de contatos. */
export function SeloCupom({ codigo }: { codigo: string }) {
  return (
    <span className="inline-flex max-w-full flex-none items-center gap-4 rounded-pill bg-brand-50 px-8 py-0 text-14 font-semibold text-brand">
      <Icon name="confirmation_number" size={16} />
      <span className="sr-only">Cupom de indicação:</span>
      {codigo}
    </span>
  );
}

/** Conteúdo da seção "Indicação" do detalhe: código e nome do indicador, que levam ao detalhe do cupom. */
export function LinkIndicacao({ indicacao }: { indicacao: Indicacao }) {
  return (
    <Link href={`/admin/cupons/${indicacao.cupomId}`} className="flex min-h-48 items-center gap-10 text-15 font-semibold text-brand hover:underline">
      <SeloCupom codigo={indicacao.codigo} />
      <span className="min-w-0 break-words">{indicacao.indicador}</span>
    </Link>
  );
}

/** Filtro "Com indicação" (?indicacao=1) no cabeçalho preto do mobile. */
export function ChipIndicacaoMobile({ base, filtros, total }: { base: string; filtros: FiltrosLista<string>; total: number }) {
  return (
    <DarkChipLink href={hrefLista(base, filtros, { indicacao: !filtros.indicacao })} selected={!!filtros.indicacao} count={total} scroll={false}>
      Com indicação
    </DarkChipLink>
  );
}

/** Filtro "Com indicação" (?indicacao=1) ao lado das abas de status no desktop. */
export function ChipIndicacaoDesktop({ base, filtros, total }: { base: string; filtros: FiltrosLista<string>; total: number }) {
  return (
    <ChipLink href={hrefLista(base, filtros, { indicacao: !filtros.indicacao })} selected={!!filtros.indicacao} size="sm" scroll={false}>
      Com indicação
      <span className="font-medium opacity-70">{total}</span>
    </ChipLink>
  );
}
