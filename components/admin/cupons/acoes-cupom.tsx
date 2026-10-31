"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmarPerigo } from "@/components/admin/detalhe/confirmar-perigo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { alterarAtivoCupom, apagarDadosIndicador, excluirCupom } from "@/lib/admin/acoes-cupons";

/** "Copiar link" do link de indicação. */
export function BotaoCopiarLink({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Sem permissão de área de transferência: seleciona num campo temporário.
      const area = document.createElement("textarea");
      area.value = link;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  }
  return (
    <Button variant="neutral" size="lg" onClick={copiar} className={copiado ? "gap-8 border-success text-success lg:px-20" : "gap-8 lg:px-20"}>
      <Icon name={copiado ? "check" : "content_copy"} size={20} />
      <span aria-live="polite">{copiado ? "Copiado" : "Copiar link"}</span>
    </Button>
  );
}

const BOTAO_PERIGO = "pressable flex h-48 items-center gap-8 self-start rounded-12 px-4 text-15 font-semibold text-danger hover:underline";

/**
 * Fim do detalhe do cupom. "Desativar" para de valer e guarda o histórico; "Reativar" volta a valer. "Excluir"
 * apaga de vez. Usado: também "Apagar dados do indicador", para atender o pedido de exclusão dele.
 */
export function AcoesCupom({ id, codigo, usado, ativo, dadosApagados }: { id: string; codigo: string; usado: boolean; ativo: boolean; dadosApagados: boolean }) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState<"excluir" | "apagar" | null>(null);
  const [erro, setErro] = useState<string>();
  const [pendente, iniciar] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {(ativo || !dadosApagados) && (
        <button
          type="button"
          disabled={pendente}
          onClick={() =>
            iniciar(async () => {
              setErro(undefined);
              const r = await alterarAtivoCupom(id, !ativo);
              if (!r.ok) setErro(r.erro);
            })
          }
          className="flex h-48 items-center self-start px-4 text-15 font-semibold text-brand hover:underline disabled:opacity-50"
        >
          {ativo ? "Desativar cupom" : "Reativar cupom"}
        </button>
      )}
      {usado && !dadosApagados && (
        <button type="button" onClick={() => setConfirmar("apagar")} className={BOTAO_PERIGO}>
          <Icon name="delete" size={20} />
          Apagar dados do indicador
        </button>
      )}
      <button type="button" onClick={() => setConfirmar("excluir")} className={BOTAO_PERIGO}>
        <Icon name="delete" size={20} />
        Excluir cupom
      </button>
      {erro && (
        <p role="alert" className="text-14 text-danger">
          {erro}
        </p>
      )}
      <ConfirmarPerigo
        aberto={confirmar === "excluir"}
        onFechar={() => setConfirmar(null)}
        titulo={`Excluir o cupom ${codigo}?`}
        texto={
          usado
            ? "O link de indicação deixa de funcionar e os cliques são apagados. Os contatos continuam no painel, mas sem a indicação: não dá mais para saber quem indicou. Não dá para desfazer. Para guardar o histórico, desative o cupom."
            : "Ele nunca foi usado. O link de indicação deixa de funcionar e não dá para desfazer."
        }
        acao={() => excluirCupom(id)}
        depois={() => router.replace("/admin/cupons")}
      />
      <ConfirmarPerigo
        aberto={confirmar === "apagar"}
        onFechar={() => setConfirmar(null)}
        titulo="Apagar os dados do indicador?"
        texto="Use quando o indicador pedir a exclusão. Nome, WhatsApp e observação são apagados e o cupom fica inativo. O código e o histórico dos contatos continuam. Não dá para desfazer."
        rotulo="Apagar"
        acao={() => apagarDadosIndicador(id)}
      />
    </div>
  );
}
