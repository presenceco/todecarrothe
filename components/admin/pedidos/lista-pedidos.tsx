import Link from "next/link";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import type { UsuarioAdmin } from "@/components/admin/admin-sidebar";
import { BuscaDesktop, BuscaMobile } from "@/components/admin/busca-lista";
import { ChipIndicacaoDesktop, ChipIndicacaoMobile, SeloCupom } from "@/components/admin/cupons/indicacao";
import { StatusLinha } from "@/components/admin/detalhe/interativos";
import { ListaVazia } from "@/components/admin/estados";
import { Paginacao } from "@/components/admin/paginacao";
import { StatusBadge } from "@/components/ui/badges";
import { DarkChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { hrefLista, type FiltrosLista } from "@/lib/admin/filtros";
import { rotuloFaixa, rotuloFaixaCurta, rotuloPagamento, STATUS_PEDIDOS, type Pedido } from "@/lib/admin/pedidos";
import { cn } from "@/lib/cn";
import { diaMes, hora, primeiroNome, telefone } from "@/lib/formato";
import { linkWhatsapp } from "@/lib/loja";
import type { Contadores } from "@/lib/navegacao";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/status";

export const BASE_PEDIDOS = "/admin/pedidos";
const BUSCA = "Buscar cliente ou carro";
export const OPCOES_STATUS_PEDIDO = STATUS_PEDIDOS.map((s) => ({ valor: s, rotulo: STATUS_PEDIDO[s].rotulo, tom: STATUS_PEDIDO[s].tom }));

export const whatsappPedido = (p: Pedido) => linkWhatsapp(p.whatsapp, `Olá, ${primeiroNome(p.nome)}! Aqui é da Tô de Carro, sobre o seu pedido de busca do ${p.marcaModelo}.`);

/** Endereço do detalhe mantendo os filtros da lista (o painel fecha de volta para a mesma lista). */
function hrefDetalhe(id: string, filtros: FiltrosLista<string>) {
  const lista = hrefLista(BASE_PEDIDOS, filtros, {});
  const consulta = lista.includes("?") ? lista.slice(lista.indexOf("?")) : "";
  return `${BASE_PEDIDOS}/${id}${consulta}`;
}

/** Cartão do pedido no mobile (16). */
function CartaoPedido({ p, href }: { p: Pedido; href: string }) {
  const st = STATUS_PEDIDO[p.status];
  return (
    <article className="flex flex-col gap-12 rounded-16 border border-gray-150 bg-white p-16">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h2 className="truncate text-17 font-bold">{p.nome}</h2>
          <p className="flex flex-wrap items-center gap-x-8 gap-y-4 text-14 text-gray-500">
            <span>{diaMes(p.criadoEm)} · {hora(p.criadoEm)}</span>
            {p.indicacao && <SeloCupom codigo={p.indicacao.codigo} />}
          </p>
        </div>
        <StatusBadge tom={st.tom} size="xl">
          {st.rotulo}
        </StatusBadge>
      </div>
      <div className="flex items-center justify-between gap-8">
        <p className="min-w-0 truncate font-display text-22 leading-110 font-extrabold italic">{p.marcaModelo}</p>
        {p.temTroca && (
          <span className="inline-flex flex-none items-center gap-4 rounded-pill border border-gray-200 px-10 py-5 text-14 font-semibold whitespace-nowrap text-gray-700">
            <Icon name="swap_horiz" size={16} />
            Tem troca
          </span>
        )}
      </div>
      <dl className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-8 rounded-12 bg-gray-100 px-12 py-10 text-14">
        <div className="min-w-0">
          <dt className="text-gray-500">Ano mín.</dt>
          <dd className="font-semibold whitespace-nowrap">{p.anoMinimo}+</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">Faixa de preço</dt>
          <dd className="font-semibold whitespace-nowrap tabular-nums">{rotuloFaixaCurta(p.faixa)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-gray-500">Pagamento</dt>
          <dd className="font-semibold whitespace-nowrap">{rotuloPagamento(p.pagamento)}</dd>
        </div>
      </dl>
      <div className="flex gap-8">
        <Link href={href} className="pressable box-content flex h-48 flex-1 items-center justify-center rounded-12 border border-gray-200 text-15 font-semibold hover:bg-gray-100">
          Ver detalhes
        </Link>
        <a
          href={whatsappPedido(p)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chamar ${p.nome} no WhatsApp`}
          className="pressable flex size-48 flex-none items-center justify-center rounded-12 bg-whatsapp text-white hover:bg-whatsapp-dark"
        >
          <Icon name="chat" size={22} fill />
        </a>
      </div>
    </article>
  );
}

const COLUNAS = "grid grid-cols-[90px_1.5fr_1.3fr_80px_1.2fr_110px_70px_150px_48px] items-center gap-12 px-20";

/** Tabela de pedidos do desktop (29), com o status alterável na linha. A linha abre o detalhe (30). */
function TabelaPedidos({ linhas, filtros, rodape }: { linhas: Pedido[]; filtros: FiltrosLista<StatusPedido>; rodape: React.ReactNode }) {
  return (
    <div role="table" aria-label="Pedidos de busca" className="rounded-16 border border-gray-150 bg-white">
      <div role="row" className={cn(COLUNAS, "h-45 rounded-t-16 border-b border-gray-150 bg-gray-25 text-14 font-semibold tracking-[0.06em] text-gray-500")}>
        <span role="columnheader">DATA</span>
        <span role="columnheader">CLIENTE</span>
        <span role="columnheader">CARRO DESEJADO</span>
        <span role="columnheader">ANO MÍN.</span>
        <span role="columnheader">FAIXA DE PREÇO</span>
        <span role="columnheader">PAGAMENTO</span>
        <span role="columnheader">TROCA</span>
        <span role="columnheader">STATUS</span>
        <span role="columnheader">
          <span className="sr-only">WhatsApp</span>
        </span>
      </div>
      {linhas.map((p) => (
        <div key={p.id} role="row" className={cn(COLUNAS, "relative h-77 border-b border-gray-120 text-15 tabular-nums hover:bg-brand-row")}>
          <div role="cell">
            <p className="font-semibold">{diaMes(p.criadoEm)}</p>
            <p className="text-14 text-gray-500">{hora(p.criadoEm)}</p>
          </div>
          <div role="cell" className="min-w-0">
            <Link href={hrefDetalhe(p.id, filtros)} scroll={false} className="block truncate font-semibold before:absolute before:inset-0">
              {p.nome}
            </Link>
            <p className="truncate text-14 text-gray-500">{telefone(p.whatsapp)}</p>
            {p.indicacao && <SeloCupom codigo={p.indicacao.codigo} />}
          </div>
          <span role="cell" className="truncate font-semibold">
            {p.marcaModelo}
          </span>
          <span role="cell">{p.anoMinimo}</span>
          <span role="cell" className="whitespace-nowrap">
            {rotuloFaixa(p.faixa)}
          </span>
          <span role="cell">{rotuloPagamento(p.pagamento)}</span>
          <span role="cell">{p.temTroca ? "Sim" : "Não"}</span>
          <span role="cell" className="relative z-1">
            <StatusLinha lista="pedidos" id={p.id} atual={p.status} opcoes={OPCOES_STATUS_PEDIDO} rotuloItem={p.nome} />
          </span>
          <span role="cell" className="relative z-1">
            <a
              href={whatsappPedido(p)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chamar ${p.nome} no WhatsApp`}
              className="pressable flex size-40 items-center justify-center rounded-pill bg-whatsapp text-white hover:bg-whatsapp-dark"
            >
              <Icon name="chat" size={20} fill />
            </a>
          </span>
        </div>
      ))}
      {rodape}
    </div>
  );
}

/**
 * Lista de pedidos (16 mobile, 29 desktop). Também fica por baixo do painel do detalhe no desktop (30);
 * nesse caso `soDesktop` esconde a versão mobile, que mostra o detalhe em página cheia.
 */
export function ListaPedidos({
  dados,
  filtros,
  usuario,
  contadores,
  soDesktop,
}: {
  dados: { comIndicacao: number; linhas: Pedido[]; total: number; contagens: Record<StatusPedido | "todos", number> };
  filtros: FiltrosLista<StatusPedido>;
  usuario: UsuarioAdmin;
  contadores: Contadores;
  soDesktop?: boolean;
}) {
  const { linhas, total, contagens, comIndicacao } = dados;
  const abas = [
    { href: hrefLista(BASE_PEDIDOS, filtros, { status: null }), rotulo: "Todos", count: contagens.todos, selected: !filtros.status },
    ...STATUS_PEDIDOS.map((s) => ({ href: hrefLista(BASE_PEDIDOS, filtros, { status: s }), rotulo: STATUS_PEDIDO[s].rotulo, count: contagens[s], selected: filtros.status === s })),
  ];
  const filtrado = !!(filtros.q || filtros.status || filtros.indicacao);
  const vazio = (
    <ListaVazia
      icone="travel_explore"
      titulo={filtrado ? "Nenhum pedido encontrado" : "Nenhum pedido ainda"}
      texto={filtrado ? "Tente outra busca ou outro status." : "Os pedidos do formulário “Não encontrou seu carro?” aparecem aqui."}
    />
  );
  const novos = contadores.pedidos;

  return (
    <>
      {!soDesktop && (
        <>
          <AdminMobileHeader
            title="Pedidos"
            badge={novos ? `${novos} ${novos === 1 ? "novo" : "novos"}` : undefined}
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
            <ChipIndicacaoMobile base={BASE_PEDIDOS} filtros={filtros} total={comIndicacao} />
          </AdminMobileHeader>
          <div className="flex flex-1 flex-col gap-12 px-16 pt-16 pb-8 lg:hidden">
            {linhas.length ? linhas.map((p) => <CartaoPedido key={p.id} p={p} href={hrefDetalhe(p.id, filtros)} />) : vazio}
            {total > linhas.length && <Paginacao base={BASE_PEDIDOS} filtros={filtros} total={total} className="px-4" />}
          </div>
          <AdminDock contadores={contadores} />
        </>
      )}

      <div className="hidden flex-col gap-20 px-40 py-32 lg:flex">
        <div>
          <h1 className="text-28 font-bold">Pedidos</h1>
          <p className="mt-4 text-15 text-gray-600">Solicitações do formulário “Não encontrou seu carro?”</p>
        </div>
        <div className="flex flex-wrap items-center gap-12">
          <BuscaDesktop inicial={filtros.q} status={filtros.status} placeholder={BUSCA} largura="w-320" />
          <SegmentedTabs items={abas} label="Status" />
          <ChipIndicacaoDesktop base={BASE_PEDIDOS} filtros={filtros} total={comIndicacao} />
        </div>
        {linhas.length ? <TabelaPedidos linhas={linhas} filtros={filtros} rodape={total > linhas.length ? <Paginacao base={BASE_PEDIDOS} filtros={filtros} total={total} /> : null} /> : vazio}
      </div>
    </>
  );
}
