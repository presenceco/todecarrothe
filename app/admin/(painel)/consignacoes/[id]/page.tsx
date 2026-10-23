import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BASE_CONSIGNACOES, ListaConsignacoes, OPCOES_STATUS_CONSIGNACAO, whatsappConsignacao } from "@/components/admin/consignacoes/lista-consignacoes";
import { BotaoWhatsapp, DetalheMobile, DetalhePainel, SecaoMobile, SecaoPainel, type ItemDetalhe } from "@/components/admin/detalhe/estrutura";
import { Anotacoes, BotaoCopiar, StatusEscolha } from "@/components/admin/detalhe/interativos";
import { PaginaCarregando } from "@/components/admin/estados";
import { Icon } from "@/components/ui/icon";
import { FORMA, listarConsignacoes, obterConsignacao, rotuloCambio, STATUS_CONSIGNACOES, textoConsignacao, type Consignacao } from "@/lib/admin/consignacoes";
import { hrefLista, lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";
import { cn } from "@/lib/cn";
import { dataHora, km, moeda, telefone } from "@/lib/formato";

export const metadata: Metadata = { title: "Consignação" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLACEHOLDER = "Escreva aqui o andamento da avaliação…";

/** Forma de venda em destaque, logo abaixo do status (36). */
function FormaDestaque({ c }: { c: Consignacao }) {
  const f = FORMA[c.forma];
  return (
    <div className="flex items-center gap-12 rounded-14 border border-brand-200 bg-brand-25 p-14">
      <span aria-hidden="true" className="flex size-44 flex-none items-center justify-center rounded-pill bg-brand-100 text-brand">
        <Icon name={f.icone} />
      </span>
      <div>
        <p className="text-14 text-gray-600">Forma de venda escolhida</p>
        <p className="text-17 font-bold">{f.rotulo}</p>
      </div>
    </div>
  );
}

/** Fotos enviadas pelo cliente (bucket privado; cada uma abre em tamanho real numa aba nova). */
function Fotos({ fotos, colunas }: { fotos: string[]; colunas: string }) {
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

/** "Cadastrar no estoque" (status Negócio fechado) ou, se já foi cadastrado, o atalho para o veículo. */
function BotaoEstoque({ c, veiculoId, variante }: { c: Consignacao; veiculoId: string | null; variante: "rodape" | "painel" }) {
  if (c.status !== "negocio_fechado" && !veiculoId) return null;
  const href = veiculoId ? `/admin/estoque/${veiculoId}` : `/admin/estoque/novo?consignacao=${c.id}`;
  return (
    <Link
      href={href}
      className={cn(
        "pressable col-span-2 flex h-52 items-center justify-center gap-8 text-15 font-bold",
        variante === "rodape" ? "rounded-14" : "rounded-12",
        veiculoId ? "border border-gray-200 bg-white text-ink hover:bg-gray-100" : "bg-brand text-white hover:bg-brand-hover",
      )}
    >
      <Icon name={veiculoId ? "directions_car" : "add"} size={20} />
      {veiculoId ? "Ver o veículo no estoque" : "Cadastrar no estoque"}
    </Link>
  );
}

async function Detalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const filtros = lerFiltrosLista(sp, STATUS_CONSIGNACOES);
  const { usuario } = await exigirAdmin();
  if (!UUID.test(id)) notFound();
  const [resultado, dados, contadores] = await Promise.all([obterConsignacao(id), listarConsignacoes(filtros), contarNovos()]);
  if (!resultado) notFound();
  const { consignacao: c, fotos, veiculoId } = resultado;

  const voltar = hrefLista(BASE_CONSIGNACOES, filtros, {});
  const recebida = `Recebida em ${dataHora(c.criadoEm)}`;
  const carro: ItemDetalhe[] = [
    { rotulo: "Marca / modelo", valor: `${c.marca} ${c.modelo}`, largo: true },
    ...(c.versao ? [{ rotulo: "Versão", valor: c.versao, largo: true }] : []),
    { rotulo: "Ano fab./modelo", valor: c.ano },
    { rotulo: "Quilometragem", valor: km(c.km) },
    { rotulo: "Câmbio", valor: rotuloCambio(c.cambio) },
    { rotulo: "Cor", valor: c.cor },
    { rotulo: "Quitado", valor: c.quitado ? "Sim" : "Não, ainda financiado", largo: true },
    ...(c.detalhes.trim() ? [{ rotulo: "Detalhes informados", valor: <span className="font-normal whitespace-pre-line">{c.detalhes.trim()}</span>, largo: true }] : []),
  ];
  const contato: ItemDetalhe[] = [
    { rotulo: "Nome", valor: c.nome, largo: true },
    { rotulo: "WhatsApp", valor: telefone(c.whatsapp), largo: true },
  ];
  const valor = c.valorPretendido ? (
    <p className="text-22 font-extrabold tabular-nums">{moeda(c.valorPretendido)}</p>
  ) : (
    <p className="text-16 font-semibold text-gray-500">Não informado</p>
  );
  const status = (variante: "escuro" | "claro") => <StatusEscolha lista="consignacoes" id={c.id} atual={c.status} opcoes={OPCOES_STATUS_CONSIGNACAO} variante={variante} />;
  const texto = textoConsignacao(c);
  const whatsapp = whatsappConsignacao(c);
  const semLargo = (itens: ItemDetalhe[]) => itens.map((i) => ({ ...i, largo: i.rotulo === "Detalhes informados" }));

  return (
    <>
      {/* Desktop: a lista continua por baixo do painel (39). */}
      <div className="hidden lg:contents">
        <ListaConsignacoes dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} soDesktop />
      </div>
      <DetalhePainel
        fecharPara={voltar}
        subtitulo={recebida}
        nome={c.nome}
        status={status("claro")}
        rodape={
          <>
            <BotaoEstoque c={c} veiculoId={veiculoId} variante="painel" />
            <BotaoCopiar texto={texto} variante="painel" />
            <BotaoWhatsapp href={whatsapp} variante="painel" />
          </>
        }
      >
        <FormaDestaque c={c} />
        <SecaoPainel titulo={`Fotos enviadas · ${fotos.length}`}>
          <Fotos fotos={fotos} colunas="grid-cols-4" />
        </SecaoPainel>
        <SecaoPainel titulo="Carro" itens={semLargo(carro)} />
        <SecaoPainel titulo="Valor que o dono quer receber">{valor}</SecaoPainel>
        <SecaoPainel titulo="Contato" itens={semLargo(contato)} />
        <SecaoPainel titulo="Anotações da loja">
          <Anotacoes lista="consignacoes" id={c.id} inicial={c.anotacoes} placeholder={PLACEHOLDER} variante="painel" />
        </SecaoPainel>
      </DetalhePainel>

      {/* Mobile: página cheia (36). */}
      <DetalheMobile
        voltarPara={voltar}
        tituloBarra="Consignação"
        nome={c.nome}
        subtitulo={recebida}
        status={status("escuro")}
        rodape={
          <>
            <BotaoEstoque c={c} veiculoId={veiculoId} variante="rodape" />
            <BotaoCopiar texto={texto} variante="rodape" />
            <BotaoWhatsapp href={whatsapp} variante="rodape" />
          </>
        }
      >
        <FormaDestaque c={c} />
        <SecaoMobile titulo={`Fotos enviadas · ${fotos.length}`}>
          <Fotos fotos={fotos} colunas="grid-cols-3" />
        </SecaoMobile>
        <SecaoMobile titulo="Carro" itens={carro} />
        <SecaoMobile titulo="Valor que o dono quer receber">{valor}</SecaoMobile>
        <SecaoMobile titulo="Contato" itens={contato} />
        <SecaoMobile titulo="Anotações da loja" className="flex flex-col gap-10 [&>h2]:mb-0">
          <Anotacoes lista="consignacoes" id={c.id} inicial={c.anotacoes} placeholder={PLACEHOLDER} variante="cartao" />
        </SecaoMobile>
      </DetalheMobile>
    </>
  );
}

/** Detalhe da consignação: página no mobile (36), painel lateral sobre a lista no desktop (39). */
export default function ConsignacaoPage({ params, searchParams }: PageProps<"/admin/consignacoes/[id]">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Detalhe params={params} searchParams={searchParams} />
    </Suspense>
  );
}
