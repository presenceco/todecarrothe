import type { NextConfig } from "next";

// Fotos dos veículos vêm do Storage do Supabase (bucket público "veiculos").
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostSupabase = supabase && !supabase.includes("SEU-PROJETO") ? new URL(supabase) : null;

/** Origem do Supabase (fotos e envio direto ao Storage pelo navegador) para a CSP. */
const origemSupabase = hostSupabase ? hostSupabase.origin : "";

/**
 * Content-Security-Policy, só em produção: em desenvolvimento o Next usa eval ('unsafe-eval') para
 * reconstruir as pilhas de erro. 'unsafe-inline' em scripts e estilos: o Next injeta scripts inline e as
 * páginas são pré-renderizadas (sem nonce).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${origemSupabase}`,
  "font-src 'self'",
  `connect-src 'self' ${origemSupabase}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .map((d) => d.trim())
  .join("; ");

/** Cabeçalhos de segurança de todas as rotas (auditoria de 27/10/2026, item 1). */
const cabecalhosSeguranca = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosSeguranca }];
  },
  // O botão flutuante de desenvolvimento cobre o canto inferior esquerdo (atrapalha a comparação visual).
  devIndicators: false,
  partialPrefetching: true,
  images: {
    // 90: foto do Show Automall em "Onde estamos", que perde nitidez com a compressão padrão.
    qualities: [75, 90],
    remotePatterns: hostSupabase
      ? [{ protocol: "https", hostname: hostSupabase.hostname, pathname: "/storage/v1/object/public/veiculos/**" }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
