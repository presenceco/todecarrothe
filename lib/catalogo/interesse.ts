import { siteUrl } from "@/lib/env";
import { anoFabModelo, numeroPreco } from "@/lib/formato";
import { linkWhatsappLoja } from "@/lib/loja";
import type { VeiculoResumo } from "@/lib/tipos";

/** Endereço público do veículo ("https://todecarro.com.br/carros/toyota-corolla-xei-2-0-2023"). */
export function urlVeiculo(slug: string) {
  return `${siteUrl}/carros/${slug}`;
}

/**
 * Mensagem pronta do "Tenho interesse":
 * Olá! Tenho interesse no {Marca} {Modelo} {Versão} {ano fab./modelo} de R$ {preço} que vi no catálogo: {URL do veículo}
 */
export function mensagemInteresse(v: VeiculoResumo) {
  const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
  return `Olá! Tenho interesse no ${nome} ${anoFabModelo(v.anoFabricacao, v.anoModelo)} de R$ ${numeroPreco(v.preco)} que vi no catálogo: ${urlVeiculo(v.slug)}`;
}

/** Link do "Tenho interesse", com o cupom de indicação no fim da mensagem, se houver. */
export function linkInteresse(mensagem: string, cupom?: string) {
  return linkWhatsappLoja(cupom ? `${mensagem} Cupom de indicação: ${cupom}` : mensagem);
}
