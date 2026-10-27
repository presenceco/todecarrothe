import Image from "next/image";
import Link from "next/link";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import type { UsuarioAdmin } from "@/components/admin/admin-sidebar";
import { BuscaDesktop, BuscaMobile } from "@/components/admin/busca-lista";
import { ListaVazia } from "@/components/admin/estados";
import { Paginacao } from "@/components/admin/paginacao";
import { StatusBadge } from "@/components/ui/badges";
import { DarkChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { hrefLista, type FiltrosLista } from "@/lib/admin/filtros";
import { STATUS_SIMULACOES, type Simulacao } from "@/lib/admin/simulacoes";
import { cn } from "@/lib/cn";
import { diaMes, hora, moeda, primeiroNome, telefone } from "@/lib/formato";
import { urlAssinada } from "@/lib/fotos-veiculo";
import { linkWhatsapp } from "@/lib/loja";
import type { Contadores } from "@/lib/navegacao";
import { STATUS_SIMULACAO, type StatusSimulacao } from "@/lib/status";

export const BASE_SIMULACOES = "/admin/simulacoes";
const BUSCA = "Buscar cliente ou veículo";
export const OPCOES_STATUS_SIMULACAO = STATUS_SIMULACOES.map((s) => ({ valor: s, rotulo: STATUS_SIMULACAO[s].rotulo, tom: STATUS_SIMULACAO[s].tom }));

export const whatsappSimulacao = (s: Simulacao) =>
  linkWhatsapp(s.whatsapp, `Olá, ${primeiroNome(s.nome)}! Aqui é da Tô de Carro, sobre a sua simulação de financiamento${s.veiculo ? ` do ${s.veiculo.nome}` : ""}.`);

export function hrefDetalheSimulacao(id: string, filtros: FiltrosLista<string>) {
  const lista = hrefLista(BASE_SIMULACOES, filtros, {});
  return `${BASE_SIMULACOES}/${id}${lista.includes("?") ? lista.slice(lista.indexOf("?")) : ""}`;
}

/** Miniatura do veículo da simulação; sem veículo escolhido, o ícone da calculadora. */
export function FotoSimulacao({ s, className, sizes }: { s: Simulacao; className: string; sizes: string }) {
  if (!s.veiculo) {
    return (
      <span className={cn("flex flex-none items-center justify-center bg-brand-100 text-brand", className)}>
        <Icon name="calculate" />
      </span>
    );
  }
  return (
    <span className={cn("relative flex-none overflow-hidden bg-hatch-sm", className)}>
      {s.veiculo.capa && <Image src={s.veiculo.capa} alt="" fill sizes={sizes} unoptimized={urlAssinada(s.veiculo.capa)} className="object-cover" />}
    </span>
  );
}

/** Cartão da simulação no mobile (18). */
function CartaoSimulacao({ s, href }: { s: Simulacao; href: string }) {
  const st = STATUS_SIMULACAO[s.status];
  return (
    <article className="flex flex-col gap-12 rounded-16 border border-gray-150 bg-white p-16">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="truncate text-17 font-bold">{s.nome}</h2>
          <p className="text-14 text-gray-500">
            {diaMes(s.criadoEm)} · {hora(s.criadoEm)}
          </p>
        </div>
        <StatusBadge tom={st.tom} size="xl">
          {st.rotulo}
        </StatusBadge>
      </div>
      <div className="flex items-center gap-12">
        <FotoSimulacao s={s} className="h-48 w-64 rounded-8" sizes="64px" />
        <p className="min-w-0 flex-1 truncate text-15 font-semibold">{s.veiculo ? (s.veiculo.marcaModelo ?? s.veiculo.nome) : "Sem veículo escolhido"}</p>
        <p className="text-16 font-extrabold whitespace-nowrap tabular-nums">{moeda(s.veiculo?.preco ?? s.valorAproximado ?? 0)}</p>
      </div>
      <dl className="grid grid-cols-[repeat(3,1fr)] gap-8 rounded-12 bg-gray-100 px-12 py-10 text-14">
        <div className="min-w-0">
          <dt className="text-gray-500">Entrada</dt>
          <dd className="font-semibold tabular-nums">{moeda(s.entrada)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">Prazo</dt>
          <dd className="font-semibold">{s.prazo} meses</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">Renda</dt>
          <dd className="font-semibold tabular-nums">{s.renda !== null ? moeda(s.renda) : "Apagada"}</dd>
        </div>
      </dl>
      <div className="flex gap-8">
        <Link href={href} className="pressable box-content flex h-48 flex-1 items-center justify-center rounded-12 border border-gray-200 text-15 font-semibold hover:bg-gray-100">
          Ver detalhes
        </Link>
        <a
          href={whatsappSimulacao(s)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chamar ${s.nome} no WhatsApp`}
          className="pressable flex size-48 flex-none items-center justify-center rounded-12 bg-whatsapp text-white hover:bg-whatsapp-dark"
        >
          <Icon name="chat" size={22} fill />
        </a>
      </div>
    </article>
  );
}

const COLUNAS = "grid grid-cols-[90px_1.4fr_2.2fr_1fr_100px_1fr_130px_24px] items-center gap-12 px-20";

/** Tabela do desktop (31). O status muda só no detalhe: a linha tem a seta e abre o painel (32). */
function TabelaSimulacoes({ linhas, filtros, rodape }: { linhas: Simulacao[]; filtros: FiltrosLista<StatusSimulacao>; rodape: React.ReactNode }) {
  return (
    <div role="table" aria-label="Simulações" className="rounded-16 border border-gray-150 bg-white">
      <div role="row" className={cn(COLUNAS, "h-45 rounded-t-16 border-b border-gray-150 bg-gray-25 text-14 font-semibold tracking-[0.06em] text-gray-500")}>
        <span role="columnheader">DATA</span>
        <span role="columnheader">CLIENTE</span>
        <span role="columnheader">VEÍCULO DE INTERESSE</span>
        <span role="columnheader">ENTRADA</span>
        <span role="columnheader">PRAZO</span>
        <span role="columnheader">RENDA</span>
        <span role="columnheader">STATUS</span>
        <span role="columnheader" />
      </div>
      {linhas.map((s) => {
        const st = STATUS_SIMULACAO[s.status];
        return (
          <div key={s.id} role="row" className={cn(COLUNAS, "relative h-81 border-b border-gray-120 text-15 tabular-nums hover:bg-brand-row")}>
            <div role="cell">
              <p className="font-semibold">{diaMes(s.criadoEm)}</p>
              <p className="text-14 text-gray-500">{hora(s.criadoEm)}</p>
            </div>
            <div role="cell" className="min-w-0">
              <Link href={hrefDetalheSimulacao(s.id, filtros)} scroll={false} className="block truncate font-semibold before:absolute before:inset-0">
                {s.nome}
              </Link>
              <p className="truncate text-14 text-gray-500">{telefone(s.whatsapp)}</p>
            </div>
            <div role="cell" className="flex min-w-0 items-center gap-12">
              <FotoSimulacao s={s} className="h-48 w-64 rounded-8" sizes="64px" />
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold">{s.veiculo?.nome ?? "Sem veículo escolhido"}</p>
                <p className="text-14 text-gray-500">{s.veiculo ? moeda(s.veiculo.preco) : `Valor aprox. ${moeda(s.valorAproximado ?? 0)}`}</p>
              </div>
            </div>
            <span role="cell">{moeda(s.entrada)}</span>
            <span role="cell">{s.prazo} meses</span>
            <span role="cell" className={s.renda === null ? "text-gray-500" : undefined}>{s.renda !== null ? moeda(s.renda) : "Apagada"}</span>
            <span role="cell">
              <StatusBadge tom={st.tom} size="lg">
                {st.rotulo}
              </StatusBadge>
            </span>
            <span role="cell" aria-hidden="true">
              <Icon name="chevron_right" size={20} className="text-gray-400" />
            </span>
          </div>
        );
      })}
      {rodape}
    </div>
  );
}

/** Lista de simulações (18 mobile, 31 desktop); por baixo do painel do detalhe no desktop (32). */
export function ListaSimulacoes({
  dados,
  filtros,
  usuario,
  contadores,
  soDesktop,
}: {
  dados: { linhas: Simulacao[]; total: number; contagens: Record<StatusSimulacao | "todos", number> };
  filtros: FiltrosLista<StatusSimulacao>;
  usuario: UsuarioAdmin;
  contadores: Contadores;
  soDesktop?: boolean;
}) {
  const { linhas, total, contagens } = dados;
  const abas = [
    { href: hrefLista(BASE_SIMULACOES, filtros, { status: null }), rotulo: "Todas", count: contagens.todos, selected: !filtros.status },
    ...STATUS_SIMULACOES.map((s) => ({ href: hrefLista(BASE_SIMULACOES, filtros, { status: s }), rotulo: STATUS_SIMULACAO[s].rotulo, count: contagens[s], selected: filtros.status === s })),
  ];
  const filtrado = !!(filtros.q || filtros.status);
  const vazio = (
    <ListaVazia
      icone="request_quote"
      titulo={filtrado ? "Nenhuma simulação encontrada" : "Nenhuma simulação ainda"}
      texto={filtrado ? "Tente outra busca ou outro status." : "As simulações enviadas pelo catálogo aparecem aqui."}
    />
  );
  const novas = contadores.simulacoes;
  const paginacao = total > linhas.length ? <Paginacao base={BASE_SIMULACOES} filtros={filtros} total={total} /> : null;

  return (
    <>
      {!soDesktop && (
        <>
          <AdminMobileHeader
            title="Simulações"
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
          </AdminMobileHeader>
          <div className="flex flex-1 flex-col gap-12 px-16 pt-16 pb-8 lg:hidden">
            {linhas.length ? linhas.map((s) => <CartaoSimulacao key={s.id} s={s} href={hrefDetalheSimulacao(s.id, filtros)} />) : vazio}
            {total > linhas.length && <Paginacao base={BASE_SIMULACOES} filtros={filtros} total={total} className="px-4" />}
          </div>
          <AdminDock contadores={contadores} />
        </>
      )}

      <div className="hidden flex-col gap-20 px-40 py-32 lg:flex">
        <div>
          <h1 className="text-28 font-bold">Simulações</h1>
          <p className="mt-4 text-15 text-gray-600">Pedidos de financiamento enviados pelo catálogo</p>
        </div>
        <div className="flex items-center gap-12">
          <BuscaDesktop inicial={filtros.q} status={filtros.status} placeholder={BUSCA} largura="w-320" />
          <SegmentedTabs items={abas} label="Status" />
        </div>
        {linhas.length ? <TabelaSimulacoes linhas={linhas} filtros={filtros} rodape={paginacao} /> : vazio}
      </div>
    </>
  );
}
