"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Busca das listas do admin, na URL (?q=): troca a página sem recarregar, 300ms depois da última tecla,
 * mantendo o filtro de status e voltando para a página 1.
 */
function useBusca(inicial: string, status: string | null) {
  const router = useRouter();
  const pathname = usePathname();
  const [valor, setValor] = useState(inicial);
  const [pendente, iniciar] = useTransition();
  const ultimo = useRef(inicial);

  useEffect(() => {
    const termo = valor.trim();
    if (termo === ultimo.current) return;
    const t = window.setTimeout(() => {
      ultimo.current = termo;
      const p = new URLSearchParams();
      if (termo) p.set("q", termo);
      if (status) p.set("status", status);
      const s = p.toString();
      iniciar(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(t);
  }, [valor, status, pathname, router]);

  return { valor, setValor, pendente };
}

/** Campo de busca do desktop (27: 380×44, raio 12, borda #E4E8EF, lupa 20px). */
export function BuscaDesktop({ inicial, status, placeholder, largura = "w-380" }: { inicial: string; status: string | null; placeholder: string; largura?: string }) {
  const { valor, setValor, pendente } = useBusca(inicial, status);
  return (
    <label className={cn("flex h-44 flex-none items-center gap-8 rounded-12 border border-gray-150 bg-white px-14 text-gray-400 focus-within:border-brand focus-within:shadow-focus", largura)}>
      <Icon name={pendente ? "progress_activity" : "search"} size={20} className={pendente ? "animate-spin" : undefined} />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-15 text-ink outline-none placeholder:text-gray-400"
      />
    </label>
  );
}

/**
 * Lupa do cabeçalho mobile (12): abre um campo de busca no lugar da linha de chips enquanto há termo.
 * `children` são os chips de status, que voltam quando a busca fecha.
 */
export function BuscaMobile({ inicial, status, placeholder }: { inicial: string; status: string | null; placeholder: string }) {
  const { valor, setValor, pendente } = useBusca(inicial, status);
  const [aberta, setAberta] = useState(inicial !== "");
  const campo = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={aberta ? "Fechar busca" : placeholder}
        aria-expanded={aberta}
        onClick={() => {
          if (aberta) {
            setValor("");
            setAberta(false);
          } else {
            setAberta(true);
            requestAnimationFrame(() => campo.current?.focus());
          }
        }}
        className="pressable flex size-48 flex-none items-center justify-center rounded-12"
      >
        <Icon name={aberta ? "close" : "search"} />
      </button>
      {/* Faixa de busca por cima da linha de chips (o cabeçalho é `relative`; 60px = 12 + linha de 48). */}
      <div className={cn("absolute inset-x-0 top-[calc(60px+env(safe-area-inset-top,0px))] bottom-0 z-10 bg-black px-16 pt-12 pb-14", !aberta && "hidden")}>
        <label className="flex h-48 items-center gap-10 rounded-12 bg-white px-14 text-gray-400">
          <Icon name={pendente ? "progress_activity" : "search"} size={22} className={cn("text-brand", pendente && "animate-spin")} />
          <span className="sr-only">{placeholder}</span>
          <input
            ref={campo}
            type="search"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={placeholder}
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-16 text-ink outline-none placeholder:text-gray-500"
          />
        </label>
      </div>
    </>
  );
}
