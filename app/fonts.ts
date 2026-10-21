import { Exo_2, Inter } from "next/font/google";
import localFont from "next/font/local";

// Mesmas fontes das referências: Inter 4 (eixo wght) e Exo 2 itálico 800, servidas pelo Google Fonts.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const exo2 = Exo_2({
  subsets: ["latin"],
  weight: "800",
  style: "italic",
  variable: "--font-exo2",
  display: "swap",
});

// Subconjunto gerado por `npm run icones`. "block" evita mostrar o nome do ícone como texto enquanto a fonte carrega.
export const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  variable: "--font-material-symbols",
  weight: "300 600",
  display: "block",
});

export const fontVariables = `${inter.variable} ${exo2.variable} ${materialSymbols.variable}`;
