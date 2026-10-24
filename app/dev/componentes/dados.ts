import type { Contadores } from "@/lib/navegacao";
import type { VeiculoResumo } from "@/lib/tipos";

// Dados só da galeria de desenvolvimento.

export type DadosGaleria = {
  veiculos: VeiculoResumo[];
  usuario: { nome: string; papel: string };
  contadores: Contadores;
  cabecalhoAdmin: { titulo: string; badge: string };
};

const base = { capa: null, cambio: "automatico", etiqueta: "nenhuma", etiquetaTexto: null } as const;

/** Dados das telas (Corolla, Tracker, Kwid). */
export const demo: DadosGaleria = {
  veiculos: [
    { ...base, slug: "toyota-corolla-xei-2-0-2023", marca: "Toyota", modelo: "Corolla", versao: "XEi 2.0", anoFabricacao: 2022, anoModelo: 2023, km: 38000, preco: 129900, etiqueta: "destaque", totalFotos: 12 },
    { ...base, slug: "chevrolet-tracker-lt-1-0-turbo-2023", marca: "Chevrolet", modelo: "Tracker", versao: "LT 1.0 Turbo", anoFabricacao: 2022, anoModelo: 2023, km: 36000, preco: 112900, etiqueta: "novidade", totalFotos: 12 },
    { ...base, slug: "renault-kwid-zen-1-0-2024", marca: "Renault", modelo: "Kwid", versao: "Zen 1.0", anoFabricacao: 2023, anoModelo: 2024, km: 15000, cambio: "manual", preco: 57900, etiqueta: "baixa_km", totalFotos: 8 },
  ],
  usuario: { nome: "Raimundo Sá", papel: "Proprietário" },
  contadores: { pedidos: 2, simulacoes: 3, consignacoes: 0 },
  cabecalhoAdmin: { titulo: "Estoque", badge: "38 veículos" },
};

/**
 * Pior caso realista: cada carro traz uma falha diferente (nomes longos de verdade, versão vazia,
 * zero foto, 0 km, carro de luxo com preço de 7 dígitos), contadores de 3 dígitos e de 1,
 * nome com hífen, título de lista mais longo ("Consignações") e contagem com milhar.
 */
export const pior: DadosGaleria = {
  veiculos: [
    {
      ...base,
      slug: "land-rover-range-rover-velar-2-0-p250-r-dynamic-se-2024",
      marca: "Land Rover",
      modelo: "Range Rover Velar",
      versao: "2.0 P250 R-Dynamic SE Turbo Automático 4WD",
      anoFabricacao: 2023,
      anoModelo: 2024,
      km: 128450,
      preco: 1289900,
      etiqueta: "destaque",
      totalFotos: 20,
    },
    {
      ...base,
      slug: "volkswagen-up-2018",
      marca: "Volkswagen",
      modelo: "Up!",
      versao: "",
      anoFabricacao: 2017,
      anoModelo: 2018,
      km: 0,
      cambio: "manual",
      preco: 39900,
      totalFotos: 0,
    },
    {
      ...base,
      slug: "mercedes-benz-gla-200-advance-1-3-turbo-2024",
      marca: "Mercedes-Benz",
      modelo: "GLA 200 Advance Edition",
      versao: "1.3 Turbo Flex 7G-DCT",
      anoFabricacao: 2023,
      anoModelo: 2024,
      km: 312000,
      preco: 249990.5,
      etiqueta: "novidade",
      totalFotos: 1,
    },
  ],
  usuario: { nome: "Aleksandra Wiśniewska-Kowalczyk", papel: "Proprietária e gerente comercial" },
  contadores: { pedidos: 128, simulacoes: 1, consignacoes: 12 },
  cabecalhoAdmin: { titulo: "Consignações", badge: "1.284 consignações" },
};
