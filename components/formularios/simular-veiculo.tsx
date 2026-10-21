import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { obterVeiculo } from "@/lib/catalogo/consultas";
import { FormSimulacao } from "./form-simulacao";
import { BarraTitulo } from "./partes";
import { ResumoClaro, ResumoEscuro } from "./resumo-veiculo";

/** Simulação com veículo (04 mobile, 23 desktop). */
export async function SimularVeiculo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await obterVeiculo(slug);
  if (!v) notFound();
  const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");

  return (
    <>
      <BarraTitulo titulo="Simular financiamento" voltarPara={`/carros/${v.slug}`} />
      <div className="bg-black px-16 pt-4 pb-20 lg:hidden">
        <ResumoEscuro v={v} />
      </div>

      <nav aria-label="Você está em" className="mx-auto hidden max-w-page items-center gap-8 px-32 py-24 text-14 font-medium text-gray-500 lg:flex xl:px-64">
        <Link href="/" className="flex items-center gap-8 hover:text-ink">
          <Icon name="arrow_back" size={18} />
          Estoque
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/carros/${v.slug}`} className="hover:text-ink">
          {nome}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          Simular financiamento
        </span>
      </nav>

      <div className="mx-auto max-w-page lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-40 lg:px-32 lg:pb-72 xl:px-64">
        <aside aria-label="Veículo da simulação" className="sticky top-24 hidden lg:block">
          <ResumoClaro v={v} />
        </aside>
        <div className="flex flex-col gap-16 px-16 pt-20 lg:gap-24 lg:p-0">
          <p className="text-15 leading-145 text-gray-700 lg:hidden">Preencha seus dados. A gente simula com os bancos e te responde no WhatsApp.</p>
          <div className="hidden lg:block">
            <h1 className="font-display text-44 leading-105 font-extrabold italic">Simular financiamento</h1>
            <p className="mt-8 text-17 text-gray-600">Preencha seus dados. A gente simula com os bancos e te responde no WhatsApp.</p>
          </div>
          <FormSimulacao veiculo={{ slug: v.slug, preco: v.preco }} />
        </div>
      </div>
    </>
  );
}
