/** URL pública do site, sem barra no final (NEXT_PUBLIC_SITE_URL). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
