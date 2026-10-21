"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_SITE, rotaAtiva } from "@/lib/navegacao";

/** Navegação do header desktop (21): 600 15px #A3ACBA; ativo branco com traço azul de 2px embaixo. */
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex min-w-0 flex-1 gap-24 text-15 font-semibold text-gray-300 min-[1440px]:gap-32">
      {NAV_SITE.map((item) => {
        const ativo = rotaAtiva(pathname, item.ativoEm);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "py-30 whitespace-nowrap transition-colors duration-150",
              ativo ? "text-white shadow-nav-active" : "hover:text-white",
            )}
          >
            {item.rotuloDesktop}
          </Link>
        );
      })}
    </nav>
  );
}
