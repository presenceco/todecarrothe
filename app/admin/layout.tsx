import type { Metadata } from "next";

/** Painel do lojista: fora dos buscadores (além do robots.txt) e com título próprio. */
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Tô de Carro" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
