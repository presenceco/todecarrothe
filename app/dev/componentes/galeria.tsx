import Link from "next/link";
import { AdminDock } from "@/components/admin/admin-dock";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CtaNaoEncontrou } from "@/components/catalogo/cta-nao-encontrou";
import { VehicleCard } from "@/components/catalogo/vehicle-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CountBadge, EtiquetaBadge, StatusBadge } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { DarkChipLink, ChipLink, SegmentedTabs } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { CLASSES_TOM, STATUS_CONSIGNACAO, STATUS_PEDIDO, STATUS_SIMULACAO, STATUS_VEICULO } from "@/lib/status";
import { AcoesDemo, FiltrosDemo, FormDemo } from "./demos";
import type { DadosGaleria } from "./dados";

/**
 * Galeria dos componentes comuns, só em desenvolvimento.
 * Os blocos com data-cmp são comparados pixel a pixel com as telas por scripts/comparar-componentes.ts
 * (390×844 para o mobile e 1440×900 para o desktop).
 */
function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="px-16 pt-40 pb-12 text-14 font-semibold tracking-label text-gray-600 uppercase lg:px-64">{children}</h2>;
}

export function Galeria({ dados, modo }: { dados: DadosGaleria; modo: "demo" | "pior" }) {
  const { veiculos, usuario, contadores, cabecalhoAdmin } = dados;
  const [primeiro, ...outros] = veiculos;

  const status = [
    ...Object.values(STATUS_VEICULO),
    ...Object.values(STATUS_PEDIDO),
    ...Object.values(STATUS_SIMULACAO),
    ...Object.values(STATUS_CONSIGNACAO),
  ];

  return (
    <main className="pb-80">
      <Titulo>Header do site</Titulo>
      <div data-cmp="header">
        <SiteHeader />
      </div>

      <Titulo>Cartão de veículo e chamada</Titulo>
      <div className="flex flex-col gap-16 px-16 lg:grid lg:w-[1032px] lg:grid-cols-3 lg:gap-24 lg:px-24">
        <div data-cmp="card">
          <VehicleCard veiculo={primeiro} preload />
        </div>
        {outros.slice(0, 1).map((v) => (
          <VehicleCard key={v.slug} veiculo={v} />
        ))}
        <div data-cmp="cta" className="lg:contents">
          <CtaNaoEncontrou />
        </div>
        {outros.slice(1).map((v) => (
          <VehicleCard key={v.slug} veiculo={v} />
        ))}
      </div>

      <Titulo>Rodapé do site</Titulo>
      <div data-cmp="footer">
        <SiteFooter />
      </div>

      <Titulo>Botões</Titulo>
      <div className="flex flex-wrap items-center gap-12 px-16 lg:px-64">
        <Button className="px-20">Primário</Button>
        <Button disabled className="px-20">
          Desabilitado
        </Button>
        <ButtonLink href="#" variant="outline" className="gap-6 px-14">
          <Icon name="calculate" size={20} />
          Simular
        </ButtonLink>
        <Button variant="whatsapp" size="md-bold" className="gap-8 px-20">
          <Icon name="chat" size={20} fill />
          Fale no WhatsApp
        </Button>
        <Button variant="whatsapp-outline" size="lg-15" className="gap-6 px-14">
          <Icon name="chat" size={20} fill />
          Tenho interesse
        </Button>
        <Button variant="neutral" size="lg" className="px-24">
          Cancelar
        </Button>
        <Button variant="neutral" size="sm" className="gap-6 px-14">
          <Icon name="edit" size={18} />
          Editar
        </Button>
        <IconButton icon="more_horiz" label="Mais ações" variant="bordered" iconSize={22} />
        <IconButton icon="close" label="Fechar" variant="bordered-lg" />
        <div className="rounded-16 bg-brand p-20">
          <Button variant="inverse" size="md-bold" className="gap-8 px-20">
            <Icon name="calculate" size={20} />
            Simular financiamento
          </Button>
        </div>
      </div>

      <Titulo>Selos e chips</Titulo>
      <div className="flex flex-col gap-16 px-16 lg:px-64">
        <div className="flex flex-wrap gap-8">
          {status.map((s, i) => (
            <StatusBadge key={i} tom={s.tom}>
              {s.rotulo}
            </StatusBadge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <EtiquetaBadge etiqueta="destaque" />
          <EtiquetaBadge etiqueta="novidade" />
          <EtiquetaBadge etiqueta="baixa_km" />
          <CountBadge total={2} rotulo="pedidos novos" />
          <CountBadge size="sm" total={128} rotulo="pedidos novos" />
          {Object.keys(CLASSES_TOM).length} tons
        </div>
        <div className="flex gap-8 overflow-x-auto">
          <ChipLink href="#" selected tone="black">
            Todas
          </ChipLink>
          <ChipLink href="#" selected={false}>
            Toyota
          </ChipLink>
          <ChipLink href="#" selected>
            Jeep
          </ChipLink>
        </div>
        <SegmentedTabs
          label="Status"
          items={[
            { href: "#todos", rotulo: "Todos", count: 38, selected: true },
            { href: "#disponivel", rotulo: "Disponível", count: 31, selected: false },
            { href: "#reservado", rotulo: "Reservado", count: 4, selected: false },
            { href: "#vendido", rotulo: "Vendido", count: 3, selected: false },
          ]}
          className="self-start"
        />
      </div>

      <Titulo>Painéis</Titulo>
      <div className="flex flex-wrap gap-12 px-16 lg:px-64">
        <FiltrosDemo />
        <AcoesDemo />
      </div>

      <Titulo>Formulário</Titulo>
      <div className="max-w-390 lg:ml-64">
        <FormDemo />
      </div>

      <Titulo>Admin · mobile</Titulo>
      <div className="max-w-390 bg-gray-100">
        <div data-cmp="admin-header">
          <AdminMobileHeader title={cabecalhoAdmin.titulo} badge={cabecalhoAdmin.badge} usuario={usuario} action={<IconButton icon="search" label="Buscar" className="text-white" />}>
            <DarkChipLink href="#todos" selected count={38}>
              Todos
            </DarkChipLink>
            <DarkChipLink href="#disponivel" selected={false} count={31}>
              Disponível
            </DarkChipLink>
            <DarkChipLink href="#reservado" selected={false} count={4}>
              Reservado
            </DarkChipLink>
            <DarkChipLink href="#vendido" selected={false} count={3}>
              Vendido
            </DarkChipLink>
          </AdminMobileHeader>
        </div>
        <div className="h-200" />
        <AdminDock contadores={{ ...contadores, consignacoes: 1 }} fab={{ href: "#cadastrar", rotulo: "Cadastrar" }} />
      </div>

      <Titulo>Admin · desktop</Titulo>
      <div data-cmp="sidebar" className="hidden h-900 lg:flex">
        <AdminSidebar contadores={contadores} usuario={usuario} />
      </div>

      {/* Chave de dados (só desenvolvimento): troca o conjunto inteiro na fronteira dos dados. */}
      <nav
        aria-label="Dados da galeria"
        className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-pill bg-gray-200 p-3 font-[system-ui] text-14 shadow-menu"
      >
        {([["demo", "/dev/componentes", "Dados das telas"], ["pior", "/dev/componentes/pior", "Pior caso"]] as const).map(([chave, href, rotulo]) => (
          <Link
            key={chave}
            href={href}
            aria-current={modo === chave ? "page" : undefined}
            className={modo === chave ? "rounded-pill bg-white px-14 py-6 font-semibold" : "px-14 py-6 text-gray-600"}
          >
            {rotulo}
          </Link>
        ))}
      </nav>
    </main>
  );
}
