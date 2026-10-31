"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetHandle } from "@/components/ui/sheet";
import { iniciais } from "@/lib/formato";
import type { UsuarioAdmin } from "./admin-sidebar";

/** Avatar do cabeçalho mobile do admin, que abre o painel "Conta" (tela 20). */
export function AccountSheet({ usuario }: { usuario: UsuarioAdmin }) {
  const [aberto, setAberto] = useState(false);
  const sigla = iniciais(usuario.nome);

  return (
    <>
      <button
        type="button"
        aria-label={`Conta de ${usuario.nome}`}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="pressable flex size-48 items-center justify-center"
      >
        <span className="box-border flex size-36 items-center justify-center rounded-pill border border-gray-700 bg-ink-700 text-14 font-bold text-white">
          {sigla}
        </span>
      </button>

      <Sheet open={aberto} onClose={() => setAberto(false)} label="Conta" className="rounded-t-24 bg-white pt-10 pb-[calc(24px+env(safe-area-inset-bottom,0px))] text-ink">
        <div data-sheet-drag>
          <SheetHandle />
          <div className="flex items-center gap-14 border-b border-gray-120 px-20 pt-20 pb-18">
            <div aria-hidden="true" className="flex size-56 items-center justify-center rounded-pill bg-brand text-18 font-bold text-white">
              {sigla}
            </div>
            <div>
              <div className="text-18 font-bold">{usuario.nome}</div>
              <div className="mt-2 text-15 text-gray-500">{usuario.papel}</div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <Link
            href="/admin/cupons"
            onClick={() => setAberto(false)}
            className="pressable flex h-56 items-center gap-16 rounded-12 px-14 text-16 font-semibold hover:bg-gray-100"
          >
            <Icon name="confirmation_number" />
            Cupons de indicação
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener"
            onClick={() => setAberto(false)}
            className="pressable flex h-56 items-center gap-16 rounded-12 px-14 text-16 font-semibold hover:bg-gray-100"
          >
            <Icon name="open_in_new" />
            Ver catálogo
          </a>
          <form action="/admin/sair" method="post">
            <button
              type="submit"
              className="pressable flex h-56 w-full items-center gap-16 rounded-12 px-14 text-16 font-semibold text-danger hover:bg-danger-bg"
            >
              <Icon name="logout" />
              Sair
            </button>
          </form>
        </div>
      </Sheet>
    </>
  );
}
