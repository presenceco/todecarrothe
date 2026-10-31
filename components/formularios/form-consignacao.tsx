"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/field";
import { OptionGroup } from "@/components/ui/option-group";
import { SelectField } from "@/components/ui/select-field";
import { TEXTO_CONSENTIMENTO } from "@/lib/consentimento";
import { confirmarFotosConsignacao, enviarConsignacao } from "@/lib/formularios/acoes";
import { cupomParaEnvio } from "@/lib/formularios/cupom-navegador";
import { errosPorCampo, esquemaConsignacao, FORMAS_VENDA, type CamposConsignacao } from "@/lib/formularios/esquemas";
import { CACHE_FOTOS_VEICULO } from "@/lib/fotos-veiculo";
import { MARCAS } from "@/lib/marcas";
import { mascaraAnoFabModelo, mascaraKm, mascaraMoeda, mascaraWhatsapp } from "@/lib/mascaras";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { CampoCupom } from "./campo-cupom";
import { FotosCliente, prepararFoto, type FotoLocal } from "./fotos-cliente";
import { AvisoGeral, Autorizacao, CampoIsca, CampoMascara, CartaoForm, ErroGrupo, RodapeEnvio } from "./partes";
import { useFormulario } from "./use-formulario";

const VAZIO: CamposConsignacao = {
  forma: "",
  marca: "",
  modelo: "",
  versao: "",
  anoFabModelo: "",
  km: "",
  cambio: "",
  cor: "",
  quitado: "",
  valorPretendido: "",
  detalhes: "",
  nome: "",
  whatsapp: "",
  autorizado: false,
  site: "",
  cupom: "",
};

const OPCOES_MARCA = [...MARCAS].sort((a, b) => a.localeCompare(b, "pt-BR")).map((m) => ({ value: m, label: m }));
const CAMBIOS = [
  { value: "automatico", label: "Automático" },
  { value: "manual", label: "Manual" },
];
const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const LEGENDA_CAMPO = "mb-6 text-14 font-semibold text-gray-700";

const opcional = (rotulo: string) => (
  <>
    {rotulo} <span className="font-normal text-gray-500">(opcional)</span>
  </>
);

/**
 * Venda seu carro (33 mobile, 37 desktop): forma de venda, dados do carro, fotos e contato.
 * Envio em duas etapas: o servidor grava e devolve links assinados; o navegador sobe as fotos direto
 * para o bucket privado e avisa o servidor quais chegaram. Só então vai para a confirmação (34).
 */
export function FormConsignacao() {
  const router = useRouter();
  const [fotos, setFotos] = useState<FotoLocal[]>([]);
  const validar = (c: CamposConsignacao) => {
    const r = esquemaConsignacao.safeParse({ ...c, fotos: fotos.map((f) => ({ tipo: f.arquivo.type, tamanho: f.arquivo.size })) });
    return r.success ? null : errosPorCampo(r.error);
  };
  const f = useFormulario(VAZIO, validar);
  const { campos: c, definir, erros } = f;
  // Progresso das fotos depois que a consignação foi gravada ("Enviando fotos 2 de 5…").
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(null);
  const ocupado = f.enviando || progresso !== null;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (ocupado || !f.conferir()) return;
    f.iniciar(async () => {
      const arquivos = await Promise.all(fotos.map((foto) => prepararFoto(foto.arquivo)));
      const resposta = await enviarConsignacao({
        campos: { ...c, cupom: cupomParaEnvio(c.cupom) },
        fotos: arquivos.map((a) => ({ tipo: a.type, tamanho: a.size })),
        iniciadoEm: f.iniciadoEm.current,
      });
      if (!resposta || !("ok" in resposta)) {
        f.receber(resposta);
        return;
      }

      // A consignação já está gravada: falha numa foto não impede a confirmação.
      const enviadas: string[] = [];
      if (resposta.uploads.length) {
        const storage = clienteNavegador().storage.from("consignacoes");
        for (const [i, envio] of resposta.uploads.entries()) {
          setProgresso({ atual: i + 1, total: resposta.uploads.length });
          const arquivo = arquivos[i];
          // Cache curto: a foto pode virar foto do estoque ("Cadastrar no estoque") e ir para o bucket público.
          const { error } = await storage.uploadToSignedUrl(envio.path, envio.token, arquivo, { contentType: arquivo.type, cacheControl: CACHE_FOTOS_VEICULO });
          if (!error) enviadas.push(envio.path);
        }
        if (enviadas.length) await confirmarFotosConsignacao({ id: resposta.id, assinatura: resposta.assinatura, paths: enviadas });
      }
      router.push(resposta.confirmacao);
    });
  }

  const campo = (nome: "modelo" | "versao" | "anoFabModelo" | "km" | "cor" | "valorPretendido" | "nome" | "whatsapp") => ({
    name: nome,
    value: c[nome],
    onValor: (v: string) => definir(nome, v),
    error: erros[nome],
  });


  return (
    <form onSubmit={enviar} noValidate className="relative flex flex-col gap-16 lg:gap-24">
      <CampoIsca value={c.site} onValor={(v) => definir("site", v)} />
      <AvisoGeral mensagem={f.geral} />

      <CartaoForm>
        <div>
          <OptionGroup
            name="forma"
            legend="Como prefere vender?"
            legendClassName="mb-14 text-17 font-bold lg:mb-16 lg:text-18"
            // 14px no celular: três opções lado a lado em 390px; abaixo de 375px, uma por linha.
            textSize={14}
            options={FORMAS_VENDA}
            value={c.forma}
            onValueChange={(v) => definir("forma", v)}
            invalid={!!erros.forma}
            className="grid grid-cols-1 gap-8 min-[375px]:grid-cols-[repeat(3,1fr)]"
            itemClassName="lg:h-52 lg:text-15"
          />
          <ErroGrupo id="campo-forma-erro" mensagem={erros.forma} />
        </div>
      </CartaoForm>

      <CartaoForm titulo="Seu carro">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          <SelectField
            name="marca"
            label="Marca"
            placeholder="Selecione"
            options={OPCOES_MARCA}
            value={c.marca}
            onChange={(e) => definir("marca", e.target.value)}
            error={erros.marca}
            className="lg:pr-12"
          />
          <CampoMascara {...campo("modelo")} label="Modelo" placeholder="Ex.: Corolla" autoCapitalize="words" />
          <CampoMascara {...campo("versao")} label={opcional("Versão")} placeholder="Ex.: XEi 2.0" autoCapitalize="words" />
          <CampoMascara {...campo("cor")} label="Cor" placeholder="Ex.: Prata" autoCapitalize="words" />
          <div className="grid grid-cols-2 gap-8 lg:gap-16">
            <CampoMascara {...campo("anoFabModelo")} label="Ano fab./modelo" placeholder="2019/2020" inputMode="numeric" mascara={mascaraAnoFabModelo} />
            <CampoMascara {...campo("km")} label="Quilometragem" placeholder="Ex.: 38.000" inputMode="numeric" mascara={mascaraKm} />
          </div>
          <div>
            <OptionGroup
              name="cambio"
              legend="Câmbio"
              legendClassName={LEGENDA_CAMPO}
              textSize={15}
              options={CAMBIOS}
              value={c.cambio}
              onValueChange={(v) => definir("cambio", v)}
              invalid={!!erros.cambio}
              itemClassName="lg:h-52"
            />
            <ErroGrupo id="campo-cambio-erro" mensagem={erros.cambio} />
          </div>
          <div>
            <OptionGroup
              name="quitado"
              legend="O carro está quitado?"
              legendClassName={LEGENDA_CAMPO}
              textSize={15}
              options={SIM_NAO}
              value={c.quitado}
              onValueChange={(v) => definir("quitado", v)}
              invalid={!!erros.quitado}
              itemClassName="lg:h-52"
            />
            <ErroGrupo id="campo-quitado-erro" mensagem={erros.quitado} />
          </div>
          <CampoMascara
            {...campo("valorPretendido")}
            label={opcional("Quanto você quer pelo carro?")}
            placeholder="R$ 0,00"
            inputMode="numeric"
            mascara={mascaraMoeda}
          />
          <Textarea
            name="detalhes"
            label={opcional("Tem algum detalhe que devemos saber?")}
            placeholder="Ex.: revisões na concessionária, pneus novos, um risco na porta"
            value={c.detalhes}
            onChange={(e) => definir("detalhes", e.target.value)}
            error={erros.detalhes}
            maxLength={2000}
            rows={3}
            // 16px no celular: abaixo disso o iPhone amplia a página ao focar.
            className="max-lg:text-16"
            fieldClassName="lg:col-span-2"
          />
        </div>
      </CartaoForm>

      <CartaoForm titulo={opcional("Fotos")}>
        <FotosCliente fotos={fotos} onFotos={setFotos} erro={erros.fotos} desabilitado={ocupado} />
      </CartaoForm>

      <CartaoForm titulo="Seus dados">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-2 lg:gap-16">
          <CampoMascara {...campo("nome")} label="Nome" placeholder="Seu nome" autoComplete="name" autoCapitalize="words" />
          <CampoMascara {...campo("whatsapp")} label="WhatsApp" placeholder="(86) 9 0000-0000" type="tel" inputMode="tel" autoComplete="tel-national" mascara={mascaraWhatsapp} />
        </div>
      </CartaoForm>

      {/* Cupom de indicação (opcional; fora das telas 33/37). */}
      <CartaoForm>
        <div data-novo="">
        <CampoCupom valor={c.cupom} onValor={(v) => definir("cupom", v)} />
      </div>
      </CartaoForm>

      <Autorizacao texto={TEXTO_CONSENTIMENTO.consignacao} marcado={c.autorizado} onMarcar={(v) => definir("autorizado", v)} erro={erros.autorizado} />
      <RodapeEnvio
        rotulo="Enviar para avaliação"
        rotuloEnviando={progresso ? `Enviando fotos ${progresso.atual} de ${progresso.total}…` : undefined}
        icone="send"
        autorizado={c.autorizado}
        enviando={ocupado}
        desktop="linha"
      />
    </form>
  );
}
