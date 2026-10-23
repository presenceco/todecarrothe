"use client";

import { OptionGroup } from "@/components/ui/option-group";
import { SelectField, type OpcaoSelect } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { enviarPedido } from "@/lib/formularios/acoes";
import { errosPorCampo, esquemaPedido, FAIXAS_PRECO, PRAZOS_PEDIDO, type CamposPedido } from "@/lib/formularios/esquemas";
import { TEXTO_CONSENTIMENTO } from "@/lib/consentimento";
import { mascaraAno, mascaraMoeda, mascaraWhatsapp } from "@/lib/mascaras";
import { AvisoGeral, Autorizacao, CampoIsca, CampoMascara, ErroGrupo, RodapeEnvio } from "./partes";
import { useFormulario } from "./use-formulario";

const VAZIO: CamposPedido = {
  nome: "",
  whatsapp: "",
  marcaModelo: "",
  anoMinimo: "",
  faixa: "",
  pagamento: "",
  prazo: "",
  entrada: "",
  parcela: "",
  temTroca: false,
  trocaModelo: "",
  trocaAno: "",
  autorizado: false,
  site: "",
};

const PRAZOS = PRAZOS_PEDIDO.map((m) => ({ value: String(m), label: `${m}x` }));

const PAGAMENTOS = [
  { value: "a_vista", label: "À vista" },
  { value: "financiado", label: "Financiado" },
];

/**
 * Pedido de busca, "Não encontrou seu carro?" (07 mobile, 24 desktop). Num cartão só; no desktop os
 * campos curtos ficam lado a lado. Com o interruptor ligado aparecem o modelo e o ano do carro da entrada.
 */
export function FormPedido({ anos }: { anos: readonly OpcaoSelect[] }) {
  const validar = (c: CamposPedido) => {
    const r = esquemaPedido.safeParse(c);
    return r.success ? null : errosPorCampo(r.error);
  };
  const f = useFormulario(VAZIO, validar);
  const { campos: c, definir, erros } = f;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!f.conferir()) return;
    f.iniciar(async () => {
      f.receber(await enviarPedido({ campos: c, iniciadoEm: f.iniciadoEm.current }));
    });
  }

  const campo = (nome: "nome" | "whatsapp" | "marcaModelo" | "trocaModelo" | "trocaAno" | "entrada" | "parcela") => ({
    name: nome,
    value: c[nome],
    onValor: (v: string) => definir(nome, v),
    error: erros[nome],
  });

  return (
    <form onSubmit={enviar} noValidate className="relative flex flex-col gap-16 lg:gap-20">
      <CampoIsca value={c.site} onValor={(v) => definir("site", v)} />
      <AvisoGeral mensagem={f.geral} />

      <section className="flex flex-col gap-14 rounded-16 border border-gray-150 bg-white px-16 py-18 lg:contents">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          <CampoMascara {...campo("nome")} label="Nome" placeholder="Seu nome" autoComplete="name" autoCapitalize="words" />
          <CampoMascara {...campo("whatsapp")} label="WhatsApp" placeholder="(86) 9 0000-0000" type="tel" inputMode="tel" autoComplete="tel-national" mascara={mascaraWhatsapp} />
          <CampoMascara {...campo("marcaModelo")} label="Marca / modelo desejado" placeholder="Ex.: Toyota Hilux" autoCapitalize="words" fieldClassName="lg:col-span-2" />
          <SelectField
            name="anoMinimo"
            label="Ano mínimo"
            placeholder="Selecione"
            options={anos}
            value={c.anoMinimo}
            onChange={(e) => definir("anoMinimo", e.target.value)}
            error={erros.anoMinimo}
            className="lg:pr-12"
          />
          <SelectField
            name="faixa"
            label="Faixa de preço"
            placeholder="Selecione"
            options={FAIXAS_PRECO}
            value={c.faixa}
            onChange={(e) => definir("faixa", e.target.value)}
            error={erros.faixa}
            className="lg:pr-12"
          />
          <div className="lg:col-span-2">
            <OptionGroup
              name="pagamento"
              legend="Forma de pagamento"
              legendClassName="mb-6 text-14 font-semibold text-gray-700"
              textSize={15}
              options={PAGAMENTOS}
              value={c.pagamento}
              onValueChange={(v) => definir("pagamento", v)}
              invalid={!!erros.pagamento}
              itemClassName="lg:h-52"
            />
            <ErroGrupo id="campo-pagamento-erro" mensagem={erros.pagamento} />
          </div>
          {/* Financiado: em quantas vezes, entrada e valor da parcela (opcionais; pedido do cliente, fora das telas 07/24). */}
          {c.pagamento === "financiado" && (
            <div data-novo="" className="flex flex-col gap-14 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-16">
              <div className="lg:col-span-2">
                <OptionGroup
                  name="prazo"
                  legend={
                    <>
                      Em quantas vezes? <span className="font-normal text-gray-500">(opcional)</span>
                    </>
                  }
                  legendClassName="mb-6 text-14 font-semibold text-gray-700"
                  textSize={15}
                  options={PRAZOS}
                  value={c.prazo}
                  onValueChange={(v) => definir("prazo", v)}
                  invalid={!!erros.prazo}
                  className="grid grid-cols-[repeat(5,1fr)] gap-8"
                  itemClassName="lg:h-52"
                />
                <ErroGrupo id="campo-prazo-erro" mensagem={erros.prazo} />
              </div>
              <CampoMascara
                {...campo("entrada")}
                label={
                  <>
                    Valor de entrada <span className="font-normal text-gray-500">(opcional)</span>
                  </>
                }
                placeholder="R$ 0,00"
                inputMode="numeric"
                mascara={mascaraMoeda}
              />
              <CampoMascara
                {...campo("parcela")}
                label={
                  <>
                    Valor da parcela <span className="font-normal text-gray-500">(opcional)</span>
                  </>
                }
                hint="Quanto cabe no seu bolso por mês"
                placeholder="R$ 0,00"
                inputMode="numeric"
                mascara={mascaraMoeda}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-14 border-t border-gray-100 pt-12 lg:gap-16 lg:pt-16">
          <Switch name="temTroca" checked={c.temTroca} onChange={(e) => definir("temTroca", e.target.checked)} className="min-h-52">
            <span className="lg:text-16">Tenho carro para dar de entrada</span>
          </Switch>
          {c.temTroca && (
            <div className="grid grid-cols-[2fr_1fr] gap-8 lg:gap-16">
              <CampoMascara {...campo("trocaModelo")} label="Modelo" placeholder="Ex.: Fiat Argo" autoCapitalize="words" />
              <CampoMascara {...campo("trocaAno")} label="Ano" placeholder="2019" inputMode="numeric" mascara={mascaraAno} />
            </div>
          )}
        </div>
      </section>

      <Autorizacao texto={TEXTO_CONSENTIMENTO.pedido_busca} marcado={c.autorizado} onMarcar={(v) => definir("autorizado", v)} erro={erros.autorizado} />
      <RodapeEnvio rotulo="Fazer pedido" autorizado={c.autorizado} enviando={f.enviando} desktop="bloco" />
    </form>
  );
}
