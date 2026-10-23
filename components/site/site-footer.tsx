import Link from "next/link";
import { cn } from "@/lib/cn";
import { linkWhatsappLoja, loja } from "@/lib/loja";
import { AnoAtual } from "./ano-atual";
import { Simbolo } from "./logo";

/** Ícone do Instagram (contorno, 22px, cor do texto). */
function IconeInstagram() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ícone do WhatsApp (balão com telefone, 22px, cor do texto). */
function IconeWhatsapp() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4.2 20.1 5.3 16.3A8.6 8.6 0 1 1 8.1 19Z" />
      <path
        d="M9.2 7.9c.3-.3.8-.3 1 .1l.8 1.6c.1.3.1.6-.1.8l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.8-.1l1.6.8c.4.2.4.7.1 1l-.7.7c-.5.5-1.2.6-1.8.4-2.4-.9-4.3-2.8-5.2-5.2-.2-.6-.1-1.3.4-1.8Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/** Cadeado (contorno, 18px): acesso discreto ao painel do lojista. */
function IconeCadeado() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

/** Ícone do Facebook ("f" num círculo, 22px, cor do texto). */
function IconeFacebook() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

/** Mensagem pronta do WhatsApp do rodapé. */
const MENSAGEM_RODAPE = "Olá! Vim pelo site da Tô de Carro e gostaria de mais informações.";

const REDES = [
  { href: loja.instagram, rotulo: `Instagram da ${loja.marcaRodape}`, Icone: IconeInstagram },
  { href: loja.facebook, rotulo: `Facebook da ${loja.marcaRodape}`, Icone: IconeFacebook },
  { href: linkWhatsappLoja(MENSAGEM_RODAPE), rotulo: `WhatsApp da ${loja.marcaRodape}`, Icone: IconeWhatsapp },
];

/**
 * Rodapé: mobile (01) 24px 20px, símbolo 30; desktop (21) 36px 64px, símbolo 36.
 * Redes sociais à direita (alvo de 48px, abrem em nova aba) e, embaixo, os direitos com o ano automático.
 */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("bg-black text-gray-350", className)}>
      <div className="mx-auto flex max-w-page flex-col gap-12 px-20 py-24 text-14 lg:gap-16 lg:px-32 lg:py-36 xl:px-64">
        <div className="flex items-center gap-12 lg:gap-16">
          <Simbolo className="size-30 flex-none lg:size-36" />
          {/* Uma string só: texto partido em vários nós pode perder o kerning entre eles. */}
          <span className="min-w-0 flex-1">{`${loja.nome} · ${loja.cidade}`}</span>
          <nav aria-label="Redes sociais e WhatsApp" className="-my-9 -mr-12 flex flex-none">
            {REDES.map(({ href, rotulo, Icone }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={rotulo}
                className="pressable flex size-48 items-center justify-center rounded-pill hover:bg-white/9 hover:text-white"
              >
                <Icone />
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-12">
          <p className="flex-1 leading-140">
            Todos os direitos reservados {loja.marcaRodape} © <AnoAtual /> · Feito por Presence.co
          </p>
          {/* Acesso ao painel (pede a senha do lojista). Discreto: ícone pequeno, alvo de 48px. */}
          <Link
            href="/admin/estoque"
            prefetch={false}
            aria-label="Área do lojista"
            title="Área do lojista"
            className="pressable -my-14 -mr-12 flex size-48 flex-none items-center justify-center rounded-pill text-gray-600 hover:bg-white/9 hover:text-white"
          >
            <IconeCadeado />
          </Link>
        </div>
      </div>
    </footer>
  );
}
