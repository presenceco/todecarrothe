/**
 * Dados FICTÍCIOS de desenvolvimento (seed). Vieram das telas de aprovação e foram completados para
 * 38 veículos. Não vão para produção. O SQL é gerado por `npm run db:gerar-seed`.
 *
 * Ordens (resolve a inconsistência 3 do plano):
 * - created_at decrescente = ordem do estoque no admin (tela 27: Corolla, Compass, Strada, T-Cross, HB20, Onix, HR-V, Kwid);
 * - publicado_em decrescente = ordem "Mais recentes" do catálogo (telas 01/21: Corolla, Tracker, Strada, T-Cross, Onix, Pulse, Yaris, Kwid).
 */

/** Lista padrão de opcionais comuns (aprovada pelo cliente em 24/10/2026), na ordem do painel. */
export const OPCIONAIS = [
  "Ar-condicionado",
  "Direção hidráulica",
  "Direção elétrica",
  "Vidros elétricos",
  "Travas elétricas",
  "Retrovisores elétricos",
  "Alarme",
  "Central multimídia",
  "Bluetooth",
  "Volante multifuncional",
  "Computador de bordo",
  "Piloto automático",
  "Câmera de ré",
  "Sensor de estacionamento",
  "Airbags",
  "Freios ABS",
  "Controle de estabilidade",
  "Faróis de LED",
  "Faróis de neblina",
  "Rodas de liga leve",
  "Rodas com calotas",
  "Bancos em couro",
  "Bancos em tecido",
  "Chave presencial",
  "Partida por botão",
  "Teto solar",
] as const;

export const SELOS = ["ipva_pago", "unico_dono", "revisoes_em_dia", "chave_reserva", "manual"] as const;

export type VeiculoSeed = {
  marca: string;
  modelo: string;
  versao: string;
  fab: number;
  mod: number;
  km: number;
  cambio: "automatico" | "manual";
  cor: string;
  combustivel: "flex" | "gasolina" | "diesel" | "hibrido";
  tipo: "hatch" | "seda" | "suv" | "picape";
  placa: string;
  preco: number;
  status: "disponivel" | "reservado" | "vendido";
  etiqueta: "nenhuma" | "destaque" | "novidade" | "baixa_km";
  fotos: number;
  /** ISO com fuso de Teresina. */
  criado: string;
  publicado: string;
  /** Índices em SELOS. */
  selos: number[];
  /** Índices em OPCIONAIS. */
  opcionais: number[];
};

const TODOS_SELOS = [0, 1, 2, 3, 4];
// Mesmos opcionais de antes da lista comum (renomeados no lugar pela migration de 24/10/2026).
const OPC_COMPLETO = [0, 2, 7, 12, 13, 21, 11, 17, 19, 23, 24, 14, 16, 5];
const OPC_BASICO = [0, 2, 12, 14, 16];
const OPC_MEDIO = [0, 2, 7, 12, 13, 19, 14, 16, 5];
const OPC_TOPO = [0, 2, 7, 12, 13, 21, 17, 19, 23, 24, 14, 16, 5];
const TETO_SOLAR = 25;

export const VEICULOS: VeiculoSeed[] = [
  // Os 11 das telas
  { marca: "Toyota", modelo: "Corolla", versao: "XEi 2.0", fab: 2022, mod: 2023, km: 38000, cambio: "automatico", cor: "Prata", combustivel: "flex", tipo: "seda", placa: "4", preco: 129900, status: "disponivel", etiqueta: "destaque", fotos: 12, criado: "2026-10-16T10:00:00-03:00", publicado: "2026-10-16T10:05:00-03:00", selos: TODOS_SELOS, opcionais: OPC_COMPLETO },
  { marca: "Jeep", modelo: "Compass", versao: "Longitude 1.3T", fab: 2021, mod: 2022, km: 52000, cambio: "automatico", cor: "Branco", combustivel: "flex", tipo: "suv", placa: "7", preco: 134900, status: "reservado", etiqueta: "novidade", fotos: 14, criado: "2026-10-15T16:00:00-03:00", publicado: "2026-10-15T16:05:00-03:00", selos: [0, 2, 3], opcionais: OPC_TOPO },
  { marca: "Fiat", modelo: "Strada", versao: "Volcano 1.3", fab: 2023, mod: 2023, km: 21000, cambio: "manual", cor: "Vermelho", combustivel: "flex", tipo: "picape", placa: "2", preco: 104900, status: "disponivel", etiqueta: "baixa_km", fotos: 10, criado: "2026-10-15T10:00:00-03:00", publicado: "2026-10-15T10:05:00-03:00", selos: [0, 1, 2], opcionais: OPC_MEDIO },
  { marca: "Volkswagen", modelo: "T-Cross", versao: "Comfortline 1.0 TSI", fab: 2022, mod: 2022, km: 41000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "suv", placa: "9", preco: 116900, status: "disponivel", etiqueta: "nenhuma", fotos: 11, criado: "2026-10-14T15:00:00-03:00", publicado: "2026-10-14T15:05:00-03:00", selos: [0, 2, 4], opcionais: OPC_TOPO },
  { marca: "Hyundai", modelo: "HB20", versao: "Comfort 1.0", fab: 2021, mod: 2022, km: 47000, cambio: "manual", cor: "Branco", combustivel: "flex", tipo: "hatch", placa: "1", preco: 69900, status: "vendido", etiqueta: "nenhuma", fotos: 9, criado: "2026-10-14T09:00:00-03:00", publicado: "2026-10-14T09:05:00-03:00", selos: [0, 1], opcionais: OPC_BASICO },
  { marca: "Chevrolet", modelo: "Onix", versao: "LT 1.0 Turbo", fab: 2022, mod: 2023, km: 33000, cambio: "automatico", cor: "Preto", combustivel: "flex", tipo: "hatch", placa: "5", preco: 82900, status: "disponivel", etiqueta: "novidade", fotos: 12, criado: "2026-10-13T17:00:00-03:00", publicado: "2026-10-13T17:05:00-03:00", selos: [0, 1, 2, 3], opcionais: OPC_MEDIO },
  { marca: "Honda", modelo: "HR-V", versao: "EXL 1.8", fab: 2020, mod: 2020, km: 64000, cambio: "automatico", cor: "Azul", combustivel: "flex", tipo: "suv", placa: "3", preco: 109900, status: "reservado", etiqueta: "nenhuma", fotos: 10, criado: "2026-10-13T11:00:00-03:00", publicado: "2026-10-13T11:05:00-03:00", selos: [0, 2], opcionais: OPC_TOPO },
  { marca: "Renault", modelo: "Kwid", versao: "Zen 1.0", fab: 2023, mod: 2024, km: 15000, cambio: "manual", cor: "Laranja", combustivel: "flex", tipo: "hatch", placa: "8", preco: 57900, status: "disponivel", etiqueta: "baixa_km", fotos: 8, criado: "2026-10-12T15:00:00-03:00", publicado: "2026-10-12T15:05:00-03:00", selos: [0, 1, 2, 3, 4], opcionais: OPC_BASICO },
  { marca: "Chevrolet", modelo: "Tracker", versao: "LT 1.0 Turbo", fab: 2022, mod: 2023, km: 36000, cambio: "automatico", cor: "Branco", combustivel: "flex", tipo: "suv", placa: "6", preco: 112900, status: "disponivel", etiqueta: "novidade", fotos: 12, criado: "2026-10-05T10:00:00-03:00", publicado: "2026-10-15T18:00:00-03:00", selos: [0, 2, 3], opcionais: OPC_TOPO },
  { marca: "Fiat", modelo: "Pulse", versao: "Drive 1.3", fab: 2023, mod: 2023, km: 24000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "suv", placa: "0", preco: 89900, status: "disponivel", etiqueta: "nenhuma", fotos: 10, criado: "2026-10-04T10:00:00-03:00", publicado: "2026-10-13T09:00:00-03:00", selos: [0, 1], opcionais: OPC_MEDIO },
  { marca: "Toyota", modelo: "Yaris", versao: "XL 1.5", fab: 2021, mod: 2022, km: 44000, cambio: "automatico", cor: "Prata", combustivel: "flex", tipo: "hatch", placa: "3", preco: 84900, status: "disponivel", etiqueta: "nenhuma", fotos: 9, criado: "2026-10-03T10:00:00-03:00", publicado: "2026-10-12T18:00:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },

  // Completam os 31 disponíveis (contagens por marca da tela 21)
  { marca: "Toyota", modelo: "Hilux", versao: "SRV 2.8 Diesel 4x4", fab: 2021, mod: 2021, km: 78000, cambio: "automatico", cor: "Preto", combustivel: "diesel", tipo: "picape", placa: "5", preco: 229900, status: "disponivel", etiqueta: "destaque", fotos: 14, criado: "2026-10-02T10:00:00-03:00", publicado: "2026-10-02T10:05:00-03:00", selos: [0, 2, 3, 4], opcionais: OPC_TOPO },
  { marca: "Toyota", modelo: "Corolla Cross", versao: "XRX 1.8 Hybrid", fab: 2022, mod: 2023, km: 29000, cambio: "automatico", cor: "Branco", combustivel: "hibrido", tipo: "suv", placa: "1", preco: 169900, status: "disponivel", etiqueta: "nenhuma", fotos: 13, criado: "2026-10-01T10:00:00-03:00", publicado: "2026-10-01T10:05:00-03:00", selos: TODOS_SELOS, opcionais: [...OPC_TOPO, TETO_SOLAR] },
  { marca: "Toyota", modelo: "Etios", versao: "X Plus 1.5", fab: 2020, mod: 2021, km: 58000, cambio: "manual", cor: "Prata", combustivel: "flex", tipo: "hatch", placa: "7", preco: 62900, status: "disponivel", etiqueta: "nenhuma", fotos: 7, criado: "2026-09-30T10:00:00-03:00", publicado: "2026-09-30T10:05:00-03:00", selos: [0], opcionais: OPC_BASICO },
  { marca: "Jeep", modelo: "Renegade", versao: "Longitude 1.8", fab: 2020, mod: 2021, km: 61000, cambio: "automatico", cor: "Vermelho", combustivel: "flex", tipo: "suv", placa: "2", preco: 94900, status: "disponivel", etiqueta: "nenhuma", fotos: 10, criado: "2026-09-29T10:00:00-03:00", publicado: "2026-09-29T10:05:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },
  { marca: "Jeep", modelo: "Commander", versao: "Limited 1.3 T270", fab: 2022, mod: 2023, km: 27000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "suv", placa: "8", preco: 199900, status: "disponivel", etiqueta: "novidade", fotos: 14, criado: "2026-09-28T10:00:00-03:00", publicado: "2026-09-28T10:05:00-03:00", selos: TODOS_SELOS, opcionais: [...OPC_COMPLETO, TETO_SOLAR] },
  { marca: "Jeep", modelo: "Compass", versao: "Limited 2.0 Diesel 4x4", fab: 2021, mod: 2021, km: 69000, cambio: "automatico", cor: "Preto", combustivel: "diesel", tipo: "suv", placa: "4", preco: 164900, status: "disponivel", etiqueta: "nenhuma", fotos: 12, criado: "2026-09-27T10:00:00-03:00", publicado: "2026-09-27T10:05:00-03:00", selos: [0, 2, 3], opcionais: [...OPC_TOPO, TETO_SOLAR] },
  { marca: "Fiat", modelo: "Toro", versao: "Volcano 2.0 Diesel 4x4", fab: 2022, mod: 2022, km: 48000, cambio: "automatico", cor: "Branco", combustivel: "diesel", tipo: "picape", placa: "6", preco: 159900, status: "disponivel", etiqueta: "nenhuma", fotos: 12, criado: "2026-09-26T10:00:00-03:00", publicado: "2026-09-26T10:05:00-03:00", selos: [0, 1, 2], opcionais: OPC_TOPO },
  { marca: "Fiat", modelo: "Argo", versao: "Drive 1.0", fab: 2022, mod: 2023, km: 26000, cambio: "manual", cor: "Prata", combustivel: "flex", tipo: "hatch", placa: "9", preco: 69900, status: "disponivel", etiqueta: "nenhuma", fotos: 9, criado: "2026-09-25T10:00:00-03:00", publicado: "2026-09-25T10:05:00-03:00", selos: [0, 1], opcionais: OPC_BASICO },
  { marca: "Fiat", modelo: "Cronos", versao: "Drive 1.3", fab: 2021, mod: 2022, km: 39000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "seda", placa: "3", preco: 79900, status: "disponivel", etiqueta: "nenhuma", fotos: 9, criado: "2026-09-24T10:00:00-03:00", publicado: "2026-09-24T10:05:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },
  { marca: "Fiat", modelo: "Mobi", versao: "Like 1.0", fab: 2023, mod: 2023, km: 12000, cambio: "manual", cor: "Branco", combustivel: "flex", tipo: "hatch", placa: "0", preco: 54900, status: "disponivel", etiqueta: "baixa_km", fotos: 7, criado: "2026-09-23T10:00:00-03:00", publicado: "2026-09-23T10:05:00-03:00", selos: [0, 1, 3], opcionais: OPC_BASICO },
  { marca: "Volkswagen", modelo: "Nivus", versao: "Highline 1.0 TSI", fab: 2022, mod: 2023, km: 31000, cambio: "automatico", cor: "Azul", combustivel: "flex", tipo: "suv", placa: "5", preco: 129900, status: "disponivel", etiqueta: "novidade", fotos: 12, criado: "2026-09-22T10:00:00-03:00", publicado: "2026-09-22T10:05:00-03:00", selos: [0, 1, 2, 3], opcionais: OPC_TOPO },
  { marca: "Volkswagen", modelo: "Polo", versao: "Highline 1.0 TSI", fab: 2021, mod: 2022, km: 42000, cambio: "automatico", cor: "Vermelho", combustivel: "flex", tipo: "hatch", placa: "2", preco: 89900, status: "disponivel", etiqueta: "nenhuma", fotos: 10, criado: "2026-09-21T10:00:00-03:00", publicado: "2026-09-21T10:05:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },
  { marca: "Volkswagen", modelo: "Virtus", versao: "Comfortline 1.0 TSI", fab: 2020, mod: 2021, km: 55000, cambio: "automatico", cor: "Prata", combustivel: "flex", tipo: "seda", placa: "6", preco: 84900, status: "disponivel", etiqueta: "nenhuma", fotos: 9, criado: "2026-09-20T10:00:00-03:00", publicado: "2026-09-20T10:05:00-03:00", selos: [0], opcionais: OPC_MEDIO },
  { marca: "Volkswagen", modelo: "Saveiro", versao: "Robust 1.6", fab: 2021, mod: 2022, km: 47000, cambio: "manual", cor: "Branco", combustivel: "flex", tipo: "picape", placa: "1", preco: 74900, status: "disponivel", etiqueta: "nenhuma", fotos: 8, criado: "2026-09-19T10:00:00-03:00", publicado: "2026-09-19T10:05:00-03:00", selos: [0, 1], opcionais: OPC_BASICO },
  { marca: "Hyundai", modelo: "Creta", versao: "Limited 1.0 Turbo", fab: 2022, mod: 2023, km: 28000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "suv", placa: "7", preco: 124900, status: "disponivel", etiqueta: "nenhuma", fotos: 12, criado: "2026-09-18T10:00:00-03:00", publicado: "2026-09-18T10:05:00-03:00", selos: [0, 2, 3], opcionais: OPC_TOPO },
  { marca: "Hyundai", modelo: "HB20", versao: "Platinum 1.0 Turbo", fab: 2023, mod: 2023, km: 14000, cambio: "automatico", cor: "Branco", combustivel: "flex", tipo: "hatch", placa: "4", preco: 92900, status: "disponivel", etiqueta: "baixa_km", fotos: 11, criado: "2026-09-17T10:00:00-03:00", publicado: "2026-09-17T10:05:00-03:00", selos: [0, 1, 2], opcionais: OPC_MEDIO },
  { marca: "Hyundai", modelo: "HB20S", versao: "Comfort Plus 1.0", fab: 2020, mod: 2021, km: 62000, cambio: "manual", cor: "Prata", combustivel: "flex", tipo: "seda", placa: "8", preco: 67900, status: "disponivel", etiqueta: "nenhuma", fotos: 8, criado: "2026-09-16T10:00:00-03:00", publicado: "2026-09-16T10:05:00-03:00", selos: [0], opcionais: OPC_BASICO },
  { marca: "Hyundai", modelo: "Tucson", versao: "GLS 1.6 Turbo", fab: 2019, mod: 2020, km: 74000, cambio: "automatico", cor: "Preto", combustivel: "gasolina", tipo: "suv", placa: "0", preco: 119900, status: "disponivel", etiqueta: "nenhuma", fotos: 11, criado: "2026-09-15T10:00:00-03:00", publicado: "2026-09-15T10:05:00-03:00", selos: [0, 2], opcionais: [...OPC_TOPO, TETO_SOLAR] },
  { marca: "Chevrolet", modelo: "S10", versao: "LTZ 2.8 Diesel 4x4", fab: 2020, mod: 2021, km: 89000, cambio: "automatico", cor: "Prata", combustivel: "diesel", tipo: "picape", placa: "9", preco: 189900, status: "disponivel", etiqueta: "nenhuma", fotos: 13, criado: "2026-09-14T10:00:00-03:00", publicado: "2026-09-14T10:05:00-03:00", selos: [0, 2, 4], opcionais: OPC_TOPO },
  { marca: "Chevrolet", modelo: "Onix Plus", versao: "Premier 1.0 Turbo", fab: 2022, mod: 2023, km: 30000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "seda", placa: "3", preco: 99900, status: "disponivel", etiqueta: "nenhuma", fotos: 10, criado: "2026-09-13T10:00:00-03:00", publicado: "2026-09-13T10:05:00-03:00", selos: [0, 1, 2, 3], opcionais: OPC_TOPO },
  { marca: "Honda", modelo: "Civic", versao: "Touring 1.5 Turbo", fab: 2020, mod: 2020, km: 58000, cambio: "automatico", cor: "Preto", combustivel: "gasolina", tipo: "seda", placa: "5", preco: 139900, status: "disponivel", etiqueta: "nenhuma", fotos: 12, criado: "2026-09-12T10:00:00-03:00", publicado: "2026-09-12T10:05:00-03:00", selos: [0, 2, 3], opcionais: [...OPC_COMPLETO, TETO_SOLAR] },
  { marca: "Honda", modelo: "City", versao: "EXL 1.5", fab: 2022, mod: 2023, km: 26000, cambio: "automatico", cor: "Branco", combustivel: "flex", tipo: "seda", placa: "2", preco: 114900, status: "disponivel", etiqueta: "nenhuma", fotos: 10, criado: "2026-09-11T10:00:00-03:00", publicado: "2026-09-11T10:05:00-03:00", selos: [0, 1, 2], opcionais: OPC_TOPO },
  { marca: "Renault", modelo: "Duster", versao: "Iconic 1.3 TCe", fab: 2022, mod: 2023, km: 34000, cambio: "automatico", cor: "Cinza", combustivel: "flex", tipo: "suv", placa: "6", preco: 109900, status: "disponivel", etiqueta: "nenhuma", fotos: 11, criado: "2026-09-10T10:00:00-03:00", publicado: "2026-09-10T10:05:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },

  // Reservados e vendidos (escondidos do catálogo)
  { marca: "Volkswagen", modelo: "Amarok", versao: "Highline 3.0 V6 4x4", fab: 2020, mod: 2021, km: 82000, cambio: "automatico", cor: "Cinza", combustivel: "diesel", tipo: "picape", placa: "7", preco: 239900, status: "reservado", etiqueta: "nenhuma", fotos: 13, criado: "2026-09-09T10:00:00-03:00", publicado: "2026-09-09T10:05:00-03:00", selos: [0, 2, 3], opcionais: OPC_TOPO },
  { marca: "Fiat", modelo: "Fastback", versao: "Impetus 1.0 Turbo", fab: 2023, mod: 2024, km: 16000, cambio: "automatico", cor: "Vermelho", combustivel: "flex", tipo: "suv", placa: "3", preco: 124900, status: "reservado", etiqueta: "novidade", fotos: 12, criado: "2026-09-08T10:00:00-03:00", publicado: "2026-09-08T10:05:00-03:00", selos: [0, 1, 2], opcionais: OPC_TOPO },
  { marca: "Chevrolet", modelo: "Cruze", versao: "LTZ 1.4 Turbo", fab: 2019, mod: 2019, km: 71000, cambio: "automatico", cor: "Prata", combustivel: "flex", tipo: "seda", placa: "1", preco: 89900, status: "vendido", etiqueta: "nenhuma", fotos: 9, criado: "2026-09-07T10:00:00-03:00", publicado: "2026-09-07T10:05:00-03:00", selos: [0, 2], opcionais: OPC_MEDIO },
  { marca: "Toyota", modelo: "Hilux", versao: "SR 2.8 Diesel 4x4", fab: 2019, mod: 2019, km: 112000, cambio: "manual", cor: "Branco", combustivel: "diesel", tipo: "picape", placa: "4", preco: 179900, status: "vendido", etiqueta: "nenhuma", fotos: 10, criado: "2026-09-06T10:00:00-03:00", publicado: "2026-09-06T10:05:00-03:00", selos: [0], opcionais: OPC_MEDIO },
];

export type PedidoSeed = {
  quando: string;
  nome: string;
  whatsapp: string;
  marcaModelo: string;
  anoMinimo: number;
  faixa: "ate_50" | "50_80" | "80_110" | "110_150" | "150_200" | "acima_200";
  pagamento: "a_vista" | "financiado";
  troca: { modelo: string; ano: number } | null;
  status: "novo" | "em_busca" | "encontrado" | "finalizado";
};

// Telas 16/29. Faixas fora da lista do item 9.6 foram trocadas pela mais próxima (inconsistência 1 do plano).
export const PEDIDOS: PedidoSeed[] = [
  { quando: "2026-10-17T09:40:00-03:00", nome: "Carlos Menezes", whatsapp: "86998124471", marcaModelo: "Toyota Hilux SRV", anoMinimo: 2020, faixa: "150_200", pagamento: "financiado", troca: { modelo: "VW Gol 1.6", ano: 2017 }, status: "novo" },
  { quando: "2026-10-16T18:20:00-03:00", nome: "Lucas Barbosa", whatsapp: "86991073358", marcaModelo: "Honda Civic", anoMinimo: 2019, faixa: "80_110", pagamento: "a_vista", troca: null, status: "novo" },
  { quando: "2026-10-16T11:05:00-03:00", nome: "Rafael Lima", whatsapp: "86994037765", marcaModelo: "Fiat Toro", anoMinimo: 2020, faixa: "110_150", pagamento: "financiado", troca: { modelo: "Fiat Strada Working 1.4", ano: 2018 }, status: "em_busca" },
  { quando: "2026-10-15T15:37:00-03:00", nome: "Juliana Sousa", whatsapp: "86981205538", marcaModelo: "Volkswagen Nivus", anoMinimo: 2022, faixa: "110_150", pagamento: "financiado", troca: null, status: "em_busca" },
  { quando: "2026-10-14T10:12:00-03:00", nome: "Antônio Carvalho", whatsapp: "86999770314", marcaModelo: "Chevrolet S10", anoMinimo: 2017, faixa: "110_150", pagamento: "a_vista", troca: { modelo: "Toyota Hilux CD 3.0", ano: 2012 }, status: "encontrado" },
  { quando: "2026-10-12T08:48:00-03:00", nome: "Mariana Alves", whatsapp: "86986112087", marcaModelo: "Hyundai Creta", anoMinimo: 2020, faixa: "80_110", pagamento: "financiado", troca: null, status: "finalizado" },
];

export type SimulacaoSeed = {
  quando: string;
  nome: string;
  /** 9 primeiros dígitos; os verificadores são calculados. */
  cpfBase: string;
  nascimento: string;
  whatsapp: string;
  /** Índice em VEICULOS. */
  veiculo: number;
  entrada: number;
  prazo: 24 | 36 | 48 | 60;
  renda: number;
  troca: { modelo: string; ano: number } | null;
  cnh: boolean;
  status: "nova" | "em_analise" | "aprovada" | "recusada";
};

// Telas 18/19/31/32. A Ana Paula tem o CPF 123.456.789-09, que aparece como ***.456.789-** nas telas.
export const SIMULACOES: SimulacaoSeed[] = [
  { quando: "2026-10-17T10:15:00-03:00", nome: "Ana Paula Rocha", cpfBase: "123456789", nascimento: "1991-03-12", whatsapp: "86988451290", veiculo: 0, entrada: 40000, prazo: 48, renda: 9500, troca: { modelo: "Fiat Argo Drive", ano: 2019 }, cnh: true, status: "nova" },
  { quando: "2026-10-17T08:51:00-03:00", nome: "José Ribeiro", cpfBase: "384920175", nascimento: "1986-07-22", whatsapp: "86991326608", veiculo: 5, entrada: 15000, prazo: 60, renda: 4800, troca: null, cnh: true, status: "nova" },
  { quando: "2026-10-16T19:02:00-03:00", nome: "Larissa Monteiro", cpfBase: "507318264", nascimento: "1994-11-03", whatsapp: "86987043315", veiculo: 3, entrada: 30000, prazo: 48, renda: 7200, troca: null, cnh: true, status: "nova" },
  { quando: "2026-10-16T14:30:00-03:00", nome: "Paulo Henrique Dias", cpfBase: "619283740", nascimento: "1979-05-14", whatsapp: "86995612049", veiculo: 2, entrada: 25000, prazo: 36, renda: 6000, troca: { modelo: "VW Gol 1.0", ano: 2014 }, cnh: true, status: "em_analise" },
  { quando: "2026-10-15T09:18:00-03:00", nome: "Raimunda Costa", cpfBase: "742061893", nascimento: "1968-09-30", whatsapp: "86982337790", veiculo: 8, entrada: 35000, prazo: 48, renda: 8000, troca: null, cnh: false, status: "em_analise" },
  { quando: "2026-10-14T16:44:00-03:00", nome: "Bruno Teixeira", cpfBase: "853197462", nascimento: "1990-01-25", whatsapp: "86998781126", veiculo: 10, entrada: 50000, prazo: 36, renda: 14000, troca: { modelo: "Honda Fit LX", ano: 2013 }, cnh: true, status: "aprovada" },
  { quando: "2026-10-13T11:27:00-03:00", nome: "Fernanda Lopes", cpfBase: "960485217", nascimento: "2001-06-08", whatsapp: "86984560931", veiculo: 7, entrada: 5000, prazo: 60, renda: 2600, troca: null, cnh: true, status: "recusada" },
];

export type ConsignacaoSeed = {
  quando: string;
  forma: "venda_direta" | "troca" | "consignacao";
  marca: string;
  modelo: string;
  versao: string;
  fab: number;
  mod: number;
  km: number;
  cambio: "automatico" | "manual";
  cor: string;
  quitado: boolean;
  valor: number | null;
  detalhes: string;
  nome: string;
  whatsapp: string;
  anotacoes: string;
  fotos: number;
  status: "nova" | "em_avaliacao" | "negocio_fechado" | "recusada";
};

// Telas 35–39 (sem HTML): 5 consignações, 2 novas; uma com negócio fechado para "Cadastrar no estoque".
export const CONSIGNACOES: ConsignacaoSeed[] = [
  { quando: "2026-10-17T11:30:00-03:00", forma: "consignacao", marca: "Toyota", modelo: "Corolla", versao: "GLi 1.8", fab: 2019, mod: 2020, km: 72000, cambio: "automatico", cor: "Prata", quitado: true, valor: 89000, detalhes: "Revisões na concessionária. Pneus trocados em agosto.", nome: "Marcos Vinícius Araújo", whatsapp: "86996542210", anotacoes: "", fotos: 6, status: "nova" },
  { quando: "2026-10-16T20:05:00-03:00", forma: "troca", marca: "Honda", modelo: "Fit", versao: "EX 1.5", fab: 2016, mod: 2017, km: 98000, cambio: "automatico", cor: "Cinza", quitado: false, valor: null, detalhes: "Faltam 8 parcelas. Interesse no Onix ou no Polo.", nome: "Patrícia Nunes", whatsapp: "86988771043", anotacoes: "", fotos: 4, status: "nova" },
  { quando: "2026-10-15T14:22:00-03:00", forma: "venda_direta", marca: "Volkswagen", modelo: "Gol", versao: "1.0", fab: 2018, mod: 2018, km: 85000, cambio: "manual", cor: "Branco", quitado: true, valor: 38000, detalhes: "", nome: "Gabriel Rocha", whatsapp: "86992305517", anotacoes: "Avaliação marcada para sábado, 9h.", fotos: 8, status: "em_avaliacao" },
  { quando: "2026-10-13T09:10:00-03:00", forma: "consignacao", marca: "Chevrolet", modelo: "S10", versao: "LT 2.8 Diesel 4x4", fab: 2018, mod: 2019, km: 120000, cambio: "automatico", cor: "Preto", quitado: true, valor: 145000, detalhes: "Único dono, manual e chave reserva.", nome: "Sebastião Lima", whatsapp: "86981036624", anotacoes: "Fechado em R$ 142 mil para o dono. Anunciar por R$ 152.900.", fotos: 8, status: "negocio_fechado" },
  { quando: "2026-10-11T16:48:00-03:00", forma: "venda_direta", marca: "Fiat", modelo: "Uno", versao: "Way 1.0", fab: 2015, mod: 2016, km: 110000, cambio: "manual", cor: "Vermelho", quitado: true, valor: 26000, detalhes: "Para-choque dianteiro riscado.", nome: "Cláudia Ferreira", whatsapp: "86994567781", anotacoes: "Valor acima da tabela. Cliente não aceitou contraproposta.", fotos: 3, status: "recusada" },
];
