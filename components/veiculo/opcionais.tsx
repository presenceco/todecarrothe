"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

const VISIVEIS_MOBILE = 8;

/**
 * Opcionais. Mobile (03): cartão que abre e fecha, 8 itens e "Ver todos os N opcionais".
 * Desktop (22): cartão com título em Exo 2 e todos os itens em 3 colunas.
 */
export function Opcionais({ itens }: { itens: readonly string[] }) {
  const [aberto, setAberto] = useState(true);
  const [todos, setTodos] = useState(false);
  if (!itens.length) return null;

  return (
    <section
      aria-labelledby="titulo-opcionais"
      className="overflow-hidden rounded-16 border border-gray-150 bg-white lg:border-0 lg:p-28 lg:shadow-hairline"
    >
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-controls="lista-opcionais"
        className="flex h-56 w-full items-center justify-between pr-12 pl-16 text-left lg:mb-20 lg:h-auto lg:p-0"
      >
        <h2 id="titulo-opcionais" className="text-17 font-bold lg:font-display lg:text-24 lg:font-extrabold lg:italic">
          Opcionais{" "}
          <span className="font-medium text-gray-500 lg:font-sans lg:text-16 lg:not-italic">
            · {itens.length}
            <span className="hidden lg:inline"> itens</span>
          </span>
        </h2>
        <Icon name={aberto ? "expand_less" : "expand_more"} className="text-brand" />
      </button>

      {aberto && (
        <div id="lista-opcionais" className="flex flex-col gap-10 border-t border-gray-120 px-16 pt-14 pb-16 lg:border-0 lg:p-0">
          <ul className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-x-24 lg:gap-y-12">
            {itens.map((item, i) => (
              <li
                key={item}
                className={cn("items-center gap-10 text-15 text-ink-500", i >= VISIVEIS_MOBILE && !todos ? "hidden lg:flex" : "flex")}
              >
                <Icon name="check" size={20} className="text-brand" />
                {item}
              </li>
            ))}
          </ul>
          {itens.length > VISIVEIS_MOBILE && !todos && (
            <button type="button" onClick={() => setTodos(true)} className="mt-4 self-start text-15 font-semibold text-brand lg:hidden">
              Ver todos os {itens.length} opcionais
            </button>
          )}
        </div>
      )}
    </section>
  );
}
