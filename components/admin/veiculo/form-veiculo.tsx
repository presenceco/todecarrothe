"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AvisoGeral, CampoMascara } from "@/components/formularios/partes";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { SelectField } from "@/components/ui/select-field";
import { salvarVeiculo } from "@/lib/admin/acoes-veiculo";
import {
  esquemaVeiculo,
  OPCOES_CAMBIO,
  OPCOES_COMBUSTIVEL,
  OPCOES_COR,
  OPCOES_ETIQUETA,
  OPCOES_MARCA,
  OPCOES_TIPO,
  type CamposVeiculo,
} from "@/lib/admin/esquema-veiculo";
import type { DadosFormVeiculo, Opcional } from "@/lib/admin/veiculo";
import { cn } from "@/lib/cn";
import { errosPorCampo, type ErrosCampos } from "@/lib/formularios/esquemas";
import { mascaraAnoFabModelo, mascaraKmSufixo, mascaraReais } from "@/lib/mascaras";
import type { Etiqueta } from "@/lib/status";
import { Cartao, Opcionais, Previa, Selos, SeletorStatus } from "./blocos";
import { FotosVeiculo, type FotoForm } from "./fotos-veiculo";

/** Campos do desktop (28): 46px, raio 10, 400 15px, padding 12px (no mobile, os 52px dos formulários). */
const CAMPO_DESKTOP = "lg:h-46 lg:rounded-10 lg:px-12 lg:text-15";
const SELECT_DESKTOP = "lg:h-46 lg:rounded-10 lg:pl-12 lg:text-15 lg:[&>.icon]:text-20!";

/**
 * Cadastro e edição de veículo (15 mobile, 28 desktop). Mobile: cartões em coluna e rodapé fixo com
 * "Salvar rascunho" e "Publicar no catálogo". Desktop: coluna principal e, à direita, Status, Preço e a
 * prévia do cartão no catálogo (fixos ao rolar), com os botões no topo.
 */
export function FormVeiculo({
  dados,
  opcionais: opcionaisIniciais,
  modelos,
  anoAtual,
}: {
  dados: DadosFormVeiculo;
  opcionais: Opcional[];
  modelos: Record<string, string[]>;
  anoAtual: number;
}) {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposVeiculo>(dados.campos);
  const [fotos, setFotos] = useState<FotoForm[]>(() => dados.fotos.map((f) => ({ ...f, chave: f.path })));
  const [opcionais, setOpcionais] = useState(opcionaisIniciais);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [geral, setGeral] = useState<string>();
  const [salvo, setSalvo] = useState<string>();
  const [acao, setAcao] = useState<"rascunho" | "publicar" | null>(null);
  const [pendente, iniciar] = useTransition();
  // Alterado = diferente do último estado salvo (comparação direta, sem efeito: o modo estrito roda efeitos duas vezes).
  const retrato = (c: CamposVeiculo, f: FotoForm[]) => JSON.stringify([c, f.map((x) => x.path)]);
  const [salvoComo, setSalvoComo] = useState(() => (dados.novo && dados.consignacaoId ? "" : retrato(dados.campos, dados.fotos.map((f) => ({ ...f, chave: f.path })))));
  const alterado = retrato(campos, fotos) !== salvoComo;
  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  function definir<K extends keyof CamposVeiculo>(chave: K, valor: CamposVeiculo[K]) {
    setCampos((c) => ({ ...c, [chave]: valor }));
    setSalvo(undefined);
    if (erros[chave]) setErros((e) => ({ ...e, [chave]: undefined }));
  }

  const enviando = fotos.some((f) => f.enviando);

  function salvar(publicar: boolean) {
    setGeral(undefined);
    setSalvo(undefined);
    const r = esquemaVeiculo.safeParse(campos);
    const novosErros: ErrosCampos = r.success ? {} : errosPorCampo(r.error);
    if (publicar && fotos.length === 0) novosErros.fotos = "Adicione pelo menos uma foto para publicar.";
    if (Object.keys(novosErros).length) {
      setErros(novosErros);
      focarErro(novosErros);
      return;
    }
    setErros({});
    setAcao(publicar ? "publicar" : "rascunho");
    iniciar(async () => {
      const resposta = await salvarVeiculo({
        id: dados.id,
        novo: dados.novo,
        campos,
        fotos: fotos.map((f) => ({ path: f.path, origem: f.origem })),
        publicar,
        consignacaoId: dados.consignacaoId,
      });
      setAcao(null);
      if (!resposta.ok) {
        setErros(resposta.erros);
        setGeral(resposta.geral);
        focarErro(resposta.erros);
        return;
      }
      setSalvoComo(retrato(campos, fotos));
      if (publicar) router.push("/admin/estoque");
      else {
        setSalvo("Rascunho salvo");
        if (dados.novo) router.replace(`/admin/estoque/${resposta.id}`);
      }
    });
  }

  const campo = (nome: "versao" | "finalPlaca") => ({ name: nome, value: campos[nome], onValor: (v: string) => definir(nome, v), error: erros[nome] });
  const linhaPrevia = [campos.versao, campos.anoFabModelo, campos.km].filter(Boolean).join(" · ");
  const sugestoes = modelos[campos.marca] ?? [];
  const ocupado = pendente || enviando;

  const botoes = (local: "rodape" | "topo") => (
    <>
      <Button
        variant="neutral"
        size="custom"
        onClick={() => salvar(false)}
        disabled={ocupado}
        aria-busy={acao === "rascunho"}
        className={cn(
          "gap-8",
          local === "rodape" ? "h-52 rounded-14 border-[1.5px] text-15 font-bold" : "box-content h-48 rounded-12 px-18 text-15 font-semibold",
        )}
      >
        {acao === "rascunho" && <Icon name="progress_activity" size={20} className="animate-spin" />}
        Salvar rascunho
      </Button>
      <Button
        size="custom"
        onClick={() => salvar(true)}
        disabled={ocupado}
        aria-busy={acao === "publicar"}
        className={cn("gap-8", local === "rodape" ? "h-52 rounded-14 text-15 font-bold" : "h-48 rounded-12 px-22 text-15 font-bold")}
      >
        {acao === "publicar" ? <Icon name="progress_activity" size={20} className="animate-spin" /> : local === "topo" && <Icon name="publish" size={20} />}
        Publicar no catálogo
      </Button>
    </>
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Barra do mobile (15): voltar, título e o nome do veículo. */}
      <div className="box-content flex h-60 items-center gap-4 bg-black px-4 pt-[env(safe-area-inset-top,0px)] text-white lg:hidden">
        <IconButton icon="arrow_back" label="Voltar para o estoque" onClick={() => router.push("/admin/estoque")} />
        <div className="min-w-0">
          <h1 className="text-17 font-semibold">{dados.novo ? "Cadastrar veículo" : "Editar veículo"}</h1>
          {!dados.novo && <p className="truncate text-14 text-gray-350">{dados.titulo}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:gap-24 lg:px-40 lg:pt-32 lg:pb-48">
        {/* Topo do desktop (28): caminho, título e os botões. */}
        <div className="hidden items-end justify-between gap-16 lg:flex">
          <div className="min-w-0">
            <Link href="/admin/estoque" className="flex items-center gap-6 text-14 font-medium text-gray-500 hover:text-ink">
              <Icon name="arrow_back" size={18} />
              Estoque / {dados.novo ? "Cadastrar veículo" : "Editar veículo"}
            </Link>
            <p className="mt-6 truncate text-28 font-bold">{dados.novo ? campos.modelo ? `${campos.marca} ${campos.modelo} ${campos.versao}`.trim() : "Novo veículo" : dados.titulo}</p>
          </div>
          <div className="flex flex-none items-center gap-10">
            {salvo && (
              <span role="status" className="flex items-center gap-4 text-14 font-medium text-success">
                <Icon name="check" size={18} />
                {salvo}
              </span>
            )}
            {botoes("topo")}
          </div>
        </div>

        <div className="flex flex-col gap-16 p-16 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-24 lg:p-0">
          {geral && (
            <div className="lg:col-span-2">
              <AvisoGeral mensagem={geral} />
            </div>
          )}
          {dados.consignacaoId && dados.novo && (
            <p className="flex gap-10 rounded-12 border border-brand-200 bg-brand-25 px-14 py-12 text-15 leading-140 text-ink-500 lg:col-span-2">
              <Icon name="handshake" size={20} className="text-brand" />
              Dados e fotos vindos da consignação. Confira tudo, complete o que falta e publique.
            </p>
          )}

          <div className="contents lg:flex lg:flex-col lg:gap-24">
            <Cartao
              titulo="Fotos"
              extra={
                <span className="text-14 text-gray-500">
                  {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
                  <span className="hidden lg:inline"> · arraste para ordenar · a 1ª é a capa</span>
                </span>
              }
              className="order-1 lg:order-none"
            >
              <p className="-mt-6 text-14 text-gray-600 lg:hidden">Arraste para ordenar. A 1ª é a capa.</p>
              <FotosVeiculo veiculoId={dados.id} fotos={fotos} onFotos={setFotos} erro={erros.fotos} />
            </Cartao>

            <Cartao titulo="Dados do veículo" className="order-4 gap-14 lg:order-none">
              <div className="flex flex-col gap-14 lg:grid lg:grid-cols-3 lg:gap-16">
                <SelectField
                  name="marca"
                  label="Marca"
                  placeholder="Selecione"
                  options={OPCOES_MARCA}
                  value={campos.marca}
                  onChange={(e) => definir("marca", e.target.value)}
                  error={erros.marca}
                  className={SELECT_DESKTOP}
                />
                <Field label="Modelo" htmlFor="campo-modelo" error={erros.modelo}>
                  <div className="relative">
                    <input
                      id="campo-modelo"
                      name="modelo"
                      list="modelos-sugeridos"
                      value={campos.modelo}
                      onChange={(e) => definir("modelo", e.target.value)}
                      autoComplete="off"
                      autoCapitalize="words"
                      placeholder="Ex.: Corolla"
                      aria-invalid={erros.modelo ? true : undefined}
                      aria-describedby={erros.modelo ? "campo-modelo-erro" : undefined}
                      className={inputClasses({
                        invalid: !!erros.modelo,
                        className: cn("h-52 pr-40 pl-14 [&::-webkit-calendar-picker-indicator]:hidden", CAMPO_DESKTOP, "lg:pr-36"),
                      })}
                    />
                    <Icon name="expand_more" size={22} className="pointer-events-none absolute top-1/2 right-11 -translate-y-1/2 text-gray-400 lg:text-20!" />
                    <datalist id="modelos-sugeridos">
                      {sugestoes.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>
                </Field>
                <CampoMascara {...campo("versao")} label="Versão" placeholder="Ex.: XEi 2.0" autoCapitalize="words" className={CAMPO_DESKTOP} />
                <div className="grid grid-cols-2 gap-8 lg:contents">
                  <CampoMascara
                    name="anoFabModelo"
                    value={campos.anoFabModelo}
                    onValor={(v) => definir("anoFabModelo", v)}
                    error={erros.anoFabModelo}
                    mascara={mascaraAnoFabModelo}
                    label={
                      <>
                        <span className="lg:hidden">Ano fab./modelo</span>
                        <span className="hidden lg:inline">Ano fabricação/modelo</span>
                      </>
                    }
                    placeholder="2022/2023"
                    inputMode="numeric"
                    className={CAMPO_DESKTOP}
                  />
                  <CampoMascara
                    name="km"
                    value={campos.km}
                    onValor={(v) => definir("km", mascaraKmSufixo(v, campos.km))}
                    error={erros.km}
                    label="Quilometragem"
                    placeholder="38.000 km"
                    inputMode="numeric"
                    className={CAMPO_DESKTOP}
                  />
                </div>
                <SelectField
                  name="cambio"
                  label="Câmbio"
                  placeholder="Selecione"
                  options={OPCOES_CAMBIO}
                  value={campos.cambio}
                  onChange={(e) => definir("cambio", e.target.value)}
                  error={erros.cambio}
                  className={SELECT_DESKTOP}
                />
                <SelectField
                  name="cor"
                  label="Cor"
                  placeholder="Selecione"
                  options={OPCOES_COR}
                  value={campos.cor}
                  onChange={(e) => definir("cor", e.target.value)}
                  error={erros.cor}
                  className={SELECT_DESKTOP}
                />
                <SelectField
                  name="combustivel"
                  label="Combustível"
                  placeholder="Selecione"
                  options={OPCOES_COMBUSTIVEL}
                  value={campos.combustivel}
                  onChange={(e) => definir("combustivel", e.target.value)}
                  error={erros.combustivel}
                  className={SELECT_DESKTOP}
                />
                <CampoMascara
                  {...campo("finalPlaca")}
                  onValor={(v) => definir("finalPlaca", v.replace(/\D/g, "").slice(-1))}
                  label="Final da placa"
                  placeholder="Ex.: 4"
                  inputMode="numeric"
                  maxLength={2}
                  className={CAMPO_DESKTOP}
                />
                {/* Não aparece nas telas, mas o filtro "Tipo" do catálogo precisa dele (data-novo: fora da comparação visual). */}
                <div data-novo="">
                  <SelectField
                    name="tipo"
                    label="Carroceria"
                    placeholder="Selecione"
                    options={OPCOES_TIPO}
                    value={campos.tipo}
                    onChange={(e) => definir("tipo", e.target.value)}
                    error={erros.tipo}
                    className={SELECT_DESKTOP}
                  />
                </div>
              </div>
            </Cartao>

            <Cartao
              titulo={
                <>
                  Selos verificados
                  <span className="mt-2 block text-14 font-normal text-gray-500 lg:mt-4">
                    <span className="lg:hidden">Toque para marcar ou desmarcar.</span>
                    <span className="hidden lg:inline">Aparecem na página do veículo.</span>
                  </span>
                </>
              }
              className="order-5 lg:order-none"
            >
              <Selos valor={campos.selos} onValor={(v) => definir("selos", v)} ano={anoAtual} />
            </Cartao>

            <div className="order-6 lg:order-none">
              <Opcionais lista={opcionais} onLista={setOpcionais} valor={campos.opcionais} onValor={(v) => definir("opcionais", v)} />
            </div>
          </div>

          <div className="contents lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-24">
            <Cartao titulo="Status" className="order-2 lg:order-none [&>div:first-child]:lg:mb-14">
              <SeletorStatus valor={campos.status} onValor={(v) => definir("status", v)} />
              {/* Etiqueta do cartão no catálogo (item 3 da seção 9 do briefing; data-novo: fora da comparação visual). */}
              <div data-novo="" className="contents">
              <SelectField
                name="etiqueta"
                label="Etiqueta no catálogo"
                placeholder="Nenhuma"
                options={OPCOES_ETIQUETA.filter((e) => e.value !== "nenhuma")}
                value={campos.etiqueta === "nenhuma" ? "" : campos.etiqueta}
                onChange={(e) => definir("etiqueta", e.target.value || "nenhuma")}
                className={SELECT_DESKTOP}
                fieldClassName="mt-4 lg:mt-16"
              />
              </div>
            </Cartao>

            <Cartao titulo="Preço" className="order-3 lg:order-none [&>div:first-child]:lg:mb-14">
              <label
                className={cn(
                  "box-border flex h-60 items-center gap-6 rounded-12 border bg-white px-16 tabular-nums focus-within:border-2 focus-within:border-brand focus-within:shadow-focus",
                  erros.preco ? "border-2 border-danger" : "border-gray-200",
                )}
              >
                <span className="text-18 text-gray-500">R$</span>
                <span className="sr-only">Preço</span>
                <input
                  id="campo-preco"
                  name="preco"
                  value={campos.preco}
                  onChange={(e) => definir("preco", mascaraReais(e.target.value))}
                  inputMode="numeric"
                  placeholder="0"
                  aria-invalid={erros.preco ? true : undefined}
                  aria-describedby={erros.preco ? "campo-preco-erro" : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent text-28 font-extrabold outline-none placeholder:text-gray-300"
                />
              </label>
              {erros.preco && (
                <p id="campo-preco-erro" className="text-14 text-danger lg:mt-6">
                  {erros.preco}
                </p>
              )}
            </Cartao>

            <Cartao titulo="Prévia no catálogo" className="hidden lg:flex [&>div:first-child]:lg:mb-14">
              <Previa
                capa={fotos.find((f) => !f.enviando)?.url ?? null}
                etiqueta={campos.etiqueta as Etiqueta}
                marca={campos.marca}
                modelo={campos.modelo}
                linha={linhaPrevia}
                preco={campos.preco}
              />
            </Cartao>
          </div>
        </div>

        {/* Rodapé fixo do mobile (15). */}
        <div className="h-20 lg:hidden" />
        <div className="sticky bottom-0 z-20 mt-auto grid grid-cols-[1fr_1.25fr] gap-8 border-t border-gray-150 bg-white px-16 pt-12 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-footer lg:hidden">
          {salvo && (
            <p role="status" className="col-span-2 -mt-4 flex items-center justify-center gap-4 text-14 font-medium text-success">
              <Icon name="check" size={18} />
              {salvo}
            </p>
          )}
          {botoes("rodape")}
        </div>
      </div>
    </div>
  );
}

/** Leva o foco ao primeiro campo com erro, na ordem da página. */
function focarErro(erros: ErrosCampos) {
  requestAnimationFrame(() => {
    const alvos = Object.keys(erros)
      .filter((k) => erros[k])
      .map((k) => document.getElementById(`campo-${k}`))
      .filter((el): el is HTMLElement => !!el && el.getClientRects().length > 0);
    alvos.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    alvos[0]?.focus({ preventScroll: true });
    alvos[0]?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}
