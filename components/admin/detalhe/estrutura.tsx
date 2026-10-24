import Link from "next/link";
import { SidePanel } from "@/components/ui/side-panel";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type ItemDetalhe = { rotulo: string; valor: React.ReactNode; largo?: boolean };

const TITULO_SECAO = "text-14 font-semibold tracking-[0.08em] text-gray-500 uppercase";

/** Seção do detalhe no mobile (17): cartão com título em caixa alta e pares rótulo/valor em 2 colunas. */
export function SecaoMobile({ titulo, itens, children, className }: { titulo: string; itens?: ItemDetalhe[]; children?: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-16 border border-gray-150 bg-white p-16", className)}>
      <h2 className={cn(TITULO_SECAO, "mb-12")}>{titulo}</h2>
      {itens && (
        <dl className="grid grid-cols-2 gap-x-16 gap-y-14">
          {itens.map((i) => (
            <div key={i.rotulo} className={cn("min-w-0", i.largo && "col-span-2")}>
              <dt className="text-14 text-gray-500">{i.rotulo}</dt>
              <dd className="mt-2 text-16 font-semibold break-words tabular-nums">{i.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

/** Seção do detalhe no painel lateral do desktop (30): título e pares em 2 colunas (gap 12px 20px). */
export function SecaoPainel({ titulo, itens, children }: { titulo: string; itens?: ItemDetalhe[]; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className={cn(TITULO_SECAO, "mb-10")}>{titulo}</h2>
      {itens && (
        <dl className="grid grid-cols-2 gap-x-20 gap-y-12">
          {itens.map((i) => (
            <div key={i.rotulo} className={cn("min-w-0", i.largo && "col-span-2")}>
              <dt className="text-14 text-gray-500">{i.rotulo}</dt>
              <dd className="mt-2 text-15 font-semibold break-words tabular-nums">{i.valor}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

/** "Chamar no WhatsApp": verde, ícone de conversa preenchido. */
/** Fotos enviadas pelo cliente (bucket privado; cada uma abre em tamanho real numa aba nova). */
export function FotosEnviadas({ fotos, colunas }: { fotos: string[]; colunas: string }) {
  if (!fotos.length) return <p className="text-15 text-gray-500">O cliente não enviou fotos.</p>;
  return (
    <ul className={cn("grid gap-8", colunas)}>
      {fotos.map((url, i) => (
        <li key={url}>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir foto ${i + 1} de ${fotos.length}`} className="block overflow-hidden rounded-10 bg-hatch-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do bucket privado */}
            <img src={url} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-200 ease-out hover:scale-103" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function BotaoWhatsapp({ href, variante }: { href: string; variante: "rodape" | "painel" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "pressable flex h-52 items-center justify-center bg-whatsapp text-15 font-bold whitespace-nowrap text-white hover:bg-whatsapp-dark",
        variante === "rodape" ? "gap-6 rounded-14" : "gap-8 rounded-12",
      )}
    >
      <Icon name="chat" size={20} fill />
      Chamar no WhatsApp
    </a>
  );
}

/**
 * Detalhe no mobile (17/19/36): barra preta com voltar, nome em Exo 30px, data e o status com um toque;
 * seções em cartões e rodapé fixo com "Copiar dados" e "Chamar no WhatsApp".
 */
export function DetalheMobile({
  voltarPara,
  tituloBarra,
  nome,
  subtitulo,
  status,
  rodape,
  children,
}: {
  voltarPara: string;
  tituloBarra: string;
  nome: string;
  subtitulo: string;
  status: React.ReactNode;
  rodape: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:hidden">
      <div className="box-content flex h-60 items-center gap-4 bg-black px-4 pt-[env(safe-area-inset-top,0px)] text-white">
        <Link href={voltarPara} aria-label="Voltar para a lista" className="pressable flex size-48 items-center justify-center rounded-12">
          <Icon name="arrow_back" />
        </Link>
        <p className="text-17 font-semibold">{tituloBarra}</p>
      </div>
      <div className="bg-black px-16 pt-4 pb-20 text-white">
        <h1 className="font-display text-30 leading-110 font-extrabold break-words italic">{nome}</h1>
        <p className="mt-4 text-14 text-gray-350">{subtitulo}</p>
        <div className="mt-16">{status}</div>
      </div>
      <div className="flex flex-col gap-12 p-16">{children}</div>
      <div className="h-20" />
      <div className="sticky bottom-0 z-20 mt-auto grid grid-cols-[1fr_1.5fr] gap-8 border-t border-gray-150 bg-white px-16 pt-12 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-footer">
        {rodape}
      </div>
    </div>
  );
}

/** Detalhe no desktop (30/32/39): painel lateral de 540px sobre a lista, que continua por baixo. */
export function DetalhePainel({
  fecharPara,
  subtitulo,
  nome,
  status,
  rodape,
  children,
  compacto,
}: {
  compacto?: boolean;
  fecharPara: string;
  subtitulo: string;
  nome: string;
  status: React.ReactNode;
  rodape: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidePanel
      titleId="titulo-detalhe"
      closeHref={fecharPara}
      className="hidden lg:block"
      closeVariant={compacto ? "bordered-md" : "bordered-lg"}
      header={
        <>
          <p className="text-14 font-medium text-gray-500">{subtitulo}</p>
          <h2 id="titulo-detalhe" className="mt-4 truncate text-26 font-bold">
            {nome}
          </h2>
          <div className="mt-16">{status}</div>
        </>
      }
      footer={<div className="grid grid-cols-[1fr_1.3fr] gap-10">{rodape}</div>}
    >
      {children}
    </SidePanel>
  );
}
