"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { moeda } from "@/lib/formato";

export type ItemSimular = { slug: string; nome: string; ano: string; preco: number; capa: string | null };

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** "Qual carro você quer financiar?" (05): busca ao vivo, lista e "Ainda não escolhi". */
export function ListaSimular({ itens }: { itens: readonly ItemSimular[] }) {
  const [busca, setBusca] = useState("");
  const termos = normalizar(busca).split(/\s+/).filter(Boolean);
  const visiveis = termos.length ? itens.filter((i) => termos.every((t) => normalizar(i.nome).includes(t))) : itens;
  const total = visiveis.length;

  return (
    <>
      <div className="bg-black px-20 pt-4 pb-24 text-white lg:px-0 lg:pt-48 lg:pb-88 lg:text-center">
        <h1 className="font-display text-30 leading-108 font-extrabold italic lg:text-56 lg:leading-105">Qual carro você quer financiar?</h1>
        <label className="mx-auto mt-16 flex h-52 max-w-640 items-center gap-10 rounded-14 bg-white px-14 text-left focus-within:outline-2 focus-within:outline-brand-300 lg:mt-24">
          <Icon name="search" size={22} className="text-brand" />
          <span className="sr-only">Buscar marca ou modelo</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar marca ou modelo"
            enterKeyHint="search"
            autoComplete="off"
            className="h-full min-w-0 flex-1 bg-transparent text-16 text-ink outline-none placeholder:text-gray-500"
          />
        </label>
      </div>

      <div className="mx-auto flex max-w-640 flex-col gap-8 p-16 lg:-mt-48 lg:rounded-16 lg:bg-gray-100 lg:px-16 lg:pt-24 lg:pb-72">
        <p aria-live="polite" className="px-4 pb-4 text-14 font-semibold text-gray-600">
          {total === 1 ? "1 veículo disponível" : `${total} veículos disponíveis`}
        </p>
        <ul className="flex flex-col gap-8">
          {visiveis.map((i) => (
            <li key={i.slug}>
              <Link
                href={`/simular/${i.slug}`}
                className="pressable flex items-center gap-12 rounded-14 border border-gray-150 bg-white py-10 pr-4 pl-10 hover:border-gray-200"
              >
                <span className="relative h-54 w-72 flex-none overflow-hidden rounded-8 bg-hatch-sm">
                  {i.capa && <Image src={i.capa} alt="" fill sizes="72px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-15 font-bold">{i.nome}</span>
                  <span className="mt-2 block text-14 whitespace-nowrap text-gray-500">
                    {i.ano} · <b className="font-bold text-ink">{moeda(i.preco)}</b>
                  </span>
                </span>
                <span className="flex size-48 flex-none items-center justify-center text-brand">
                  <Icon name="chevron_right" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/simular/sem-veiculo"
          className="pressable mt-8 flex items-center gap-12 rounded-14 border-[1.5px] border-dashed border-brand bg-white py-14 pr-4 pl-16 hover:bg-brand-100"
        >
          <Icon name="help" size={28} className="text-brand" />
          <span className="flex-1">
            <span className="block text-16 font-bold text-brand">Ainda não escolhi</span>
            <span className="mt-2 block text-14 text-gray-600">Simule informando um valor aproximado</span>
          </span>
          <span className="flex size-48 items-center justify-center text-brand">
            <Icon name="chevron_right" />
          </span>
        </Link>
      </div>
      <div className="h-16 lg:hidden" />
    </>
  );
}
