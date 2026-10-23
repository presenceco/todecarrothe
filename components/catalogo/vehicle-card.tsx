import Image from "next/image";
import Link from "next/link";
import { EtiquetaBadge, FotoCountBadge } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/cn";
import { anoFabModelo, km } from "@/lib/formato";
import { ROTULO_CAMBIO, type VeiculoResumo } from "@/lib/tipos";

/**
 * Cartão do catálogo.
 * Mobile (01): 16px de respiro, modelo 26px, ano · km · câmbio.
 * Desktop (21): 18px, modelo 24px, ano · km (sem câmbio).
 * A foto também abre o detalhe (para o dedo, é o alvo natural); para teclado e leitor de tela,
 * o link é o "Ver detalhes".
 */
export function VehicleCard({
  veiculo,
  preload = false,
  className,
}: {
  veiculo: VeiculoResumo;
  /** Primeiro cartão visível: carrega a foto sem esperar a rolagem. */
  preload?: boolean;
  className?: string;
}) {
  const detalhe = `/carros/${veiculo.slug}`;
  const nome = `${veiculo.marca} ${veiculo.modelo} ${veiculo.versao}`;

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-16 bg-white shadow-card", className)}>
      <Link href={detalhe} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] bg-hatch">
        {veiculo.capa && (
          <Image
            src={veiculo.capa.src}
            alt={veiculo.capa.alt}
            fill
            sizes="(min-width: 1440px) 352px, (min-width: 1024px) 30vw, 100vw"
            preload={preload}
            className="object-cover"
          />
        )}
        {veiculo.etiqueta !== "nenhuma" && <EtiquetaBadge etiqueta={veiculo.etiqueta} className="absolute top-12 left-12" />}
        {veiculo.totalFotos > 0 && <FotoCountBadge total={veiculo.totalFotos} className="absolute right-12 bottom-12" />}
      </Link>

      {/* Coluna: na grade do desktop os cartões da linha têm a mesma altura e preço + botões ficam alinhados no pé. */}
      <div className="flex flex-1 flex-col p-16 lg:p-18">
        <h3>
          <span className="block text-14 font-bold tracking-eyebrow text-brand uppercase">{veiculo.marca}</span>
          <span className="mt-2 block font-display text-26 leading-110 font-extrabold italic lg:text-24">{veiculo.modelo}</span>
        </h3>
        {veiculo.versao && <p className="mt-2 text-15 text-gray-600">{veiculo.versao}</p>}

        {/* Quebra de linha em vez de cortar o câmbio em telas de 320px. */}
        <ul className="mt-12 flex flex-wrap gap-x-16 gap-y-4 text-14 font-medium text-gray-700 lg:gap-x-14">
          <li className="flex items-center gap-5">
            <Icon name="calendar_month" size={18} className="text-gray-400" />
            <span className="sr-only">Ano:</span>
            {anoFabModelo(veiculo.anoFabricacao, veiculo.anoModelo)}
          </li>
          <li className="flex items-center gap-5">
            <Icon name="speed" size={18} className="text-gray-400" />
            <span className="sr-only">Quilometragem:</span>
            {km(veiculo.km)}
          </li>
          <li className="flex items-center gap-5 lg:hidden">
            <Icon name="settings" size={18} className="text-gray-400" />
            <span className="sr-only">Câmbio:</span>
            {ROTULO_CAMBIO[veiculo.cambio].curto}
          </li>
        </ul>

        <div className="flex-1" />
        <Price valor={veiculo.preco} className="mt-12 lg:mt-14" />

        <div className="mt-16 flex gap-8">
          <ButtonLink href={detalhe} aria-label={`Ver detalhes do ${nome}`} className="flex-1">
            Ver detalhes
          </ButtonLink>
          <ButtonLink
            href={`/simular/${veiculo.slug}`}
            variant="outline"
            aria-label={`Simular financiamento do ${nome}`}
            className="box-border gap-6 px-14"
          >
            <Icon name="calculate" size={20} />
            Simular
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
