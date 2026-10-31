"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AvisoGeral, CampoMascara } from "@/components/formularios/partes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { codigoLivre, salvarCupom, sugerirCodigoLivre } from "@/lib/admin/acoes-cupons";
import { esquemaCupom, type CamposCupom } from "@/lib/admin/esquema-cupom";
import { normalizarCupom } from "@/lib/cupom";
import { errosPorCampo, type ErrosCampos } from "@/lib/formularios/esquemas";
import { mascaraWhatsapp } from "@/lib/mascaras";

const opcional = (rotulo: string) => (
  <>
    {rotulo} <span className="font-normal text-gray-500">(opcional)</span>
  </>
);

/**
 * Formulário do cupom: código (sugerido a partir do primeiro nome, editável e checado como único), nome e
 * WhatsApp do indicador, observação interna e o interruptor Ativo. Cupom usado mantém o código.
 */
export function FormCupom({ id, inicial, codigoTravado }: { id: string | null; inicial: CamposCupom; codigoTravado?: boolean }) {
  const router = useRouter();
  const [c, setC] = useState(inicial);
  const [codigoEditado, setCodigoEditado] = useState(!!inicial.codigo);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [geral, setGeral] = useState<string>();
  const [salvo, setSalvo] = useState(false);
  const [pendente, iniciar] = useTransition();

  function definir<K extends keyof CamposCupom>(chave: K, valor: CamposCupom[K]) {
    setC((a) => ({ ...a, [chave]: valor }));
    setSalvo(false);
    if (erros[chave]) setErros((e) => ({ ...e, [chave]: undefined }));
  }

  async function aoSairDoNome() {
    if (codigoEditado || c.codigo || id) return;
    const sugestao = await sugerirCodigoLivre(c.indicadorNome);
    if (sugestao) setC((a) => (a.codigo ? a : { ...a, codigo: sugestao }));
  }

  async function aoSairDoCodigo() {
    const codigo = normalizarCupom(c.codigo);
    if (codigo !== c.codigo) setC((a) => ({ ...a, codigo }));
    if (codigo && !(await codigoLivre(codigo, id))) setErros((e) => ({ ...e, codigo: "Esse código já existe. Escolha outro." }));
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setGeral(undefined);
    setSalvo(false);
    const r = esquemaCupom.safeParse(c);
    if (!r.success) {
      setErros(errosPorCampo(r.error));
      return;
    }
    setErros({});
    iniciar(async () => {
      const resposta = await salvarCupom(id, c);
      if (!resposta.ok) {
        setErros(resposta.erros);
        setGeral(resposta.geral);
        return;
      }
      if (id) setSalvo(true);
      else router.replace(`/admin/cupons/${resposta.id}`);
    });
  }

  return (
    <form onSubmit={salvar} noValidate className="flex flex-col gap-14">
      <AvisoGeral mensagem={geral} />
      <CampoMascara
        name="indicadorNome"
        label="Nome do indicador"
        placeholder="Ex.: João Silva"
        autoCapitalize="words"
        value={c.indicadorNome}
        onValor={(v) => definir("indicadorNome", v)}
        onBlur={() => void aoSairDoNome()}
        error={erros.indicadorNome}
        maxLength={120}
      />
      <CampoMascara
        name="codigo"
        label="Código do cupom"
        placeholder="Ex.: JOAO"
        hint={codigoTravado ? "Cupons usados não podem trocar de código." : "De 3 a 15 letras ou números, sem espaços."}
        autoCapitalize="characters"
        spellCheck={false}
        autoComplete="off"
        readOnly={codigoTravado}
        value={c.codigo}
        onValor={(v) => {
          setCodigoEditado(true);
          definir("codigo", v);
        }}
        onBlur={() => void aoSairDoCodigo()}
        error={erros.codigo}
        maxLength={20}
        className={codigoTravado ? "bg-gray-100 text-gray-600" : undefined}
      />
      <CampoMascara
        name="indicadorWhatsapp"
        label={opcional("WhatsApp do indicador")}
        placeholder="(86) 9 0000-0000"
        type="tel"
        inputMode="tel"
        mascara={mascaraWhatsapp}
        value={c.indicadorWhatsapp}
        onValor={(v) => definir("indicadorWhatsapp", v)}
        error={erros.indicadorWhatsapp}
      />
      <Textarea
        name="observacao"
        label={opcional("Observação interna")}
        placeholder="Só a loja vê."
        value={c.observacao}
        onChange={(e) => definir("observacao", e.target.value)}
        error={erros.observacao}
        maxLength={500}
        rows={3}
        className="max-lg:text-16"
      />
      <Switch name="ativo" checked={c.ativo} onChange={(e) => definir("ativo", e.target.checked)} className="min-h-48">
        Cupom ativo
      </Switch>
      <div className="flex items-center gap-12">
        <Button type="submit" size="lg" disabled={pendente} aria-busy={pendente} className="gap-8 lg:px-24">
          {pendente && <Icon name="progress_activity" size={20} className="animate-spin" />}
          {id ? "Salvar alterações" : "Criar cupom"}
        </Button>
        {salvo && (
          <span role="status" className="flex items-center gap-4 text-14 font-medium text-success">
            <Icon name="check" size={18} />
            Salvo
          </span>
        )}
      </div>
    </form>
  );
}
