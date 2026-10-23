import type { NextConfig } from "next";

// Fotos dos veículos vêm do Storage do Supabase (bucket público "veiculos").
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostSupabase = supabase && !supabase.includes("SEU-PROJETO") ? new URL(supabase) : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
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
