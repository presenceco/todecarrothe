import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/** 404 no visual do estado vazio (08): ex.: veículo vendido ou link antigo. */
export default function NaoEncontrado() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center px-24 pt-56 pb-72 text-center">
        <div className="flex size-88 items-center justify-center rounded-pill bg-brand-50 text-brand">
          <Icon name="search_off" size={44} />
        </div>
        <h1 className="mt-20 font-display text-28 leading-110 font-extrabold italic">Página não encontrada</h1>
        <p className="mt-8 max-w-320 text-16 leading-145 text-gray-600">Esse carro pode ter sido vendido ou o link mudou. Veja o estoque atualizado.</p>
        <ButtonLink href="/" className="mt-20 gap-8 px-22" size="md-bold">
          Ver o estoque
          <Icon name="arrow_forward" size={20} />
        </ButtonLink>
      </main>
      <SiteFooter />
    </>
  );
}
