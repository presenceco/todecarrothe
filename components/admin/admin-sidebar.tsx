import { Icon } from "@/components/ui/icon";
import { Simbolo } from "@/components/site/logo";
import { iniciais } from "@/lib/formato";
import type { Contadores } from "@/lib/navegacao";
import { AdminSidebarNav } from "./admin-sidebar-nav";

export type UsuarioAdmin = { nome: string; papel: string };

/**
 * Menu lateral do admin desktop (telas 27–32): 248px, preto, com Consignações abaixo de Simulações.
 * O rodapé é a "Conta" do desktop: "Ver catálogo", nome, papel e sair.
 */
export function AdminSidebar({ contadores, usuario }: { contadores: Contadores; usuario: UsuarioAdmin }) {
  return (
    <aside className="sticky top-0 box-border flex h-dvh w-248 flex-none flex-col self-start bg-black px-16 py-24 text-white">
      <div className="flex items-center gap-12 px-8 pb-32">
        <Simbolo className="size-40" />
        <div>
          <div className="font-display text-19 leading-105 font-extrabold italic">Tô de Carro</div>
          <div className="mt-5 text-14 leading-none tracking-tagline-32 text-gray-400">SEMINOVOS</div>
        </div>
      </div>

      <div className="px-12 pb-10 text-14 font-semibold tracking-label text-gray-600" aria-hidden="true">
        GESTÃO
      </div>
      <AdminSidebarNav contadores={contadores} />

      <div className="flex-1" />

      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="pressable flex h-48 items-center gap-12 rounded-10 px-12 text-14 font-medium text-gray-300 hover:bg-white/6 hover:text-white"
      >
        <Icon name="open_in_new" size={20} />
        Ver catálogo
      </a>
      <div className="mt-12 mb-16 h-1 bg-filete opacity-35" />
      <div className="flex items-center gap-12 px-8">
        <div
          aria-hidden="true"
          className="flex size-36 flex-none items-center justify-center rounded-pill bg-ink-700 text-14 font-bold"
        >
          {iniciais(usuario.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-14 font-semibold">{usuario.nome}</div>
          <div className="truncate text-14 text-gray-400">{usuario.papel}</div>
        </div>
        <form action="/admin/sair" method="post">
          <button
            type="submit"
            aria-label="Sair"
            title="Sair"
            className="pressable relative flex text-gray-400 before:absolute before:-inset-10 before:content-[''] hover:text-white"
          >
            <Icon name="logout" size={20} />
          </button>
        </form>
      </div>
    </aside>
  );
}
