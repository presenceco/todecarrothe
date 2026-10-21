import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/** robots.txt: o painel e as páginas de desenvolvimento ficam fora dos buscadores. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dev"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
