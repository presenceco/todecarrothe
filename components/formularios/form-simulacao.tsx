"use client";

import { OptionGroup } from "@/components/ui/option-group";
import { enviarSimulacao } from "@/lib/formularios/acoes";
import { errosPorCampo, esquemaSimulacao, type CamposSimulacao } from "@/lib/formularios/esquemas";
import { TEXTO_CONSENTIMENTO } from "@/lib/consentimento";
import { mascaraAno, mascaraCpf, mascaraData, mascaraMoeda, mascaraWhatsapp } from "@/lib/mascaras";
import { AvisoGeral, Autorizacao, CampoIsca, CampoMascara, CartaoForm, ErroGrupo, RodapeEnvio } from "./partes";
import { useFormulario } from "./use-formulario";

const VAZIO: CamposSimulacao = {
  nome: "",
  cpf: "",
  nascimento: "",
  whatsapp: "",
  renda: "",
  valorAproximado: "",
  entrada: "",
  prazo: "",
  parcela: "",
  temTroca: "",
  trocaModelo: "",
  trocaAno: "",
  possuiCnh: "",
  autorizado: false,
  site: "",
};

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const PRAZOS = [24, 36, 48, 60].map((m) => ({
  value: String(m),
  label: (
    <>
      <span className="text-16 font-bold lg:text-15 lg:font-semibold">{m}</span>
      <span className="text-14 font-normal opacity-80 lg:hidden">meses</span>
    </>
  ),
}));

/** Título de grupo: no mobile é o título do cartão (700 17px); no desktop é rótulo de campo (600 14px). */
const LEGENDA_GRUPO = "mb-14 text-17 font-bold lg:mb-6 lg:text-14 lg:font-semibold lg:text-gray-700";
const LEGENDA_CAMPO = "mb-6 text-14 font-semibold text-gray-700";

/**
 * Simulação de financiamento (04 e 05b mobile, 23 desktop). Com veículo, a entrada é limitada ao preço;
 * sem veículo, pede o "Valor aproximado do carro".
 */
export function FormSimulacao({ veiculo }: { veiculo: { slug: string; preco: number } | null }) {
  const validar = (c: CamposSimulacao) => {
    const r = esquemaSimulacao(veiculo?.preco ?? null).safeParse(c);
    return r.success ? null : errosPorCampo(r.error);
  };
  const f = useFormulario(VAZIO, validar);
  const { campos: c, definir, erros } = f;
  const temTroca = c.temTroca === "sim";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!f.conferir()) return;
    f.iniciar(async () => {
      f.receber(await enviarSimulacao({ veiculo: veiculo?.slug ?? null, campos: c, iniciadoEm: f.iniciadoEm.current }));
    });
  }

  const campo = (nome: keyof CamposSimulacao) => ({
    name: nome,
    value: c[nome] as string,
    onValor: (v: string) => definir(nome, v),
    error: erros[nome],
  });

  return (
    <form onSubmit={enviar} noValidate className="relative flex flex-col gap-16 lg:gap-24">
      <CampoIsca value={c.site} onValor={(v) => definir("site", v)} />
      <AvisoGeral mensagem={f.geral} />

      <CartaoForm titulo="Seus dados">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          <CampoMascara {...campo("nome")} label="Nome completo" placeholder="Como está no documento" autoComplete="name" autoCapitalize="words" fieldClassName="lg:col-span-2" />
          <CampoMascara {...campo("cpf")} label="CPF" placeholder="000.000.000-00" inputMode="numeric" mascara={mascaraCpf} />
          <CampoMascara {...campo("nascimento")} label="Data de nascimento" placeholder="dd/mm/aaaa" inputMode="numeric" autoComplete="bday" mascara={mascaraData} />
          <CampoMascara {...campo("whatsapp")} label="WhatsApp" placeholder="(86) 9 0000-0000" type="tel" inputMode="tel" autoComplete="tel-national" mascara={mascaraWhatsapp} />
          <CampoMascara {...campo("renda")} label="Renda mensal" placeholder="R$ 0,00" inputMode="numeric" mascara={mascaraMoeda} />
        </div>
      </CartaoForm>

      <CartaoForm titulo="Financiamento">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          {!veiculo && <CampoMascara {...campo("valorAproximado")} label="Valor aproximado do carro" placeholder="R$ 0,00" inputMode="numeric" mascara={mascaraMoeda} />}
          <CampoMascara {...campo("entrada")} label="Valor de entrada" placeholder="R$ 0,00" inputMode="numeric" mascara={mascaraMoeda} />
          <div className={veiculo ? "" : "lg:col-span-2"}>
            <OptionGroup
              name="prazo"
              legend={
                <>
                  <span className="lg:hidden">Prazo desejado</span>
                  <span className="hidden lg:inline">Prazo desejado (meses)</span>
                </>
              }
              legendClassName={LEGENDA_CAMPO}
              height={52}
              textSize={15}
              options={PRAZOS}
              value={c.prazo}
              onValueChange={(v) => definir("prazo", v)}
              invalid={!!erros.prazo}
              className="grid grid-cols-[repeat(4,1fr)] gap-8"
            />
            <ErroGrupo id="campo-prazo-erro" mensagem={erros.prazo} />
          </div>
          {/* Parcela que o cliente busca (pedido do cliente, fora das telas; data-novo: fora da comparação visual). */}
          <div data-novo="">
            <CampoMascara
              {...campo("parcela")}
              label={
                <>
                  Parcela que você busca <span className="font-normal text-gray-500">(opcional)</span>
                </>
              }
              hint="Quanto cabe no seu bolso por mês"
              placeholder="R$ 0,00"
              inputMode="numeric"
              mascara={mascaraMoeda}
            />
          </div>
        </div>
      </CartaoForm>

      <CartaoForm tituloDesktop="Troca e CNH">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-1">
            <OptionGroup
              name="temTroca"
              legend="Tem veículo para dar na troca?"
              legendClassName={LEGENDA_GRUPO}
              textSize={15}
              options={SIM_NAO}
              value={c.temTroca}
              onValueChange={(v) => definir("temTroca", v)}
              invalid={!!erros.temTroca}
              itemClassName="lg:h-52"
            />
            <ErroGrupo id="campo-temTroca-erro" mensagem={erros.temTroca} />
          </div>
          {temTroca && (
            <div className="grid grid-cols-[2fr_1fr] gap-8 lg:contents">
              <CampoMascara
                {...campo("trocaModelo")}
                label={
                  <>
                    <span className="lg:hidden">Modelo</span>
                    <span className="hidden lg:inline">Modelo do veículo da troca</span>
                  </>
                }
                placeholder="Ex.: Fiat Argo"
                fieldClassName="lg:order-3"
              />
              <CampoMascara {...campo("trocaAno")} label="Ano" placeholder="2019" inputMode="numeric" mascara={mascaraAno} fieldClassName="lg:order-4" />
            </div>
          )}
          <div className="mt-6 lg:order-2 lg:mt-0">
            <OptionGroup
              name="possuiCnh"
              legend="Possui CNH?"
              legendClassName={LEGENDA_GRUPO}
              textSize={15}
              options={SIM_NAO}
              value={c.possuiCnh}
              onValueChange={(v) => definir("possuiCnh", v)}
              invalid={!!erros.possuiCnh}
              itemClassName="lg:h-52"
            />
            <ErroGrupo id="campo-possuiCnh-erro" mensagem={erros.possuiCnh} />
          </div>
        </div>
      </CartaoForm>

      <Autorizacao texto={TEXTO_CONSENTIMENTO.simulacao} marcado={c.autorizado} onMarcar={(v) => definir("autorizado", v)} erro={erros.autorizado} />
      <RodapeEnvio rotulo="Enviar para simulação" icone="send" autorizado={c.autorizado} enviando={f.enviando} desktop="linha" />
    </form>
  );
}
