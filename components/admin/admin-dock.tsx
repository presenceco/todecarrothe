import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Contadores } from "@/lib/navegacao";
import Link from "next/link";
import { AdminTabBar } from "./admin-tab-bar";

/**
 * Pé fixo do admin mobile (tela 12): botão flutuante opcional ("Cadastrar") acima da barra de abas.
 * É o último filho da coluna da página e fica preso ao pé da tela (sticky), sem cobrir o fim da lista.
 */
export function AdminDock({ contadores, fab }: { contadores: Contadores; fab?: { href: string; rotulo: string } }) {
  return (
    <div className="pointer-events-none sticky bottom-0 z-30 flex flex-col lg:hidden">
      {fab && (
        <Link
          href={fab.href}
          className={buttonClasses({
            size: "custom",
            className: "pointer-events-auto mx-16 mt-8 mb-16 h-56 gap-8 self-end rounded-pill pr-22 pl-18 text-16 font-bold shadow-fab",
          })}
        >
          <Icon name="add" />
          {fab.rotulo}
        </Link>
      )}
      <AdminTabBar contadores={contadores} className="pointer-events-auto" />
    </div>
  );
}
