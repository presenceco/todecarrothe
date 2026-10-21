import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { siteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tô de Carro Seminovos · Teresina-PI",
    template: "%s · Tô de Carro Seminovos",
  },
  description: "Seminovos revisados e com procedência em Teresina-PI. Financiamento com os principais bancos.",
  applicationName: "Tô de Carro Seminovos",
  icons: { icon: "/marca/simbolo.png", apple: "/marca/simbolo.png" },
};

// viewport-fit=cover libera as áreas seguras (notch, barra de gestos) para os elementos fixos usarem
// env(safe-area-inset-*); resizes-content faz o teclado do Android encolher a página como no iOS.
// Sem bloquear o zoom: os campos têm 16 px, então o iPhone não amplia ao focar.
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
