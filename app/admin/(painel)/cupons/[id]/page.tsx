import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AcoesCupom, BotaoCopiarLink } from "@/components/admin/cupons/acoes-cupom";
import { FormCupom } from "@/components/admin/cupons/form-cupom";
import { MolduraCupom } from "@/components/admin/cupons/moldura-cupom";
import { PaginaCarregando } from "@/components/admin/estados";
import { Cartao } from "@/components/admin/veiculo/blocos";
import { StatusBadge } from "@/components/ui/badges";
import { ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cupomUsado, linkIndicacao, obterCupom } from "@/lib/admin/cupons";
import { exigirAdmin } from "@/lib/admin/sessao";
import { diaMes, primeiroNome, telefone } from "@/lib/formato";
import { linkWhatsapp } from "@/lib/loja";

export const metadata: Metadata = { title: "Cupom de indicação" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INDICADOR_REMOVIDO = "Indicador removido";

async function Detalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirAdmin();
  if (!UUID.test(id)) notFound();
  const resultado = await obterCupom(id);
  if (!resultado) notFound();
  const { cupom: c, contatos, cliquesPorCarro } = resultado;

  const link = linkIndicacao(c.codigo);
  const totais = [
    ["Simulações", c.totais.simulacoes],
    ["Pedidos", c.totais.pedidos],
    ["Consignações", c.totais.consignacoes],
    ["Cliques no WhatsApp", c.totais.cliques],
  ] as const;

  return (
    <MolduraCupom titulo={c.codigo} subtitulo={c.indicadorNome}>
      <div className="flex flex-col gap-16 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-24">
        <div className="flex flex-col gap-16 lg:gap-24">
          <Cartao titulo="Resumo" extra={<StatusBadge tom={c.ativo ? "success" : "neutral"} size="lg">{c.ativo ? "Ativo" : "Inativo"}</StatusBadge>}>
            <dl className="grid grid-cols-2 gap-12 lg:grid-cols-4">
              {totais.map(([rotulo, total]) => (
                <div key={rotulo} className="rounded-12 bg-gray-100 px-12 py-10">
                  <dt className="text-14 leading-125 text-gray-600">{rotulo}</dt>
                  <dd className="mt-2 text-22 font-extrabold tabular-nums">{total}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-12 text-14 text-gray-500">{c.ultimoUso ? `Último uso em ${diaMes(c.ultimoUso)}` : "Ainda não foi usado"}</p>
          </Cartao>

          <Cartao titulo="Link de indicação">
            <p className="rounded-12 bg-gray-100 px-14 py-12 text-15 break-all text-ink">{link}</p>
            <div className="mt-12 flex flex-col gap-8 lg:flex-row">
              <BotaoCopiarLink link={link} />
              {c.indicadorWhatsapp && (
                <ButtonAnchor
                  href={linkWhatsapp(c.indicadorWhatsapp, `Olá, ${primeiroNome(c.indicadorNome)}! Este é o seu link de indicação da Tô de Carro: ${link}`)}
                  variant="whatsapp"
                  size="lg"
                  className="box-border gap-8 lg:px-20"
                >
                  <Icon name="chat" size={20} fill />
                  Enviar ao indicador no WhatsApp
                </ButtonAnchor>
              )}
            </div>
            {c.indicadorWhatsapp && <p className="mt-8 text-14 text-gray-500">WhatsApp do indicador: {telefone(c.indicadorWhatsapp)}</p>}
          </Cartao>

          <Cartao titulo={`Contatos indicados · ${contatos.length}`}>
            {contatos.length ? (
              <ul className="flex flex-col">
                {contatos.map((p) => (
                  <li key={`${p.tipo}-${p.id}`} className="border-t border-gray-120 first:border-0">
                    <Link href={p.href} className="flex min-h-56 items-center justify-between gap-12 py-8 hover:bg-brand-row">
                      <span className="min-w-0">
                        <span className="block truncate text-15 font-semibold">{p.nome}</span>
                        <span className="block text-14 text-gray-500">
                          {p.tipo} · {diaMes(p.criadoEm)} · {p.status}
                        </span>
                      </span>
                      <Icon name="chevron_right" size={20} className="flex-none text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-15 text-gray-500">Nenhum contato veio por este cupom ainda.</p>
            )}
          </Cartao>

          <Cartao titulo="Cliques no WhatsApp por carro">
            {cliquesPorCarro.length ? (
              <ul className="flex flex-col">
                {cliquesPorCarro.map((v) => (
                  <li key={v.carro} className="flex min-h-48 items-center justify-between gap-12 border-t border-gray-120 py-8 text-15 first:border-0">
                    <span className="min-w-0 break-words">{v.carro}</span>
                    <span className="flex-none font-bold tabular-nums">{v.total}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-15 text-gray-500">Nenhum clique no “Tenho interesse” com este cupom ainda.</p>
            )}
          </Cartao>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24">
          <Cartao titulo="Dados do cupom">
            <FormCupom
              key={`${c.indicadorNome}-${c.ativo}`}
              id={c.id}
              inicial={{ codigo: c.codigo, indicadorNome: c.indicadorNome, indicadorWhatsapp: c.indicadorWhatsapp ? telefone(c.indicadorWhatsapp) : "", observacao: c.observacao, ativo: c.ativo }}
              codigoTravado={cupomUsado(c)}
            />
          </Cartao>
          <AcoesCupom id={c.id} codigo={c.codigo} usado={cupomUsado(c)} ativo={c.ativo} dadosApagados={c.indicadorNome === INDICADOR_REMOVIDO} />
        </div>
      </div>
    </MolduraCupom>
  );
}

/** Detalhe do cupom: totais, link de indicação, contatos indicados, cliques por carro e edição. */
export default function CupomPage({ params }: PageProps<"/admin/cupons/[id]">) {
  return (
    <Suspense fallback={<PaginaCarregando />}>
      <Detalhe params={params} />
    </Suspense>
  );
}
