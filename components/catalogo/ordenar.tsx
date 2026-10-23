"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { hrefFiltros, ORDENS, type Filtros, type Ordem } from "@/lib/catalogo/filtros";

/**
 * Ordenação. Mobile (01): texto "Mais recentes ▾". Desktop (21): caixa "Ordenar: Mais recentes ▾" (46px).
 * Por cima vai o <select> nativo, transparente: no celular abre o seletor do sistema.
 */
export function Ordenar({ filtros }: { filtros: Filtros }) {
  const router = useRouter();
  const atual = ORDENS.find((o) => o.valor === filtros.ordem) ?? ORDENS[0];

  return (
    // Mobile: área de toque de 48px; a margem negativa mantém a linha com a altura do texto (01).
    <label className="relative flex items-center gap-2 text-14 font-medium text-gray-650 max-lg:-my-14 max-lg:h-48 lg:box-border lg:h-46 lg:gap-6 lg:rounded-12 lg:border lg:border-gray-150 lg:bg-white lg:pr-10 lg:pl-14 lg:text-15 lg:text-gray-700 lg:focus-within:outline-2 lg:focus-within:outline-brand">
      {/* Texto num nó só: com gap no flex, "Ordenar: " separado perderia o espaço e ganharia 6px. */}
      <span className="lg:hidden">{atual.rotulo}</span>
      <span className="hidden lg:inline">{`Ordenar: ${atual.rotulo}`}</span>
      <Icon name="expand_more" size={20} />
      <select
        aria-label="Ordenar por"
        value={atual.valor}
        onChange={(e) => router.push(hrefFiltros({ ...filtros, ordem: e.target.value as Ordem }), { scroll: false })}
        className="absolute inset-0 size-full cursor-pointer appearance-none text-16 opacity-0"
      >
        {ORDENS.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
