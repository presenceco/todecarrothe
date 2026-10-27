import type { MetadataRoute } from "next";
import { listarCatalogo } from "@/lib/catalogo/consultas";
import { siteUrl } from "@/lib/env";

/** sitemap.xml: páginas públicas e todos os veículos do catálogo (em cache junto com o catálogo). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const veiculos = await listarCatalogo();
  const paginas = ["", "/simular", "/nao-encontrou", "/venda-seu-carro", "/a-loja", "/politica-de-privacidade"];
  return [
    ...paginas.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: p === "" ? ("daily" as const) : ("monthly" as const), priority: p === "" ? 1 : 0.5 })),
    ...veiculos.map((v) => ({
      url: `${siteUrl}/carros/${v.slug}`,
      lastModified: v.publicadoEm ? new Date(v.publicadoEm) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
