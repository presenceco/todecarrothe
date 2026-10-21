import type { NomeIcone } from "./icones";

type ItemSite = {
  href: string;
  /** Rótulo no header desktop (tela 21). */
  rotuloDesktop: string;
  /** Rótulo no menu mobile (tela 09). */
  rotuloMenu: string;
  icone: NomeIcone;
  /** Prefixos de rota que deixam o item ativo. */
  ativoEm: readonly string[];
};

/** Navegação do site: telas 09 e 21, com "Venda seu carro" entre "Não encontrou seu carro?" e "A loja". */
export const NAV_SITE: readonly ItemSite[] = [
  { href: "/", rotuloDesktop: "Estoque", rotuloMenu: "Estoque", icone: "directions_car", ativoEm: ["/", "/carros"] },
  {
    href: "/simular",
    rotuloDesktop: "Financiamento",
    rotuloMenu: "Simular financiamento",
    icone: "calculate",
    ativoEm: ["/simular"],
  },
  {
    href: "/nao-encontrou",
    rotuloDesktop: "Não encontrou seu carro?",
    rotuloMenu: "Não encontrou seu carro?",
    icone: "travel_explore",
    ativoEm: ["/nao-encontrou"],
  },
  { href: "/venda-seu-carro", rotuloDesktop: "Venda seu carro", rotuloMenu: "Venda seu carro", icone: "sell", ativoEm: ["/venda-seu-carro"] },
  { href: "/a-loja", rotuloDesktop: "A loja", rotuloMenu: "A loja", icone: "storefront", ativoEm: ["/a-loja"] },
];

export type ChaveContador = "pedidos" | "simulacoes" | "consignacoes";

type ItemAdmin = {
  href: string;
  rotulo: string;
  icone: NomeIcone;
  contador?: ChaveContador;
  /** Como ler o contador: "2 pedidos novos", "1 simulação nova". */
  novos?: readonly [um: string, varios: string];
};

/** Navegação do admin: barra inferior (mobile) e menu lateral (desktop), com Consignações. */
export const NAV_ADMIN: readonly ItemAdmin[] = [
  { href: "/admin/estoque", rotulo: "Estoque", icone: "directions_car" },
  { href: "/admin/pedidos", rotulo: "Pedidos", icone: "travel_explore", contador: "pedidos", novos: ["pedido novo", "pedidos novos"] },
  { href: "/admin/simulacoes", rotulo: "Simulações", icone: "request_quote", contador: "simulacoes", novos: ["simulação nova", "simulações novas"] },
  {
    href: "/admin/consignacoes",
    rotulo: "Consignações",
    icone: "handshake",
    contador: "consignacoes",
    novos: ["consignação nova", "consignações novas"],
  },
];

export type Contadores = Record<ChaveContador, number>;

/** O item está ativo quando a rota é ele mesmo ou fica abaixo dele ("/" só vale exato). */
export function rotaAtiva(pathname: string, prefixos: readonly string[]) {
  return prefixos.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));
}

/** Texto do contador para leitores de tela ("1 simulação nova" / "3 simulações novas"). */
export function rotuloNovos(item: { novos?: readonly [string, string] }, n: number) {
  return item.novos ? item.novos[n === 1 ? 0 : 1] : "";
}
