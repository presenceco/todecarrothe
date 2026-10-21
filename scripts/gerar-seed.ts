/**
 * Gera supabase/seed.sql a partir de scripts/seed/dados.ts.
 * O SQL é idempotente: rodar de novo não duplica nada (on conflict / "só se a tabela estiver vazia").
 *
 * Uso: npm run db:gerar-seed
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { completarCpf } from "../lib/cpf.ts";
import { CONSENTIMENTO_VERSAO } from "../lib/consentimento.ts";
import { slugVeiculo } from "../lib/slug.ts";
import { CONSIGNACOES, OPCIONAIS, PEDIDOS, SELOS, SIMULACOES, VEICULOS } from "./seed/dados.ts";

const destino = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));

/** Literal SQL: texto entre aspas simples (com escape), número, booleano ou null. */
function sql(valor: string | number | boolean | null | readonly string[]): string {
  if (valor === null) return "null";
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "boolean") return valor ? "true" : "false";
  if (Array.isArray(valor)) return `array[${valor.map((v) => sql(v)).join(", ")}]::text[]`;
  return `'${String(valor).replaceAll("'", "''")}'`;
}

const linhas = (tuplas: (string | number | boolean | null | readonly string[])[][]) =>
  tuplas.map((t) => `  (${t.map(sql).join(", ")})`).join(",\n");

const slugs = VEICULOS.map((v) => slugVeiculo(v.marca, v.modelo, v.versao, v.mod));
const repetidos = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (repetidos.length) throw new Error(`Slugs repetidos no seed: ${repetidos.join(", ")}`);

const disponiveis = VEICULOS.filter((v) => v.status === "disponivel").length;
console.log(`${VEICULOS.length} veículos (${disponiveis} disponíveis), ${PEDIDOS.length} pedidos, ${SIMULACOES.length} simulações, ${CONSIGNACOES.length} consignações`);

const partes: string[] = [];

partes.push(`-- GERADO por scripts/gerar-seed.ts a partir de scripts/seed/dados.ts. Não edite à mão.
-- Dados FICTÍCIOS de desenvolvimento (telas de aprovação). As fotos entram com npm run db:fotos.

begin;`);

partes.push(`-- Opcionais (ordem da lista padrão das telas)
insert into public.opcionais (nome, ordem) values
${linhas(OPCIONAIS.map((nome, i) => [nome, i]))}
on conflict (nome) do nothing;`);

partes.push(`-- Veículos
insert into public.veiculos
  (slug, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, cor, combustivel, tipo, final_placa, preco,
   status, publicado, publicado_em, etiqueta, selos, created_at, updated_at)
values
${VEICULOS.map(
  (v, i) =>
    `  (${[
      slugs[i],
      v.marca,
      v.modelo,
      v.versao,
      v.fab,
      v.mod,
      v.km,
      v.cambio,
      v.cor,
      v.combustivel,
      v.tipo,
      v.placa,
      v.preco,
      v.status,
      true,
    ]
      .map(sql)
      .join(", ")}, ${sql(v.publicado)}::timestamptz, ${sql(v.etiqueta)}, ${sql(v.selos.map((s) => SELOS[s]))}, ${sql(v.criado)}::timestamptz, ${sql(v.criado)}::timestamptz)`,
).join(",\n")}
on conflict (slug) do nothing;`);

partes.push(`-- Opcionais de cada veículo
insert into public.veiculo_opcionais (veiculo_id, opcional_id)
select v.id, o.id
from (values
${linhas(VEICULOS.flatMap((v, i) => v.opcionais.map((o) => [slugs[i], OPCIONAIS[o]])))}
) as x (slug, nome)
join public.veiculos v on v.slug = x.slug
join public.opcionais o on o.nome = x.nome
on conflict do nothing;`);

partes.push(`-- Pedidos de busca (só se a tabela estiver vazia)
insert into public.pedidos_busca
  (nome, whatsapp, marca_modelo, ano_minimo, faixa_preco, pagamento, tem_troca, troca_modelo, troca_ano,
   anotacoes, consentimento_em, consentimento_versao, status, created_at, updated_at)
select nome, whatsapp, marca_modelo, ano_minimo, faixa_preco, pagamento, tem_troca, troca_modelo, troca_ano,
       '', quando::timestamptz, ${sql(CONSENTIMENTO_VERSAO)}, status, quando::timestamptz, quando::timestamptz
from (values
${linhas(
  PEDIDOS.map((p) => [p.nome, p.whatsapp, p.marcaModelo, p.anoMinimo, p.faixa, p.pagamento, !!p.troca, p.troca?.modelo ?? null, p.troca?.ano ?? null, p.status, p.quando]),
)}
) as x (nome, whatsapp, marca_modelo, ano_minimo, faixa_preco, pagamento, tem_troca, troca_modelo, troca_ano, status, quando)
where not exists (select 1 from public.pedidos_busca);`);

partes.push(`-- Simulações, com o retrato do veículo no momento do envio (só se a tabela estiver vazia)
insert into public.simulacoes
  (veiculo_id, veiculo_nome, veiculo_preco, nome, cpf, nascimento, whatsapp, renda, entrada, prazo_meses,
   tem_troca, troca_modelo, troca_ano, possui_cnh, consentimento_em, consentimento_versao, status, created_at, updated_at)
select v.id, x.veiculo_nome, x.veiculo_preco, x.nome, x.cpf, x.nascimento::date, x.whatsapp, x.renda, x.entrada, x.prazo,
       x.tem_troca, x.troca_modelo, x.troca_ano, x.cnh, x.quando::timestamptz, ${sql(CONSENTIMENTO_VERSAO)}, x.status,
       x.quando::timestamptz, x.quando::timestamptz
from (values
${linhas(
  SIMULACOES.map((s) => {
    const v = VEICULOS[s.veiculo];
    return [
      slugs[s.veiculo],
      `${v.marca} ${v.modelo} ${v.versao}`,
      v.preco,
      s.nome,
      completarCpf(s.cpfBase),
      s.nascimento,
      s.whatsapp,
      s.renda,
      s.entrada,
      s.prazo,
      !!s.troca,
      s.troca?.modelo ?? null,
      s.troca?.ano ?? null,
      s.cnh,
      s.status,
      s.quando,
    ];
  }),
)}
) as x (slug, veiculo_nome, veiculo_preco, nome, cpf, nascimento, whatsapp, renda, entrada, prazo,
        tem_troca, troca_modelo, troca_ano, cnh, status, quando)
left join public.veiculos v on v.slug = x.slug
where not exists (select 1 from public.simulacoes);`);

partes.push(`-- Consignações (só se a tabela estiver vazia)
insert into public.consignacoes
  (forma_venda, marca, modelo, versao, ano_fabricacao, ano_modelo, km, cambio, cor, quitado, valor_pretendido,
   detalhes, nome, whatsapp, anotacoes, consentimento_em, consentimento_versao, status, created_at, updated_at)
select forma, marca, modelo, versao, fab, modelo_ano, km, cambio, cor, quitado, valor, detalhes, nome, whatsapp,
       anotacoes, quando::timestamptz, ${sql(CONSENTIMENTO_VERSAO)}, status, quando::timestamptz, quando::timestamptz
from (values
${linhas(
  CONSIGNACOES.map((c) => [c.forma, c.marca, c.modelo, c.versao, c.fab, c.mod, c.km, c.cambio, c.cor, c.quitado, c.valor, c.detalhes, c.nome, c.whatsapp, c.anotacoes, c.status, c.quando]),
)}
) as x (forma, marca, modelo, versao, fab, modelo_ano, km, cambio, cor, quitado, valor, detalhes, nome, whatsapp,
        anotacoes, status, quando)
where not exists (select 1 from public.consignacoes);`);

partes.push("commit;\n");

await writeFile(destino, partes.join("\n\n"));
console.log(`→ ${destino}`);
