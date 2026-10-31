import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotaoWhatsapp, DetalheMobile, DetalhePainel, SecaoMobile, SecaoPainel, type ItemDetalhe } from "@/components/admin/detalhe/estrutura";
import { LinkIndicacao } from "@/components/admin/cupons/indicacao";
import { BotaoCopiar, ExcluirRegistro, StatusEscolha } from "@/components/admin/detalhe/interativos";
import { PaginaCarregando } from "@/components/admin/estados";
import { BASE_SIMULACOES, FotoSimulacao, ListaSimulacoes, OPCOES_STATUS_SIMULACAO, whatsappSimulacao } from "@/components/admin/simulacoes/lista-simulacoes";
import { Icon } from "@/components/ui/icon";
import { hrefLista, lerFiltrosLista } from "@/lib/admin/filtros";
import { contarNovos, exigirAdmin } from "@/lib/admin/sessao";
import { cpfMascarado, dataNascimento, listarSimulacoes, obterSimulacao, STATUS_SIMULACOES, textoApagado, textoSimulacao, type Simulacao } from "@/lib/admin/simulacoes";
import { dataHora, diaMes, moeda, telefone } from "@/lib/formato";
import { apagamentoDadosSensiveis } from "@/lib/lgpd";

export const metadata: Metadata = { title: "Simulação" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cartão do veículo da simulação (19 mobile; 32 desktop com ano · km e o preço à direita). */
function VeiculoSimulacao({ s, variante }: { s: Simulacao; variante: "mobile" | "painel" }) {
  const v = s.veiculo;
  const painel = variante === "painel";
  const titulo = v ? (v.modeloVersao ?? v.nome) : "Sem veículo escolhido";
  const preco = moeda(v?.preco ?? s.valorAproximado ?? 0);
  return (
    <div className={painel ? "flex items-center gap-14 rounded-14 bg-gray-100 p-12" : "flex items-center gap-12 rounded-16 border border-gray-150 bg-white p-12"}>
      <FotoSimulacao s={s} className={painel ? "h-84 w-112 rounded-10" : "h-72 w-96 rounded-10"} sizes={painel ? "112px" : "96px"} />
      <div className="min-w-0 flex-1">
        {v?.marca && <p className="text-14 font-bold tracking-[0.08em] text-brand uppercase">{v.marca}</p>}
        <p className={painel ? "truncate font-display text-20 font-extrabold italic" : "truncate font-display text-19 leading-110 font-extrabold italic"}>{titulo}</p>
        {painel && <p className="text-14 text-gray-500">{v ? (v.anoKm ?? "") : "Valor aproximado do carro"}</p>}
        {!painel && <p className="mt-4 text-22 font-extrabold whitespace-nowrap tabular-nums">{preco}</p>}
      </div>
      {painel && <p className="text-22 font-extrabold whitespace-nowrap tabular-nums">{preco}</p>}
    </div>
  );
}

async function Detalhe({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const filtros = lerFiltrosLista(sp, STATUS_SIMULACOES);
  const { usuario } = await exigirAdmin();
  if (!UUID.test(id)) notFound();
  const [s, dados, contadores] = await Promise.all([obterSimulacao(id), listarSimulacoes(filtros), contarNovos()]);
  if (!s) notFound();

  const voltar = hrefLista(BASE_SIMULACOES, filtros, {});
  // LGPD: CPF, nascimento e renda são apagados 30 dias após o envio; o resto do histórico fica.
  const apagado = <span className="font-medium text-gray-500">{textoApagado(s)}</span>;
  const pessoais: ItemDetalhe[] = [
    { rotulo: "Nome completo", valor: s.nome, largo: true },
    { rotulo: "CPF", valor: s.cpf ? cpfMascarado(s.cpf) : apagado },
    { rotulo: "Data de nascimento", valor: s.nascimento ? dataNascimento(s.nascimento) : apagado },
    { rotulo: "WhatsApp", valor: telefone(s.whatsapp) },
    { rotulo: "Renda mensal", valor: s.renda !== null ? moeda(s.renda) : apagado },
    { rotulo: "Possui CNH", valor: s.possuiCnh ? "Sim" : "Não" },
  ];
  const avisoPrazo = s.dadosApagadosEm ? null : (
    <p className="mt-12 flex items-center gap-6 text-14 text-gray-500">
      <Icon name="schedule" size={18} />
      CPF, nascimento e renda serão apagados em {diaMes(apagamentoDadosSensiveis(s.criadoEm))}
    </p>
  );
  const financiamento: ItemDetalhe[] = [
    ...(s.veiculo ? [] : [{ rotulo: "Valor aproximado do carro", valor: moeda(s.valorAproximado ?? 0), largo: true }]),
    { rotulo: "Valor de entrada", valor: moeda(s.entrada) },
    { rotulo: "Prazo desejado", valor: `${s.prazo} meses` },
    { rotulo: "Parcela que busca", valor: s.parcela ? moeda(s.parcela) : "Não informada" },
  ];
  const status = (variante: "escuro" | "claro") => (
    <StatusEscolha lista="simulacoes" id={s.id} atual={s.status} opcoes={OPCOES_STATUS_SIMULACAO} variante={variante} compacto={variante === "claro"} />
  );
  const texto = textoSimulacao(s);
  const whatsapp = whatsappSimulacao(s);
  // Exclusão a pedido do cliente (LGPD).
  const excluir = (
    <ExcluirRegistro
      lista="simulacoes"
      id={s.id}
      titulo={`Excluir a simulação de ${s.nome}?`}
      texto="Apaga todos os dados desta simulação. Não dá para desfazer."
      voltarPara={voltar}
    />
  );
  const semLargo = (itens: ItemDetalhe[]) => itens.map((i) => ({ ...i, largo: false }));

  return (
    <>
      {/* Desktop: a lista continua por baixo do painel (32). */}
      <div className="hidden lg:contents">
        <ListaSimulacoes dados={dados} filtros={filtros} usuario={usuario} contadores={contadores} soDesktop />
      </div>
      <DetalhePainel
        compacto
        fecharPara={voltar}
        subtitulo={`Simulação recebida em ${dataHora(s.criadoEm)}`}
        nome={s.nome}
        status={status("claro")}
        rodape={
          <>
            <BotaoCopiar texto={texto} variante="painel" alto />
            <BotaoWhatsapp href={whatsapp} variante="painel" />
          </>
        }
      >
        <VeiculoSimulacao s={s} variante="painel" />
        <SecaoPainel titulo="Dados pessoais" itens={semLargo(pessoais)}>
          {avisoPrazo}
        </SecaoPainel>
        <SecaoPainel titulo="Financiamento" itens={semLargo(financiamento)} />
        <SecaoPainel
          titulo="Troca"
          itens={[
            { rotulo: "Tem veículo na troca", valor: s.temTroca ? "Sim" : "Não" },
            ...(s.temTroca ? [{ rotulo: "Modelo e ano", valor: [s.trocaModelo, s.trocaAno].filter(Boolean).join(" · ") || "—" }] : []),
          ]}
        />
        {s.indicacao && (
          <SecaoPainel titulo="Indicação">
            <LinkIndicacao indicacao={s.indicacao} />
          </SecaoPainel>
        )}
        {s.consentimento && (
          <p className="flex items-center gap-8 text-14 font-medium text-success">
            <Icon name="check_circle" size={20} fill />
            Autorizou o uso dos dados para simulação de crédito
          </p>
        )}
        {excluir}
      </DetalhePainel>

      {/* Mobile: página cheia (19). */}
      <DetalheMobile
        voltarPara={voltar}
        tituloBarra="Simulação"
        nome={s.nome}
        subtitulo={`Recebida em ${dataHora(s.criadoEm)}`}
        status={status("escuro")}
        rodape={
          <>
            <BotaoCopiar texto={texto} variante="rodape" />
            <BotaoWhatsapp href={whatsapp} variante="rodape" />
          </>
        }
      >
        <VeiculoSimulacao s={s} variante="mobile" />
        <SecaoMobile titulo="Dados pessoais" itens={pessoais}>
          {avisoPrazo}
        </SecaoMobile>
        <SecaoMobile titulo="Financiamento" itens={financiamento} />
        <SecaoMobile
          titulo="Troca"
          itens={[
            { rotulo: "Tem veículo na troca", valor: s.temTroca ? "Sim" : "Não", largo: true },
            ...(s.temTroca
              ? [
                  { rotulo: "Modelo", valor: s.trocaModelo ?? "—" },
                  { rotulo: "Ano", valor: s.trocaAno ?? "—" },
                ]
              : []),
          ]}
        />
        {s.indicacao && (
          <SecaoMobile titulo="Indicação">
            <LinkIndicacao indicacao={s.indicacao} />
          </SecaoMobile>
        )}
        {s.consentimento && (
          <p className="flex items-center gap-10 rounded-14 bg-success-bg p-14 text-14 leading-140 font-semibold text-success">
            <Icon name="check_circle" size={22} fill />
            Autorizou o uso dos dados para simulação de crédito
          </p>
        )}
        {excluir}
      </DetalheMobile>
    </>
  );
}

/** Detalhe da simulação: página no mobile (19), painel lateral sobre a lista no desktop (32). */
export default function SimulacaoPage({ params, searchParams }: PageProps<"/admin/simulacoes/[id]">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Detalhe params={params} searchParams={searchParams} />
    </Suspense>
  );
}
