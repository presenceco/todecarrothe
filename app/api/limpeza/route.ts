import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { limiteDadosSensiveis } from "@/lib/lgpd";
import { resumoErro } from "@/lib/log";
import { clienteServico } from "@/lib/supabase/servico";

/**
 * Limpeza diária (Vercel Cron, 03:00 de Brasília; ver vercel.json). Protegida por
 * `Authorization: Bearer ${CRON_SECRET}`, que a Vercel envia sozinha quando a variável existe.
 *
 * 1. LGPD: apaga CPF, nascimento e renda das simulações enviadas há mais de 30 dias.
 * 2. Apaga os hashes de IP do limite de envios com mais de 24 h.
 * 3. Envios abandonados: nos buckets consignacoes e trocas, apaga os arquivos com mais de 24 h que não
 *    estão registrados (pasta de um registro que não existe mais, ou foto que não chegou a ser confirmada).
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIA_MS = 24 * 60 * 60 * 1000;
const PAGINA = 1000;

type Servico = ReturnType<typeof clienteServico>;
type Arquivo = { name: string; id: string | null; created_at: string | null };

const BUCKETS = [
  { bucket: "consignacoes", tabela: "consignacoes", fotos: "consignacao_fotos", coluna: "consignacao_id" },
  { bucket: "trocas", tabela: "pedidos_busca", fotos: "pedido_fotos", coluna: "pedido_id" },
] as const;

function autorizado(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${segredo}`);
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

/** Lista uma pasta inteira do bucket (o Storage devolve no máximo 1000 por vez). */
async function listar(servico: Servico, bucket: string, pasta: string) {
  const itens: Arquivo[] = [];
  for (let offset = 0; ; offset += PAGINA) {
    const { data, error } = await servico.storage.from(bucket).list(pasta, { limit: PAGINA, offset });
    if (error) throw new Error(`listar ${bucket}: ${resumoErro(error).message}`);
    itens.push(...data);
    if (data.length < PAGINA) return itens;
  }
}

/** Divide em lotes (filtros .in() e remoções em partes). */
function lotes<T>(lista: T[], tamanho: number) {
  return Array.from({ length: Math.ceil(lista.length / tamanho) }, (_, i) => lista.slice(i * tamanho, (i + 1) * tamanho));
}

/** Apaga do bucket os arquivos com mais de 24 h que não estão registrados. Devolve quantos apagou. */
async function limparBucket(servico: Servico, def: (typeof BUCKETS)[number]) {
  const limite = Date.now() - DIA_MS;
  // Na raiz só há pastas (uma por registro): o Storage as devolve com id null.
  const pastas = (await listar(servico, def.bucket, "")).filter((p) => p.id === null).map((p) => p.name);
  if (!pastas.length) return 0;

  const existentes = new Set<string>();
  const registradas = new Set<string>();
  for (const parte of lotes(pastas.filter((p) => UUID.test(p)), 200)) {
    const { data: registros, error } = await servico.from(def.tabela).select("id").in("id", parte);
    if (error) throw new Error(`ler ${def.tabela}: ${resumoErro(error).message}`);
    for (const r of registros) existentes.add(r.id);
    const ids = registros.map((r) => r.id);
    if (!ids.length) continue;
    const { data: fotos, error: erroFotos } =
      def.fotos === "pedido_fotos"
        ? await servico.from("pedido_fotos").select("path").in("pedido_id", ids)
        : await servico.from("consignacao_fotos").select("path").in("consignacao_id", ids);
    if (erroFotos) throw new Error(`ler ${def.fotos}: ${resumoErro(erroFotos).message}`);
    for (const f of fotos) registradas.add(f.path);
  }

  const apagar: string[] = [];
  for (const pasta of pastas) {
    for (const arquivo of await listar(servico, def.bucket, pasta)) {
      const caminho = `${pasta}/${arquivo.name}`;
      const antigo = arquivo.created_at !== null && Date.parse(arquivo.created_at) < limite;
      if (arquivo.id !== null && antigo && (!existentes.has(pasta) || !registradas.has(caminho))) apagar.push(caminho);
    }
  }
  for (const parte of lotes(apagar, 100)) {
    const { error } = await servico.storage.from(def.bucket).remove(parte);
    if (error) throw new Error(`apagar ${def.bucket}: ${resumoErro(error).message}`);
  }
  return apagar.length;
}

export async function GET(request: Request) {
  if (!autorizado(request)) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const servico = clienteServico();
  const resultado = { simulacoesLimpas: 0, fotosApagadas: { consignacoes: 0, trocas: 0 }, erros: [] as string[] };

  // 1. LGPD: só as que ainda têm os dados (índice simulacoes_limpeza_idx).
  const agora = new Date();
  const { data: limpas, error } = await servico
    .from("simulacoes")
    .update({ cpf: null, nascimento: null, renda: null, dados_sensiveis_apagados_em: agora.toISOString() })
    .lt("created_at", limiteDadosSensiveis(agora).toISOString())
    .is("dados_sensiveis_apagados_em", null)
    .select("id");
  if (error) {
    console.error("limpeza simulacoes", resumoErro(error));
    resultado.erros.push("simulacoes");
  } else resultado.simulacoesLimpas = limpas.length;

  // 2. Hash do IP dos limites de envio: só serve por 24 h (a política de privacidade promete até 2 dias).
  const { error: erroLimites } = await servico
    .from("limites_envio")
    .delete()
    .lt("criado_em", new Date(agora.getTime() - DIA_MS).toISOString());
  if (erroLimites) {
    console.error("limpeza limites_envio", resumoErro(erroLimites));
    resultado.erros.push("limites_envio");
  }

  // 3. Envios abandonados nos buckets privados.
  for (const def of BUCKETS) {
    try {
      resultado.fotosApagadas[def.bucket] = await limparBucket(servico, def);
    } catch (e) {
      console.error("limpeza", def.bucket, resumoErro(e));
      resultado.erros.push(def.bucket);
    }
  }

  return NextResponse.json(resultado, { status: resultado.erros.length ? 500 : 200 });
}
