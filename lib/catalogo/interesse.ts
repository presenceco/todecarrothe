import { siteUrl } from "@/lib/env";
import { anoFabModelo, numeroPreco } from "@/lib/formato";
import { linkWhatsappLoja } from "@/lib/loja";
import type { VeiculoResumo } from "@/lib/tipos";

/** Endereço público do veículo ("https://todecarro.com.br/carros/toyota-corolla-xei-2-0-2023"). */
export function urlVeiculo(slug: string) {
  return `${siteUrl}/carros/${slug}`;
}

/**
 * "Tenho interesse": abre o WhatsApp da loja com a mensagem pronta (não grava nada no banco).
 * Olá! Tenho interesse no {Marca} {Modelo} {Versão} {ano fab./modelo} de R$ {preço} que vi no catálogo: {URL do veículo}
 */
export function linkInteresse(v: VeiculoResumo) {
  const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
  const mensagem = `Olá! Tenho interesse no ${nome} ${anoFabModelo(v.anoFabricacao, v.anoModelo)} de R$ ${numeroPreco(v.preco)} que vi no catálogo: ${urlVeiculo(v.slug)}`;
  return linkWhatsappLoja(mensagem);
}
