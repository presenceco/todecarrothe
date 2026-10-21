"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { NAV_ADMIN, rotaAtiva, rotuloNovos, type Contadores } from "@/lib/navegacao";

/**
 * Barra inferior do admin mobile (tela 12): 76px, preta, 4 abas (Estoque · Pedidos · Simulações · Consignações).
 * Abas com largura igual sempre que cabem; se a tela for estreita, a de rótulo maior ("Consignações",
 * 96,8px) cresce e as outras cedem, para nenhum rótulo quebrar nem diminuir (dúvida 12).
 * Fica presa ao pé da tela e soma a área da barra de gestos do iPhone.
 */
export function AdminTabBar({ contadores, className }: { contadores: Contadores; className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Gestão"
      className={cn(
        "box-border flex h-[calc(76px+env(safe-area-inset-bottom,0px))] bg-black pb-[calc(8px+env(safe-area-inset-bottom,0px))]",
        className,
      )}
    >
      {NAV_ADMIN.map((item) => {
        const ativo = rotaAtiva(pathname, [item.href]);
        const n = item.contador ? contadores[item.contador] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "pressable relative flex min-w-max flex-1 basis-0 flex-col items-center justify-center gap-2",
              ativo ? "text-white" : "text-gray-450",
            )}
          >
            <Icon name={item.icone} />
            <span className="text-14 font-semibold">{item.rotulo}</span>
            {n > 0 && (
              <CountBadge size="sm" className="absolute top-6 left-1/2 ml-6" total={n} rotulo={rotuloNovos(item, n)} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
