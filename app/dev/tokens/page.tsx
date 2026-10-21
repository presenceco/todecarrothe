import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ICONES } from "@/lib/icones";

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

// Página de conferência dos tokens, só em desenvolvimento.
// As classes ficam por extenso para o Tailwind encontrá-las no código.

const cores: [string, string, string][] = [
  ["brand", "#0045AA", "bg-brand"],
  ["brand-hover", "#003080", "bg-brand-hover"],
  ["brand-300", "#8FB4FF", "bg-brand-300"],
  ["brand-200", "#B9CEF0", "bg-brand-200"],
  ["brand-100", "#EEF3FB", "bg-brand-100"],
  ["brand-50", "#E5EEFB", "bg-brand-50"],
  ["brand-25", "#F5F8FE", "bg-brand-25"],
  ["brand-row", "#FAFCFF", "bg-brand-row"],
  ["silver", "#C8C8C8", "bg-silver"],
  ["black", "#000000", "bg-black"],
  ["ink", "#0B0F17", "bg-ink"],
  ["ink-800", "#14171E", "bg-ink-800"],
  ["ink-700", "#1C2230", "bg-ink-700"],
  ["ink-600", "#262B36", "bg-ink-600"],
  ["ink-500", "#2A3140", "bg-ink-500"],
  ["gray-700", "#3A4252", "bg-gray-700"],
  ["gray-650", "#4A5262", "bg-gray-650"],
  ["gray-600", "#5B6474", "bg-gray-600"],
  ["gray-500", "#6B7385", "bg-gray-500"],
  ["gray-450", "#7A8394", "bg-gray-450"],
  ["gray-400", "#8A93A3", "bg-gray-400"],
  ["gray-350", "#9AA3B2", "bg-gray-350"],
  ["gray-300", "#A3ACBA", "bg-gray-300"],
  ["gray-250", "#B8C0CC", "bg-gray-250"],
  ["gray-240", "#B8C2D3", "bg-gray-240"],
  ["gray-200", "#D5DAE1", "bg-gray-200"],
  ["gray-190", "#D9DCE1", "bg-gray-190"],
  ["gray-180", "#DCE1E8", "bg-gray-180"],
  ["gray-170", "#DFE3E9", "bg-gray-170"],
  ["gray-160", "#E2E6ED", "bg-gray-160"],
  ["gray-150", "#E4E8EF", "bg-gray-150"],
  ["gray-140", "#E8EBF0", "bg-gray-140"],
  ["gray-130", "#ECEEF1", "bg-gray-130"],
  ["gray-120", "#EDF0F4", "bg-gray-120"],
  ["gray-100", "#F5F7FA", "bg-gray-100"],
  ["gray-50", "#F8FAFC", "bg-gray-50"],
  ["gray-25", "#FAFBFC", "bg-gray-25"],
  ["white", "#FFFFFF", "bg-white"],
  ["whatsapp", "#1FAF5A", "bg-whatsapp"],
  ["whatsapp-dark", "#138A45", "bg-whatsapp-dark"],
  ["whatsapp-bubble", "#DCF8C6", "bg-whatsapp-bubble"],
  ["scrim", "rgba(5,8,15,.6)", "bg-scrim"],
  ["scrim-panel", "rgba(8,12,22,.45)", "bg-scrim-panel"],
];

const status: [string, string, string][] = [
  ["Disponível · Encontrado · Aprovada · Negócio fechado", "bg-success-bg", "text-success"],
  ["Reservado · Em busca · Em análise · Em avaliação", "bg-warning-bg", "text-warning"],
  ["Vendido · Finalizado", "bg-neutral-bg", "text-neutral"],
  ["Novo · Nova", "bg-info-bg", "text-info"],
  ["Recusada", "bg-danger-bg", "text-danger"],
];

const tamanhosInter = [
  ["text-14", "14"],
  ["text-15", "15"],
  ["text-16", "16"],
  ["text-17", "17"],
  ["text-18", "18"],
  ["text-20", "20"],
  ["text-22", "22"],
  ["text-26", "26"],
  ["text-28", "28"],
  ["text-30", "30"],
  ["text-38", "38"],
  ["text-46", "46"],
];

const tamanhosExo = [
  ["text-19", "19"],
  ["text-20", "20"],
  ["text-22", "22"],
  ["text-24", "24"],
  ["text-26", "26"],
  ["text-28", "28"],
  ["text-30", "30"],
  ["text-32", "32"],
  ["text-34", "34"],
  ["text-44", "44"],
  ["text-52", "52"],
  ["text-56", "56"],
  ["text-60", "60"],
];

const pesos = [
  ["font-light", "300"],
  ["font-normal", "400"],
  ["font-medium", "500"],
  ["font-semibold", "600"],
  ["font-bold", "700"],
  ["font-extrabold", "800"],
];

const tracking = [
  ["tracking-price", "-.02em", "R$ 129.900"],
  ["tracking-table", ".06em", "MODELO / VERSÃO"],
  ["tracking-eyebrow", ".08em", "TOYOTA"],
  ["tracking-label", ".14em", "GESTÃO"],
  ["tracking-password", ".2em", "••••••••"],
  ["tracking-tagline-32", ".32em", "SEMINOVOS"],
  ["tracking-tagline-36", ".36em", "SEMINOVOS · TERESINA"],
  ["tracking-tagline-42", ".42em", "PAINEL DO LOJISTA"],
];

const raios = [
  ["rounded-2", "2"],
  ["rounded-3", "3"],
  ["rounded-5", "5"],
  ["rounded-6", "6"],
  ["rounded-7", "7"],
  ["rounded-8", "8"],
  ["rounded-9", "9"],
  ["rounded-10", "10"],
  ["rounded-12", "12"],
  ["rounded-14", "14"],
  ["rounded-16", "16"],
  ["rounded-24", "24"],
  ["rounded-pill", "999"],
];

const sombras = [
  "shadow-card",
  "shadow-card-soft",
  "shadow-hairline",
  "shadow-float",
  "shadow-form-card",
  "shadow-login-card",
  "shadow-login-card-desktop",
  "shadow-search",
  "shadow-filter-button",
  "shadow-footer",
  "shadow-badge",
  "shadow-slider-thumb",
  "shadow-switch-knob",
  "shadow-gallery-arrow",
  "shadow-map-pin",
  "shadow-finance-cta",
  "shadow-fab",
  "shadow-success",
  "shadow-focus",
  "shadow-ring-brand",
  "shadow-nav-active",
  "shadow-menu",
  "shadow-drag",
  "shadow-panel",
  "shadow-drawer",
];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-16">
      <h2 className="text-14 font-semibold tracking-label text-gray-600 uppercase">{titulo}</h2>
      {children}
    </section>
  );
}

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-page flex-col gap-48 px-16 py-40 lg:px-64">
      <header className="flex flex-col gap-8">
        <h1 className="font-display text-34 leading-105 font-extrabold italic">Tokens · Tô de Carro</h1>
        <p className="text-16 text-gray-600">
          Valores extraídos de <code className="font-mono text-14">referencias/telas.html</code>. Só em
          desenvolvimento.
        </p>
      </header>

      <Secao titulo="Cores">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-6">
          {cores.map(([nome, valor, classe]) => (
            <div key={nome} className="overflow-hidden rounded-12 border border-gray-150 bg-white">
              <div className={`h-64 ${classe}`} />
              <div className="flex flex-col gap-2 p-10">
                <span className="text-14 font-semibold">{nome}</span>
                <span className="font-mono text-11 text-gray-600">{valor}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-8">
          {status.map(([rotulo, fundo, texto]) => (
            <span key={rotulo} className={`rounded-pill px-11 py-6 text-14 font-semibold ${fundo} ${texto}`}>
              {rotulo}
            </span>
          ))}
        </div>
      </Secao>

      <Secao titulo="Inter">
        <div className="flex flex-col gap-8">
          {tamanhosInter.map(([classe, px]) => (
            <p key={classe} className={`${classe} font-semibold`}>
              {px}px · Seu próximo carro está aqui
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-24">
          {pesos.map(([classe, peso]) => (
            <span key={classe} className={`text-18 ${classe}`}>
              Inter {peso}
            </span>
          ))}
        </div>
      </Secao>

      <Secao titulo="Exo 2 itálico 800">
        <div className="flex flex-col gap-8">
          {tamanhosExo.map(([classe, px]) => (
            <p key={classe} className={`font-display ${classe} leading-110 font-extrabold italic`}>
              {px}px · Toyota Corolla
            </p>
          ))}
        </div>
      </Secao>

      <Secao titulo="Espaçamento entre letras">
        <div className="flex flex-col gap-12">
          {tracking.map(([classe, valor, exemplo]) => (
            <p key={classe} className="flex items-baseline gap-16">
              <span className="w-200 font-mono text-11 text-gray-600">
                {classe} ({valor})
              </span>
              <span className={`text-16 font-semibold ${classe}`}>{exemplo}</span>
            </p>
          ))}
        </div>
      </Secao>

      <Secao titulo="Raios">
        <div className="flex flex-wrap gap-16">
          {raios.map(([classe, px]) => (
            <div key={classe} className="flex flex-col items-center gap-6">
              <div className={`size-72 bg-brand-50 ${classe} border border-brand-200`} />
              <span className="font-mono text-11 text-gray-600">{px}px</span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Sombras">
        <div className="grid grid-cols-2 gap-24 lg:grid-cols-5">
          {sombras.map((classe) => (
            <div key={classe} className={`flex h-96 items-end rounded-16 bg-white p-12 ${classe}`}>
              <span className="font-mono text-11 text-gray-600">{classe.replace("shadow-", "")}</span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Superfícies">
        <div className="grid grid-cols-2 gap-16 lg:grid-cols-4">
          <div className="flex aspect-[4/3] items-center justify-center rounded-16 bg-hatch">
            <span className="rounded-6 bg-white/90 px-8 py-6 font-mono text-11 leading-none font-medium text-gray-650">
              foto · corolla prata · pátio
            </span>
          </div>
          <div className="flex aspect-[4/3] items-center justify-center rounded-16 bg-hatch-sm" />
          <div className="flex aspect-[4/3] items-center justify-center rounded-16 bg-black">
            <div className="h-1 w-full bg-filete opacity-50" />
          </div>
          <div className="flex aspect-[4/3] items-center justify-center rounded-16 bg-white">
            <span className="rounded-8 bg-destaque px-11 py-7 text-14 leading-none font-bold text-ink shadow-badge">
              Destaque
            </span>
          </div>
        </div>
      </Secao>

      <Secao titulo={`Ícones (${ICONES.length})`}>
        <div className="grid grid-cols-3 gap-8 lg:grid-cols-8">
          {ICONES.map((nome) => (
            <div key={nome} className="flex flex-col items-center gap-6 rounded-12 border border-gray-150 bg-white p-12">
              <div className="flex gap-8 text-brand">
                <Icon name={nome} />
                <Icon name={nome} fill />
              </div>
              <span className="font-mono text-11 break-all text-gray-600">{nome}</span>
            </div>
          ))}
        </div>
      </Secao>
    </main>
  );
}
