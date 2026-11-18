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
    // Sem a otimização da Vercel: o plano Hobby tem 5 mil transformações por mês e, passado o limite, responde
    // 402 e a foto some (18/11/2026). As imagens saem como estão: fotos dos carros direto do Supabase e logos
    // já em tamanho de tela (public/marca/*.webp). As opções abaixo só valem se a otimização for religada.
    unoptimized: true,
    // 90: foto do Show Automall em "Onde estamos", que perde nitidez com a compressão padrão.
    qualities: [75, 90],
    // 31 dias: a Vercel cobra uma transformação a cada cópia vencida, e o prazo de 5 minutos refazia a mesma foto
    // o tempo todo. Em troca, a cópia otimizada de um carro que saiu do catálogo pode abrir até vencer.
    minimumCacheTTL: 2678400,
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
