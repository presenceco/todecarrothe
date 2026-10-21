"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { NAV_ADMIN, rotaAtiva, rotuloNovos, type Contadores } from "@/lib/navegacao";

/** Itens do menu lateral: 48px, raio 10; ativo branco sobre rgba(255,255,255,.09); contador dos "novos". */
export function AdminSidebarNav({ contadores }: { contadores: Contadores }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Gestão" className="flex flex-col gap-4">
      {NAV_ADMIN.map((item) => {
        const ativo = rotaAtiva(pathname, [item.href]);
        const n = item.contador ? contadores[item.contador] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "pressable flex h-48 items-center gap-12 rounded-10 px-12",
              ativo ? "bg-white/9 text-white" : "text-gray-300 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon name={item.icone} size={22} />
            <span className="flex-1 text-15 font-semibold">{item.rotulo}</span>
            {n > 0 && (
              <CountBadge total={n} rotulo={rotuloNovos(item, n)} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
