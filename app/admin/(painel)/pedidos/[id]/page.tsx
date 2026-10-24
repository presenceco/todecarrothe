import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetalheMobile, DetalhePainel, FotosEnviadas, SecaoMobile, SecaoPainel, BotaoWhatsapp, type ItemDetalhe } from "@/components/admin/detalhe/estrutura";
import { Anotacoes, BotaoCopiar, StatusEscolha } from "@/components/admin/detalhe/interativos";
import { PaginaCarregando } from "@/components/admin/estados";
import { BASE_PEDIDOS, ListaPedidos, OPCOES_STATUS_PEDIDO, whatsappPedido } from "@/components/admin/pedidos/lista-pedidos";
import { hrefLista, lerFiltrosLista } from "@/lib/admin/filtros";
import { listarPedidos, obterPedido, rotuloFaixa, rotuloPagamento, STATUS_PEDIDOS, textoPedido } from "@/lib/admin/pedidos";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";
import { dataHora, moeda, telefone } from "@/lib/formato";

export const metadata: Metadata = { title: "Pedido de busca" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLACEHOLDER = "Escreva aqui o andamento da busca…";

async function Detalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const filtros = lerFiltrosLista(sp, STATUS_PEDIDOS);
  const { usuario } = await exigirAdmin();
  if (!UUID.test(id)) notFound();
  const [p, dados, contadores] = await Promise.all([obterPedido(id), listarPedidos(filtros), contarNovos()]);
  if (!p) notFound();

  const voltar = hrefLista(BASE_PEDIDOS, filtros, {});
  const recebido = `Pedido recebido em ${dataHora(p.criadoEm)}`;
  const contato: ItemDetalhe[] = [
    { rotulo: "Nome", valor: p.nome, largo: true },
    { rotulo: "WhatsApp", valor: telefone(p.whatsapp), largo: true },
  ];
  const carro: ItemDetalhe[] = [
    { rotulo: "Marca / modelo", valor: p.marcaModelo, largo: true },
    { rotulo: "Ano mínimo", valor: p.anoMinimo },
    { rotulo: "Faixa de preço", valor: rotuloFaixa(p.faixa) },
    { rotulo: "Forma de pagamento", valor: rotuloPagamento(p.pagamento), largo: p.pagamento !== "financiado" },
    // Financiado: quantidade de parcelas, entrada e valor de parcela que o cliente busca (opcionais).
    ...(p.pagamento === "financiado"
      ? [
          { rotulo: "Parcelas", valor: p.prazo ? `${p.prazo}x` : "Não informado" },
          { rotulo: "Entrada", valor: p.entrada ? moeda(p.entrada) : "Não informada" },
          { rotulo: "Valor da parcela", valor: p.parcela ? moeda(p.parcela) : "Não informado" },
        ]
      : []),
  ];
  const troca: ItemDetalhe[] = p.temTroca
    ? [
        { rotulo: "Tem carro para dar de entrada", valor: "Sim", largo: true },
        { rotulo: "Modelo", valor: p.trocaModelo ?? "—" },
        { rotulo: "Ano", valor: p.trocaAno ?? "—" },
      ]
    : [{ rotulo: "Tem carro para dar de entrada", valor: "Não", largo: true }];
  const status = (variante: "escuro" | "claro") => <StatusEscolha lista="pedidos" id={p.id} atual={p.status} opcoes={OPCOES_STATUS_PEDIDO} variante={variante} />;
  const texto = textoPedido(p);
  const whatsapp = whatsappPedido(p);

  return (
    <>
      {/* Desktop: a lista continua por baixo do painel (30). */}
      <div className="hidden lg:contents">
        <ListaPedidos dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} soDesktop />
      </div>
      <DetalhePainel
        fecharPara={voltar}
        subtitulo={recebido}
        nome={p.nome}
        status={status("claro")}
        rodape={
          <>
            <BotaoCopiar texto={texto} variante="painel" />
            <BotaoWhatsapp href={whatsapp} variante="painel" />
          </>
        }
      >
        <SecaoPainel titulo="Contato" itens={contato.map((i) => ({ ...i, largo: false }))} />
        <SecaoPainel titulo="Carro desejado" itens={carro.map((i) => ({ ...i, largo: false }))} />
        <SecaoPainel
          titulo="Troca"
          itens={[
            { rotulo: "Tem carro para dar de entrada", valor: p.temTroca ? "Sim" : "Não" },
            ...(p.temTroca ? [{ rotulo: "Modelo e ano", valor: [p.trocaModelo, p.trocaAno].filter(Boolean).join(" · ") || "—" }] : []),
          ]}
        />
        {p.temTroca && (
          <SecaoPainel titulo={`Fotos do carro de entrada · ${p.fotos.length}`}>
            <FotosEnviadas fotos={p.fotos} colunas="grid-cols-4" />
          </SecaoPainel>
        )}
        <SecaoPainel titulo="Anotações da loja">
          <Anotacoes lista="pedidos" id={p.id} inicial={p.anotacoes} placeholder={PLACEHOLDER} variante="painel" />
        </SecaoPainel>
      </DetalhePainel>

      {/* Mobile: página cheia (17). */}
      <DetalheMobile
        voltarPara={voltar}
        tituloBarra="Pedido de busca"
        nome={p.nome}
        subtitulo={recebido}
        status={status("escuro")}
        rodape={
          <>
            <BotaoCopiar texto={texto} variante="rodape" />
            <BotaoWhatsapp href={whatsapp} variante="rodape" />
          </>
        }
      >
        <SecaoMobile titulo="Contato" itens={contato} />
        <SecaoMobile titulo="Carro desejado" itens={carro} />
        <SecaoMobile titulo="Troca" itens={troca} />
        {p.temTroca && (
          <SecaoMobile titulo={`Fotos do carro de entrada · ${p.fotos.length}`}>
            <FotosEnviadas fotos={p.fotos} colunas="grid-cols-3" />
          </SecaoMobile>
        )}
        <SecaoMobile titulo="Anotações da loja" className="flex flex-col gap-10 [&>h2]:mb-0">
          <Anotacoes lista="pedidos" id={p.id} inicial={p.anotacoes} placeholder={PLACEHOLDER} variante="cartao" />
        </SecaoMobile>
      </DetalheMobile>
    </>
  );
}

/** Detalhe do pedido: página no mobile (17), painel lateral sobre a lista no desktop (30). */
export default function PedidoPage({ params, searchParams }: PageProps<"/admin/pedidos/[id]">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Detalhe params={params} searchParams={searchParams} />
    </Suspense>
  );
}
