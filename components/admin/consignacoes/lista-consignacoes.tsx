import Link from "next/link";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import type { UsuarioAdmin } from "@/components/admin/admin-sidebar";
import { BuscaDesktop, BuscaMobile } from "@/components/admin/busca-lista";
import { ChipIndicacaoDesktop, ChipIndicacaoMobile, SeloCupom } from "@/components/admin/cupons/indicacao";
import { StatusLinha } from "@/components/admin/detalhe/interativos";
import { ListaVazia } from "@/components/admin/estados";
import { Paginacao } from "@/components/admin/paginacao";
import { FotoCountBadge, StatusBadge } from "@/components/ui/badges";
import { DarkChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { FORMA, nomeCarro, querReceber, STATUS_CONSIGNACOES, type Consignacao, type FormaVenda } from "@/lib/admin/consignacoes";
import { hrefLista, type FiltrosLista } from "@/lib/admin/filtros";
import { cn } from "@/lib/cn";
import { diaMes, hora, km, primeiroNome, telefone } from "@/lib/formato";
import { linkWhatsapp } from "@/lib/loja";
import type { Contadores } from "@/lib/navegacao";
import { STATUS_CONSIGNACAO, type StatusConsignacao } from "@/lib/status";

export const BASE_CONSIGNACOES = "/admin/consignacoes";
const BUSCA = "Buscar cliente ou carro";
export const OPCOES_STATUS_CONSIGNACAO = STATUS_CONSIGNACOES.map((s) => ({ valor: s, rotulo: STATUS_CONSIGNACAO[s].rotulo, tom: STATUS_CONSIGNACAO[s].tom }));

export const whatsappConsignacao = (c: Consignacao) =>
  linkWhatsapp(c.whatsapp, `Olá, ${primeiroNome(c.nome)}! Aqui é da Tô de Carro, sobre o ${nomeCarro(c)} que você ofereceu pelo catálogo.`);

export function hrefDetalheConsignacao(id: string, filtros: FiltrosLista<string>) {
  const lista = hrefLista(BASE_CONSIGNACOES, filtros, {});
  return `${BASE_CONSIGNACOES}/${id}${lista.includes("?") ? lista.slice(lista.indexOf("?")) : ""}`;
}

/** Etiqueta neutra da forma de venda (#F5F7FA, borda #D5DAE1, texto #3A4252, com ícone). */
export function EtiquetaForma({ forma, className }: { forma: FormaVenda; className?: string }) {
  const f = FORMA[forma];
  return (
    <span className={cn("inline-flex flex-none items-center gap-4 rounded-pill border border-gray-200 bg-gray-100 px-10 py-5 text-14 font-semibold whitespace-nowrap text-gray-700", className)}>
      <Icon name={f.icone} size={16} />
      {f.rotulo}
    </span>
  );
}

/** "Quitado" (verde) ou "Financiado" (amarelo). */
export function EtiquetaQuitado({ quitado }: { quitado: boolean }) {
  return (
    <span className={cn("inline-flex rounded-pill px-10 py-4 text-14 font-semibold whitespace-nowrap", quitado ? "bg-success-bg text-success" : "bg-warning-bg text-warning")}>
      {quitado ? "Quitado" : "Financiado"}
    </span>
  );
}

/** Miniatura com o contador de fotos (bucket privado: URL assinada). */
export function MiniaturaConsignacao({ c, className }: { c: Consignacao; className: string }) {
  return (
    <span className={cn("relative flex-none overflow-hidden bg-hatch-sm", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do bucket privado */}
      {c.capa && <img src={c.capa} alt="" className="absolute inset-0 size-full object-cover" />}
      {!c.capa && (
        <span className="absolute inset-0 flex items-center justify-center text-gray-400">
          <Icon name="image" />
        </span>
      )}
      {c.totalFotos > 0 && <FotoCountBadge total={c.totalFotos} className="absolute right-4 bottom-4 px-6 py-2" />}
    </span>
  );
}

/** Cartão da consignação no mobile (35). */
function CartaoConsignacao({ c, href }: { c: Consignacao; href: string }) {
  const st = STATUS_CONSIGNACAO[c.status];
  return (
    <article className="flex flex-col gap-12 rounded-16 border border-gray-150 bg-white p-16">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="truncate text-17 font-bold">{c.nome}</h2>
          <p className="flex flex-wrap items-center gap-x-8 gap-y-4 text-14 text-gray-500">
            <span>{diaMes(c.criadoEm)} · {hora(c.criadoEm)}</span>
            {c.indicacao && <SeloCupom codigo={c.indicacao.codigo} />}
          </p>
        </div>
        <StatusBadge tom={st.tom} size="xl">
          {st.rotulo}
        </StatusBadge>
      </div>
      <div>
        <EtiquetaForma forma={c.forma} />
        <p className="mt-8 truncate font-display text-22 leading-110 font-extrabold italic">{nomeCarro(c)}</p>
        {c.versao && <p className="truncate text-14 text-gray-500">{c.versao}</p>}
      </div>
      <div className="flex gap-12">
        <MiniaturaConsignacao c={c} className="h-75 w-100 rounded-10" />
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-8 gap-y-6 text-14">
          <div className="min-w-0">
            <dt className="text-gray-500">Ano</dt>
            <dd className="font-semibold tabular-nums">{c.ano}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gray-500">Km</dt>
            <dd className="font-semibold tabular-nums">{km(c.km)}</dd>
          </div>
          <div className="col-span-2 flex min-w-0 items-end justify-between gap-8">
            <div className="min-w-0">
              <dt className="text-gray-500">Quer receber</dt>
              <dd className={cn("font-semibold whitespace-nowrap tabular-nums", !c.valorPretendido && "text-gray-500")}>{querReceber(c)}</dd>
            </div>
            <dd>
              <EtiquetaQuitado quitado={c.quitado} />
            </dd>
          </div>
        </dl>
      </div>
      <div className="flex gap-8">
        <Link href={href} className="pressable box-content flex h-48 flex-1 items-center justify-center rounded-12 border border-gray-200 text-15 font-semibold hover:bg-gray-100">
          Ver detalhes
        </Link>
        <a
          href={whatsappConsignacao(c)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chamar ${c.nome} no WhatsApp`}
          className="pressable flex size-48 flex-none items-center justify-center rounded-12 bg-whatsapp text-white hover:bg-whatsapp-dark"
        >
          <Icon name="chat" size={22} fill />
        </a>
      </div>
    </article>
  );
}

/**
 * Colunas da tabela (38). Status com 156px: cabe a pílula mais longa ("Negócio fechado", 153px).
 * A coluna Carro fica com a maior fração, para o modelo aparecer inteiro.
 */
const COLUNAS = "grid grid-cols-[72px_1.2fr_132px_1.8fr_80px_88px_1fr_76px_156px_40px] items-center gap-10 px-20";

/** Tabela do desktop (38), com o status alterável na linha. A linha abre o painel do detalhe (39). */
function TabelaConsignacoes({ linhas, filtros, rodape }: { linhas: Consignacao[]; filtros: FiltrosLista<StatusConsignacao>; rodape: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-16 border border-gray-150 bg-white">
      <div role="table" aria-label="Consignações" className="min-w-[1100px]">
        <div role="row" className={cn(COLUNAS, "h-45 border-b border-gray-150 bg-gray-25 text-14 font-semibold tracking-[0.06em] text-gray-500")}>
          <span role="columnheader">DATA</span>
          <span role="columnheader">CLIENTE</span>
          <span role="columnheader">FORMA</span>
          <span role="columnheader">CARRO</span>
          <span role="columnheader">ANO</span>
          <span role="columnheader">KM</span>
          <span role="columnheader">QUER RECEBER</span>
          <span role="columnheader">QUITADO</span>
          <span role="columnheader">STATUS</span>
          <span role="columnheader">
            <span className="sr-only">WhatsApp</span>
          </span>
        </div>
        {linhas.map((c) => (
          <div key={c.id} role="row" className={cn(COLUNAS, "relative h-81 border-b border-gray-120 text-15 tabular-nums hover:bg-brand-row")}>
            <div role="cell">
              <p className="font-semibold">{diaMes(c.criadoEm)}</p>
              <p className="text-14 text-gray-500">{hora(c.criadoEm)}</p>
            </div>
            <div role="cell" className="min-w-0">
              <Link href={hrefDetalheConsignacao(c.id, filtros)} scroll={false} className="block truncate font-semibold before:absolute before:inset-0">
                {c.nome}
              </Link>
              <p className="truncate text-14 text-gray-500">{telefone(c.whatsapp)}</p>
            {c.indicacao && <SeloCupom codigo={c.indicacao.codigo} />}
            </div>
            <span role="cell">
              <EtiquetaForma forma={c.forma} />
            </span>
            <div role="cell" className="flex min-w-0 items-center gap-10">
              <MiniaturaConsignacao c={c} className="h-42 w-56 rounded-8 [&>span:last-child]:hidden" />
              {/* Modelo inteiro na 1ª linha; marca e versão na 2ª (pode cortar). */}
              <div className="min-w-0" title={[c.marca, c.modelo, c.versao].filter(Boolean).join(" ")}>
                <p className="font-semibold break-words">{c.modelo}</p>
                <p className="truncate text-14 text-gray-500">{[c.marca, c.versao].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <span role="cell">{c.ano}</span>
            <span role="cell" className="whitespace-nowrap">
              {km(c.km)}
            </span>
            <span role="cell" className={cn("whitespace-nowrap", !c.valorPretendido && "text-gray-500")}>
              {querReceber(c)}
            </span>
            <span role="cell">{c.quitado ? "Sim" : "Não"}</span>
            <span role="cell" className="relative z-1">
              <StatusLinha lista="consignacoes" id={c.id} atual={c.status} opcoes={OPCOES_STATUS_CONSIGNACAO} rotuloItem={c.nome} />
            </span>
            <span role="cell" className="relative z-1">
              <a
                href={whatsappConsignacao(c)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chamar ${c.nome} no WhatsApp`}
                className="pressable flex size-40 items-center justify-center rounded-pill bg-whatsapp text-white hover:bg-whatsapp-dark"
              >
                <Icon name="chat" size={20} fill />
              </a>
            </span>
          </div>
        ))}
        {rodape}
      </div>
    </div>
  );
}

/** Lista de consignações (35 mobile, 38 desktop); por baixo do painel do detalhe no desktop (39). */
export function ListaConsignacoes({
  dados,
  filtros,
  usuario,
  contadores,
  soDesktop,
}: {
  dados: { comIndicacao: number; linhas: Consignacao[]; total: number; contagens: Record<StatusConsignacao | "todos", number> };
  filtros: FiltrosLista<StatusConsignacao>;
  usuario: UsuarioAdmin;
  contadores: Contadores;
  soDesktop?: boolean;
}) {
  const { linhas, total, contagens, comIndicacao } = dados;
  const abas = [
    { href: hrefLista(BASE_CONSIGNACOES, filtros, { status: null }), rotulo: "Todas", count: contagens.todos, selected: !filtros.status },
    ...STATUS_CONSIGNACOES.map((s) => ({
      href: hrefLista(BASE_CONSIGNACOES, filtros, { status: s }),
      rotulo: STATUS_CONSIGNACAO[s].rotulo,
      count: contagens[s],
      selected: filtros.status === s,
    })),
  ];
  const filtrado = !!(filtros.q || filtros.status || filtros.indicacao);
  const vazio = (
    <ListaVazia
      icone="handshake"
      titulo={filtrado ? "Nenhuma consignação encontrada" : "Nenhuma consignação ainda"}
      texto={filtrado ? "Tente outra busca ou outro status." : "Os carros oferecidos em “Venda seu carro” aparecem aqui."}
    />
  );
  const novas = contadores.consignacoes;
  const paginacao = total > linhas.length ? <Paginacao base={BASE_CONSIGNACOES} filtros={filtros} total={total} /> : null;

  return (
    <>
      {!soDesktop && (
        <>
          <AdminMobileHeader
            title="Consignações"
            badge={novas ? `${novas} ${novas === 1 ? "nova" : "novas"}` : undefined}
            badgeDestaque
            action={<BuscaMobile inicial={filtros.q} status={filtros.status} placeholder={BUSCA} />}
            usuario={usuario}
            className="relative lg:hidden"
          >
            {abas.map((a) => (
              <DarkChipLink key={a.rotulo} href={a.href} selected={a.selected} count={a.count} scroll={false}>
                {a.rotulo}
              </DarkChipLink>
            ))}
            <ChipIndicacaoMobile base={BASE_CONSIGNACOES} filtros={filtros} total={comIndicacao} />
          </AdminMobileHeader>
          <div className="flex flex-1 flex-col gap-12 px-16 pt-16 pb-8 lg:hidden">
            {linhas.length ? linhas.map((c) => <CartaoConsignacao key={c.id} c={c} href={hrefDetalheConsignacao(c.id, filtros)} />) : vazio}
            {total > linhas.length && <Paginacao base={BASE_CONSIGNACOES} filtros={filtros} total={total} className="px-4" />}
          </div>
          <AdminDock contadores={contadores} />
        </>
      )}

      <div className="hidden flex-col gap-20 px-40 py-32 lg:flex">
        <div>
          <h1 className="text-28 font-bold">Consignações</h1>
          <p className="mt-4 text-15 text-gray-600">Carros oferecidos pelos clientes em “Venda seu carro”</p>
        </div>
        <div className="flex flex-wrap items-center gap-12">
          <BuscaDesktop inicial={filtros.q} status={filtros.status} placeholder={BUSCA} largura="w-320" />
          <SegmentedTabs items={abas} label="Status" />
          <ChipIndicacaoDesktop base={BASE_CONSIGNACOES} filtros={filtros} total={comIndicacao} />
        </div>
        {linhas.length ? <TabelaConsignacoes linhas={linhas} filtros={filtros} rodape={paginacao} /> : vazio}
      </div>
    </>
  );
}
