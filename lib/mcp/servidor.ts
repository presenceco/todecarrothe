import "server-only";
import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { lerCatalogoAgora, lerVeiculoAgora, precosNoCatalogoAgora } from "@/lib/catalogo/consultas";
import { urlVeiculo } from "@/lib/catalogo/interesse";
import { anoAtual, moeda } from "@/lib/formato";
import { loja } from "@/lib/loja";
import { resumoErro } from "@/lib/log";
import { buscar, detalheVeiculo, panoramaEstoque, resumoVeiculo, slugDe } from "./estoque";

/**
 * Ferramentas do servidor MCP do estoque (rota /api/mcp), usadas pelo agente Fco da SendPulse no WhatsApp.
 *
 * Fonte: a tabela `veiculos` do Supabase, lida a cada chamada (sem cache) com a chave pública. O RLS só deixa
 * a chave pública ver veículos disponíveis e publicados: reservado, vendido, rascunho ou apagado nunca aparece.
 * Tudo aqui é só leitura e só traz o que o catálogo público já mostra (nada de dados de clientes).
 */

export const INSTRUCOES = [
  `Estoque de seminovos da ${loja.nome} (${loja.cidade}), lido do site em tempo real.`,
  "Só aparecem veículos disponíveis para venda.",
  "Nunca informe preço, quilometragem, equipamento ou disponibilidade de memória: consulte as ferramentas.",
  "Antes de confirmar que um carro ainda está à venda, use verificar_disponibilidade.",
  "Se um veículo não aparecer, ele foi vendido, reservado ou retirado do site.",
  "Envie o link do anúncio para o cliente ver as fotos.",
].join("\n");

// ---------- Esquemas das respostas (structuredContent) ----------

const veiculoResumo = z.object({
  id: z.string().describe("Identificador do anúncio. Use em detalhar_veiculo e verificar_disponibilidade."),
  nome: z.string().describe("Marca, modelo e versão."),
  marca: z.string(),
  modelo: z.string(),
  versao: z.string(),
  ano: z.string().describe("Ano de fabricação/modelo, ex.: 2022/2023."),
  ano_fabricacao: z.number(),
  ano_modelo: z.number(),
  km: z.number(),
  km_texto: z.string(),
  cambio: z.string(),
  combustivel: z.string(),
  categoria: z.string().describe("Hatch, Sedã, SUV ou Picape."),
  cor: z.string(),
  preco: z.number().describe("Preço anunciado, em reais."),
  preco_texto: z.string().describe("Preço formatado, ex.: R$ 89.900."),
  etiqueta: z.string().nullable().describe("Destaque do anúncio (ex.: Baixa km), se houver."),
  foto_capa: z.string().nullable().describe("URL da foto principal."),
  link: z.string().describe("Link do anúncio no site."),
});

const veiculoDetalhe = veiculoResumo.extend({
  motorizacao: z.string().nullable().describe("Cilindrada tirada do nome da versão (ex.: 2.0). null quando a versão não informa."),
  final_placa: z.string().nullable(),
  equipamentos: z.array(z.string()).describe("Opcionais e equipamentos cadastrados."),
  selos: z.array(z.string()).describe("Selos verificados pela loja (ex.: IPVA pago, Único dono)."),
  fotos: z.array(z.string()).describe("URLs de todas as fotos, na ordem do anúncio."),
  total_fotos: z.number(),
  publicado_em: z.string().nullable(),
});

const momento = z.string().describe("Data e hora da consulta (ISO 8601).");

// ---------- Parâmetros ----------

const ORDENS = ["recentes", "menor-preco", "maior-preco", "menor-km"] as const;
const ordem = z.enum(ORDENS).optional().describe("Ordem: recentes (padrão), menor-preco, maior-preco ou menor-km.");
const reais = z.number().nonnegative().max(10_000_000);
const ano = z.number().int().min(1950).max(2100);

const parametrosBusca = z.object({
  texto: z.string().max(80).optional().describe("Busca livre no nome do carro (marca, modelo e versão), ex.: 'corolla xei'."),
  marca: z.string().max(40).optional().describe("Marca ou parte dela, ex.: Toyota, VW, Chevrolet."),
  modelo: z.string().max(40).optional().describe("Modelo ou parte dele, ex.: Onix, Hilux, Compass."),
  versao: z.string().max(40).optional().describe("Versão ou parte dela, ex.: LTZ, XEi, Limited."),
  categoria: z.enum(["hatch", "seda", "suv", "picape"]).optional().describe("Categoria (carroceria): hatch, seda (sedã), suv ou picape."),
  preco_min: reais.optional().describe("Preço mínimo em reais."),
  preco_max: reais.optional().describe("Preço máximo em reais."),
  ano_min: ano.optional().describe("Ano-modelo mínimo."),
  ano_max: ano.optional().describe("Ano-modelo máximo."),
  km_max: z.number().int().nonnegative().optional().describe("Quilometragem máxima."),
  cambio: z.enum(["automatico", "manual"]).optional(),
  combustivel: z.enum(["flex", "gasolina", "diesel", "hibrido"]).optional(),
  ordem,
  limite: z.number().int().min(1).max(30).optional().describe("Quantos veículos devolver (padrão 10, máximo 30)."),
});

const idVeiculo = z.string().min(3).max(300);

// ---------- Respostas ----------

/** Resposta estruturada + o mesmo JSON em texto (clientes que só leem `content`). */
function resposta<T extends Record<string, unknown>>(dados: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(dados) }], structuredContent: dados };
}

function falha(ferramenta: string, erro: unknown) {
  console.error(`mcp ${ferramenta}`, resumoErro(erro));
  return {
    isError: true,
    content: [{ type: "text" as const, text: "Não foi possível consultar o estoque agora. Tente de novo em instantes." }],
  };
}

const SO_LEITURA = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export function registrarFerramentas(server: McpServer) {
  server.registerTool(
    "buscar_veiculos",
    {
      title: "Buscar veículos",
      description:
        "Busca veículos disponíveis no estoque por marca, modelo, versão, categoria, faixa de preço, ano, km, câmbio e combustível. " +
        "Todos os filtros são opcionais e se combinam. Devolve preço, fotos de capa e link de cada anúncio.",
      inputSchema: parametrosBusca,
      outputSchema: z.object({
        total_encontrado: z.number(),
        mostrando: z.number(),
        veiculos: z.array(veiculoResumo),
        consultado_em: momento,
      }),
      annotations: SO_LEITURA,
    },
    async (p) => {
      try {
        const encontrados = buscar(await lerCatalogoAgora(), {
          texto: p.texto,
          marca: p.marca,
          modelo: p.modelo,
          versao: p.versao,
          categoria: p.categoria,
          precoMin: p.preco_min,
          precoMax: p.preco_max,
          anoMin: p.ano_min,
          anoMax: p.ano_max,
          kmMax: p.km_max,
          cambio: p.cambio,
          combustivel: p.combustivel,
          ordem: p.ordem,
        });
        const veiculos = encontrados.slice(0, p.limite ?? 10).map(resumoVeiculo);
        return resposta({
          total_encontrado: encontrados.length,
          mostrando: veiculos.length,
          veiculos,
          consultado_em: new Date().toISOString(),
        });
      } catch (e) {
        return falha("buscar_veiculos", e);
      }
    },
  );

  server.registerTool(
    "listar_estoque",
    {
      title: "Listar estoque",
      description:
        "Estoque atualizado: total de veículos disponíveis, quantos de cada marca e categoria, faixa de preço e a lista de veículos. " +
        "Use para perguntas gerais como 'quais carros vocês têm?'.",
      inputSchema: z.object({
        ordem,
        limite: z.number().int().min(1).max(50).optional().describe("Quantos veículos listar (padrão 20, máximo 50)."),
      }),
      outputSchema: z.object({
        total: z.number(),
        marcas: z.array(z.object({ marca: z.string(), total: z.number() })),
        categorias: z.array(z.object({ categoria: z.string(), total: z.number() })),
        faixa_preco: z.object({ menor: z.number(), maior: z.number(), menor_texto: z.string(), maior_texto: z.string() }).nullable(),
        mostrando: z.number(),
        veiculos: z.array(veiculoResumo),
        consultado_em: momento,
      }),
      annotations: SO_LEITURA,
    },
    async (p) => {
      try {
        const catalogo = await lerCatalogoAgora();
        const veiculos = buscar(catalogo, { ordem: p.ordem }).slice(0, p.limite ?? 20).map(resumoVeiculo);
        return resposta({
          ...panoramaEstoque(catalogo),
          mostrando: veiculos.length,
          veiculos,
          consultado_em: new Date().toISOString(),
        });
      } catch (e) {
        return falha("listar_estoque", e);
      }
    },
  );

  server.registerTool(
    "detalhar_veiculo",
    {
      title: "Detalhar veículo",
      description:
        "Ficha completa de um veículo: quilometragem, ano, motorização, câmbio, combustível, cor, equipamentos, selos, preço, " +
        "todas as fotos e o link do anúncio. Aceita o id devolvido pela busca ou o link do anúncio enviado pelo cliente.",
      inputSchema: z.object({
        id: idVeiculo.describe("id do veículo (ex.: toyota-corolla-xei-2-0-2023) ou o link do anúncio."),
      }),
      outputSchema: z.object({
        disponivel: z.boolean(),
        mensagem: z.string().nullable(),
        veiculo: veiculoDetalhe.nullable(),
        consultado_em: momento,
      }),
      annotations: SO_LEITURA,
    },
    async ({ id }) => {
      try {
        const slug = slugDe(id);
        const veiculo = slug ? await lerVeiculoAgora(slug) : null;
        return resposta({
          disponivel: !!veiculo,
          mensagem: veiculo
            ? null
            : "Este veículo não está mais disponível no site (vendido, reservado ou retirado). Ofereça outras opções com buscar_veiculos.",
          veiculo: veiculo ? detalheVeiculo(veiculo, anoAtual()) : null,
          consultado_em: new Date().toISOString(),
        });
      } catch (e) {
        return falha("detalhar_veiculo", e);
      }
    },
  );

  server.registerTool(
    "verificar_disponibilidade",
    {
      title: "Verificar disponibilidade",
      description:
        "Confere, no momento da pergunta, se um ou mais veículos continuam à venda e qual o preço atual. " +
        "Use sempre antes de confirmar ao cliente que um carro está disponível.",
      inputSchema: z.object({
        ids: z.array(idVeiculo).min(1).max(10).describe("ids dos veículos ou links dos anúncios (até 10)."),
      }),
      outputSchema: z.object({
        veiculos: z.array(
          z.object({
            id: z.string(),
            disponivel: z.boolean(),
            preco: z.number().nullable(),
            preco_texto: z.string().nullable(),
            link: z.string().nullable(),
          }),
        ),
        consultado_em: momento,
      }),
      annotations: SO_LEITURA,
    },
    async ({ ids }) => {
      try {
        const pedidos = ids.map((id) => ({ id, slug: slugDe(id) }));
        const precos = await precosNoCatalogoAgora([...new Set(pedidos.flatMap((p) => (p.slug ? [p.slug] : [])))]);
        return resposta({
          veiculos: pedidos.map(({ id, slug }) => {
            const preco = slug ? precos.get(slug) : undefined;
            return preco === undefined
              ? { id, disponivel: false, preco: null, preco_texto: null, link: null }
              : { id: slug!, disponivel: true, preco, preco_texto: moeda(preco), link: urlVeiculo(slug!) };
          }),
          consultado_em: new Date().toISOString(),
        });
      } catch (e) {
        return falha("verificar_disponibilidade", e);
      }
    },
  );
}
