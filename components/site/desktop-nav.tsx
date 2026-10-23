"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_SITE, rotaAtiva } from "@/lib/navegacao";

/**
 * Navegação do header desktop (21): 600 15px #A3ACBA; ativo branco com traço azul de 2px embaixo.
 * O espaço entre os itens cresce com a largura, sem deixar "Onde estamos" passar por baixo do botão do
 * WhatsApp: em 1280px o botão ganha texto e a navegação volta a ficar mais junta até 1360px.
 */
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="flex min-w-0 flex-1 gap-16 text-14 font-semibold text-gray-300 min-[1100px]:gap-28 xl:gap-20 min-[1360px]:gap-28 min-[1360px]:text-15 min-[1440px]:gap-32"
    >
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
