# Plano de implementação: Tô de Carro Seminovos

Catálogo online + painel do lojista. Next.js (App Router, TS estrito) · Tailwind · Supabase · Zod · Vercel.
Status: **aguardando aprovação**. Nenhum código do app foi escrito.

---

## 0. Situação encontrada (ler primeiro)

| Item | Situação | Consequência |
| --- | --- | --- |
| Pasta `referencias/` | **Não existia.** Havia um único arquivo, `Catálogo Tô de Carro (32 telas).html` (8,9 MB). | Copiei para `referencias/telas.html`. O original ficou intacto. |
| Formato do HTML | É um **bundle do Claude Design**: o HTML real está codificado em JSON e as fontes e imagens em base64. As telas são templates (`sc-for`, `{{ }}`) alimentados por um script com os dados fictícios. | Decodifiquei com Python. O script de dados vira a base do seed. A página renderiza normalmente num navegador (testei servindo a pasta em `localhost:4400`). |
| Moldura | Não é slide com texto lateral. É um canvas com um cartão por tela (`.dv-card`, 390 px no mobile e 1440 px no desktop). | Implementar só o que está dentro de `.dv-card`. Rótulos (`.dv-olabel`, `.dv-thd`, `.dv-intro`) e marcações (`.dv-mark`: linha tracejada vermelha da dobra em 844 px, "rodapé fixo", "botão fixo", "barra fixa") são anotações. A nota da tela 03 sobre "Tenho interesse" é especificação. |
| Logos | `simbolo.png`, `wordmark.png` e `logo-vertical.png` da raiz têm o mesmo tamanho em bytes que as imagens embutidas no HTML. | Usar os arquivos da raiz: símbolo (40 usos), wordmark (header do site, 12 telas) e logo vertical (login, telas 11 e 26). |
| **Node.js** | **Não está instalado** (nem npm). Só o Python 3.14 (via `py`). | **Bloqueia** Next.js, Playwright e a CLI do Supabase. Proposta: `winget install OpenJS.NodeJS.LTS`. |
| Git | A pasta não é um repositório. | Proposta: `git init` antes da primeira linha de código. |
| Supabase | Não há projeto configurado. | Preciso da URL, da anon key e da service role key no `.env.local`, preenchidos por você. Alternativa: Supabase local pela CLI, que exige Docker Desktop. |

---

## 1. Inventário das telas

Origem: `referencias/telas.html`, seletor `#<id> .dv-card`. Todas as telas estão no mesmo arquivo.

### 1.1 Catálogo (público)

| # | id no HTML | Tela | Rota | Componentes |
| --- | --- | --- | --- | --- |
| 01 | `n01` | Estoque · mobile | `/` | `SiteHeader` (símbolo + wordmark, botão WhatsApp 48 px verde, menu), `Hero` (tagline "SEMINOVOS · TERESINA" + título Exo 2), `SearchBar` + `FilterButton`, `BrandChips` (rolagem horizontal), `ShortcutCards` (3), `ResultsBar` (total + ordenação), `VehicleCard`, `CtaNaoEncontrou` (preto, marca d'água), `SiteFooter` |
| 02 | `n02` | Filtros (painel inferior) · mobile | `/` (estado) | `BottomSheet` (alça, "Filtros", "Limpar", fechar), `ChipGroup` (marca, várias), `PriceRangeSlider` (2 pontas), `YearRange` (2 selects), `Segmented` (câmbio, km, combustível, tipo), `SheetFooter` "Ver N veículos" |
| 03 | `n03` | Detalhe do veículo · mobile | `/carros/[slug]` | `DetailTopBar` (voltar, compartilhar), `Gallery` (contador 1/12, pontos), `CardBadge`, `VehicleHeading`, `Price`, `FinanceCta`, `VerifiedSeals`, `SpecGrid` (ficha técnica: 6 itens), `OptionalsList` (8 + "Ver todos os 14"), `StickyFooter` ("Tenho interesse" + "Simular financiamento") |
| 04 | `n04` | Simular financiamento · mobile | `/simular/[slug]` | `PageTopBar`, `VehicleSummary`, `FormCard`, `TextField`, `MaskedField` (CPF, data, WhatsApp, R$), `Segmented` (prazo 24/36/48/60), `YesNo`, campos condicionais da troca, `ConsentCheckbox`, `StickyFooter` (enviar + dica "Marque a autorização para enviar") |
| 05 | `n05` | Escolha do veículo · mobile | `/simular` | `PageTopBar`, `SearchField`, `VehiclePickList` (linha com chevron), linha "Ainda não escolhi" |
| 05b | `n05b` | Simular sem veículo · mobile | `/simular/sem-veiculo` | Mesmo formulário da 04, mais "Valor aproximado do carro" |
| 06 | `n06` | Simulação enviada · mobile | `/simular/enviado` | `SuccessScreen` (selo de check, resumo do veículo, cartão de horário, "Voltar ao estoque", "Falar agora no WhatsApp") |
| 07 | `n07` | Não encontrou seu carro? · mobile | `/nao-encontrou` | `FormCard`, `Select` (ano mínimo, faixa), `Segmented` (pagamento), `Switch` ("Tenho carro para dar de entrada"), `ConsentCheckbox`, `StickyFooter` |
| 08 | `n08` | Busca sem resultado · mobile | `/` (estado) | `ActiveFilterChips` (removíveis), `EmptyState` (search_off), "Limpar filtros", `CtaNaoEncontrou` |
| 09 | `n09` | Menu do site · mobile | `/` (estado, em qualquer página) | `SiteMenu` (links com ícone, WhatsApp, endereço, horário) |
| 10 | `n10` | A loja · mobile | `/a-loja` | Foto da fachada, texto, `MapCard`, `InfoRow` (endereço, horário), "Fale no WhatsApp", "Como chegar" |
| 21 | `n21` | Estoque · desktop | `/` | `SiteHeader` desktop (nav + "Fale no WhatsApp"), `Hero` com busca e atalhos, `FilterSidebar` (296 px: marcas com checkbox e contagem, faixa de preço, ano de/até, km, câmbio, combustível, tipo), `ResultsBar`, grade de `VehicleCard` (3 colunas), CTA, rodapé |
| 22 | `n22` | Detalhe · desktop | `/carros/[slug]` | `Breadcrumb`, `Gallery` (setas + miniaturas), `SpecGrid`, `OptionalsList` (expansível), coluna lateral fixa de 440 px (preço, financiar, "Tenho interesse", selos) |
| 23 | `n23` | Simular · desktop | `/simular/[slug]` | Coluna de 400 px com o veículo e "Trocar veículo"; formulário em cartões de duas colunas |
| 24 | `n24` | Não encontrou · desktop | `/nao-encontrou` | Formulário centralizado com 640 px no máximo |
| 25 | `n25` | A loja · desktop | `/a-loja` | Grade 1,15fr / 1fr |

### 1.2 Área administrativa

| # | id | Tela | Rota | Componentes |
| --- | --- | --- | --- | --- |
| 11 | `n11` | Login · mobile | `/admin/login` | `LoginForm` (e-mail, senha com mostrar/ocultar, "Manter conectado", "Esqueci minha senha", "Entrar") |
| 26 | `n26` | Login · desktop | `/admin/login` | Mesmo formulário, em grade 1fr/1fr com o painel da marca |
| 12 | `n12` | Estoque · mobile | `/admin/estoque` | `AdminMobileHeader` (título, contagem, busca, avatar "RS"), `DarkChips` (status com contagem), `AdminVehicleRow` (selo de status, "⋯"), botão flutuante "Cadastrar", `AdminTabBar` |
| 13 | `n13` | Ações do veículo · mobile | `/admin/estoque` (estado) | `ActionSheet` (Editar, Reservado, Vendido/Reativar, Ver no catálogo, Excluir) |
| 14 | `n14` | Confirmar exclusão · mobile | `/admin/estoque` (estado) | `ConfirmDialog` |
| 27 | `n27` | Estoque · desktop | `/admin/estoque` | `AdminSidebar` (248 px), `PageHeader`, `SearchInput` (380 px), `SegmentedTabs` com contagem, `DataTable`, `RowMenu` ("⋯"), `Pagination` ("1–8 de 38") |
| 15 | `n15` | Cadastrar/editar · mobile | `/admin/estoque/novo`, `/admin/estoque/[id]` | `PhotoManager` (miniaturas arrastáveis, capa, "+6"), `StatusPicker`, `PriceField`, selects, `SealToggles`, `OptionalsChecklist`, "Adicionar opcional", `StickyFooter` ("Salvar rascunho" / "Publicar no catálogo") |
| 28 | `n28` | Cadastrar/editar · desktop | idem | `Dropzone`, grade de miniaturas arrastáveis, campos em grade, selos, opcionais com checkbox, `StatusRadioCards`, preço, `CatalogPreview` (coluna de 340 px) |
| 16 | `n16` | Pedidos · mobile | `/admin/pedidos` | `RequestCard` (nome, data, status, carro, "Tem troca", ano, faixa, pagamento, "Ver detalhes", atalho WhatsApp) |
| 17 | `n17` | Detalhe do pedido · mobile | `/admin/pedidos/[id]` | `DetailHeaderDark` com `StatusPicker` escuro, `DetailSection` (rótulo/valor), `NotesField` (salva sozinho), `StickyFooter` ("Copiar dados", "Chamar no WhatsApp") |
| 29 | `n29` | Pedidos · desktop | `/admin/pedidos` | `DataTable` com `StatusSelect` na linha |
| 30 | `n30` | Detalhe do pedido · desktop | `/admin/pedidos/[id]` | `SidePanel` (540 px) sobre a lista escurecida |
| 18 | `n18` | Simulações · mobile | `/admin/simulacoes` | `SimulationCard` |
| 19 | `n19` | Detalhe da simulação · mobile | `/admin/simulacoes/[id]` | Como a 17, mais o cartão do veículo e a linha "Autorizou o uso dos dados" |
| 31 | `n31` | Simulações · desktop | `/admin/simulacoes` | `DataTable`. A linha tem chevron, não seletor de status: o status muda só no detalhe |
| 32 | `n32` | Detalhe da simulação · desktop | `/admin/simulacoes/[id]` | `SidePanel` |
| 20 | `n20` | Conta · mobile | painel aberto pelo avatar | `AccountSheet` (iniciais, nome, papel, "Ver catálogo", "Sair"). No desktop, o rodapé do `AdminSidebar` (já presente nas telas 27–32) |

### 1.3 Telas sem HTML

| Tela | Base visual |
| --- | --- |
| **33–39** · Venda seu carro (mobile e desktop), carro enviado, Consignações (lista e detalhe, mobile e desktop) | Especificação da seção 10 do briefing, nos padrões 04/07, 06, 16/18, 17, 23/24, 29 e 30 |
| `/nao-encontrou/enviado` | Padrão 06 (item 9.1 do briefing) |
| `/politica-de-privacidade` | Página de texto com header e rodapé do site; conteúdo "a definir" |
| Esqueci minha senha / redefinir senha | Padrão 11/26 |
| Confirmação de exclusão no desktop | Conteúdo da 14 em diálogo centralizado |
| Menu de ordenação aberto | `<select>` nativo, transparente sobre o texto "Mais recentes ▾": o visual fica igual e o celular abre o seletor do sistema |
| Estado de erro dos campos | Ver dúvida 10 |
| Indicadores "Salvo" e "Copiado", listas vazias no admin, 404 | Mínimos, com os mesmos tokens |

### 1.4 Navegação nova (sobrepõe o HTML)

- Menu do site (09) e header desktop: Estoque · Simular financiamento/Financiamento · Não encontrou seu carro? · **Venda seu carro** · A loja.
- Barra inferior do admin mobile: Estoque · Pedidos · Simulações · **Consignações**.
- Menu lateral do admin desktop: **Consignações** abaixo de Simulações.

---

## 2. Design tokens (extraídos do CSS das telas)

O HTML **não tem nenhuma `@media`**: as telas são pranchas fixas de 390 px e 1440 px. Os valores abaixo entram em `app/globals.css` como `@theme` do Tailwind v4, que gera as classes e as variáveis CSS ao mesmo tempo. Onde a escala do Tailwind não bate, uso valores arbitrários exatos.

### 2.1 Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `brand` | `#0045AA` | Primária: botões, links, ícones, chip ativo (150 usos) |
| `brand-hover` | `#003080` | Hover de link/botão |
| `brand-50` | `#E5EEFB` | Fundo de selecionado, status Novo/Nova, selos |
| `brand-100` | `#EEF3FB` | Alvo de soltar foto |
| `brand-25` | `#F5F8FE` | Cartão de status selecionado |
| `brand-row` | `#FAFCFF` | Linha "nova" nas tabelas |
| `brand-200` | `#B9CEF0` | Borda dos selos |
| `brand-300` | `#8FB4FF` | Tracejado de soltar e borda do status Novo |
| `black` | `#000000` | Header, hero, menu lateral do admin |
| `ink` | `#0B0F17` | Texto principal, chip escuro |
| `ink-800` / `ink-700` / `ink-600` / `ink-500` | `#14171E` / `#1C2230` / `#262B36` / `#2A3140` | Superfícies escuras do admin (avatar, cabeçalhos escuros) |
| `gray-700` | `#3A4252` | Texto secundário, borda de chip no escuro |
| `gray-650` / `gray-600` / `gray-500` | `#4A5262` / `#5B6474` / `#6B7385` | Textos de apoio, placeholders |
| `gray-450` / `gray-400` / `gray-350` / `gray-300` | `#7A8394` / `#8A93A3` / `#9AA3B2` / `#A3ACBA` | Ícones, aba inativa, itens do menu lateral |
| `gray-250` / `gray-240` | `#B8C0CC` / `#B8C2D3` | Checkbox vazio, tracejado do dropzone |
| `silver` | `#C8C8C8` | Prata da marca: tagline, filete, selo Destaque |
| `gray-200` | `#D5DAE1` | Borda de campos e chips |
| `gray-190` / `gray-180` / `gray-160` | `#D9DCE1` / `#DCE1E8` / `#E2E6ED` | Bordas pontuais |
| `gray-150` | `#E4E8EF` | Borda de cartões |
| `hatch-1` / `hatch-2` | `#E8EBF0` / `#DFE3E9` | Placeholder de foto |
| `gray-120` | `#EDF0F4` | Divisórias |
| `gray-100` | `#F5F7FA` | Fundo das páginas |
| `gray-50` / `gray-25` | `#F8FAFC` / `#FAFBFC` | Fundos sutis |
| `whatsapp` / `whatsapp-dark` / `whatsapp-bubble` | `#1FAF5A` / `#138A45` / `#DCF8C6` | Botões WhatsApp |
| `success-bg` / `success` | `#E3F5EA` / `#17803D` | Disponível, Encontrado, Aprovada, (Negócio fechado) |
| `warning-bg` / `warning` / `warning-border` | `#FFF3CC` / `#8A6300` / `#E2C35A` | Reservado, Em busca, Em análise, (Em avaliação) |
| `neutral-bg` / `neutral` | `#ECEEF1` / `#5B6474` | Vendido, Finalizado |
| `info-bg` / `info` | `#E5EEFB` / `#0045AA` | Novo, Nova |
| `danger-bg` / `danger` | `#FDE8E8` / `#B42318` | Recusada, Excluir |
| `scrim` / `scrim-panel` | `rgba(5,8,15,.6)` / `rgba(8,12,22,.45)` | Fundo do painel inferior / do painel lateral |

Gradientes: selo Destaque `linear-gradient(180deg,#FFFFFF 0%,#C8C8C8 100%)`; filete prateado `linear-gradient(90deg,rgba(200,200,200,0),#C8C8C8,rgba(200,200,200,0))` com opacidade .35–.5; placeholder `repeating-linear-gradient(135deg,#E8EBF0 0 10px,#DFE3E9 10px 20px)`.
Fora dos tokens: `#E5484D` (só nas marcações de dobra) e `#D6DAE0` (fundo do canvas).

### 2.2 Tipografia

| Família | Pesos usados | Carregamento |
| --- | --- | --- |
| **Inter** | 300, 400, 500, 600, 700, 800 | `next/font/google` |
| **Exo 2** | só **italic 800** (títulos e nomes de modelo) | `next/font/google` |
| **Material Symbols Rounded** | wght 300–600, eixo `FILL` 0/1 (29 ícones preenchidos) | `next/font/local` com **subconjunto** dos ~55 ícones usados (o arquivo do HTML tem 5,4 MB; o subconjunto fica em dezenas de KB) |

- Tamanhos Inter: 14 (mínimo do produto e o mais usado), 15, 16, 17, 18, 20, 22, 26, 28, 30, 38, 46 px. Alturas de linha: normal, 1, 1.4, 1.45, 1.5, 1.55, 20/22/24 px.
- Tamanhos Exo 2 italic 800: 19, 20, 22, 24, 26, 28, 30, 32, 34, 44, 52, 56, 60 px, com altura de linha 1 a 1.1.
- Espaçamento entre letras: `.08em` (marca em caixa alta), `.14em` (rótulos de seção como "GESTÃO" e "CONTATO"), `.32em`/`.36em`/`.42em` (taglines "SEMINOVOS"), `.06em`, `.2em`, `-.02em` (preços).
- Preço: `800 30px/1` com `tabular-nums` e `-.02em`, e "R$" em `700 18px`.
- O monoespaçado de 11 px aparece só nas marcações de foto e não entra no produto.

### 2.3 Forma, sombra e medidas

- **Raios:** 2, 3, 5, 6, 7, 8, 9, 10, 12 (botões e campos), 14 (busca, atalhos), 16 (cartões), 24 (topo do painel inferior), 999 (pílulas).
- **Sombras:**
  - cartão `0 1px 2px rgba(10,20,40,.06),0 8px 24px rgba(10,20,40,.06)`;
  - busca `0 8px 24px rgba(10,20,40,.14)`; botão de filtro `0 8px 24px rgba(0,69,170,.3)`;
  - rodapé fixo `0 -8px 24px rgba(10,20,40,.08)`; selo `0 2px 8px rgba(0,0,0,.18)`;
  - foco `0 0 0 4px rgba(0,69,170,.12)` com borda `2px #0045AA`;
  - painel lateral `-24px 0 48px rgba(0,0,0,.18)`; menu suspenso `0 16px 40px rgba(10,20,40,.18)`;
  - CTA `0 6px 16px rgba(0,48,128,.4)` e `0 12px 28px rgba(0,48,128,.28)`; check de sucesso `0 0 0 10px rgba(0,69,170,.1),0 16px 32px rgba(0,48,128,.3)`;
  - elevações `0 1px 2px rgba(10,20,40,.06),0 16px 40px|0 24px 48px rgba(10,20,40,.08–.12)`.
- **Bordas:** `1px #E4E8EF` (cartões), `1px #D5DAE1` (campos e chips), `1px #EDF0F4` (divisórias), `1.5px #0045AA` (botão secundário), `1.5px dashed #0045AA` (adicionar foto), `2px dashed #B8C2D3` (dropzone).
- **Alturas:** 48 (toque mínimo, botões, chips), 52 (campos e busca mobile), 44 (busca desktop), 56, 64 (header mobile).
- **Espaçamentos (gap):** 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 72. Margem lateral mobile 16 (20 em textos), desktop 64, conteúdo do admin `32px 40px`.
- **Larguras de layout:** menu lateral do admin 248; filtros do desktop 296; coluna do detalhe 440; coluna da simulação 400; prévia do cadastro 340; painel lateral 540; formulário desktop até 640; Venda seu carro até 880 (briefing).

### 2.4 Breakpoint (o HTML não define)

Proposta: **um único breakpoint em 1024 px.** Abaixo dele, layout mobile fluido; a partir dele, layout desktop com conteúdo de no máximo 1440 px e margem de 64 px (32 px entre 1024 e 1279). O mesmo vale para o admin: menu lateral a partir de 1024, barra inferior abaixo. Ver dúvida 4.

---

## 3. Rotas e técnica do detalhe com URL própria

As rotas seguem a seção 3 do briefing, mais `/nao-encontrou/enviado`, `/admin/esqueci-senha` e `/admin/redefinir-senha`.

**Detalhe de pedido, simulação e consignação:** rota dinâmica aninhada (`/admin/pedidos/[id]`), sem rota interceptada.
- `/admin/pedidos/page.tsx` renderiza a lista (`RequestList`, Server Component, com status e busca nos `searchParams`).
- `/admin/pedidos/[id]/page.tsx` renderiza o detalhe. No desktop renderiza também a mesma `RequestList` por baixo (escurecida) e o detalhe como `SidePanel` de 540 px. No mobile mostra só o detalhe, em página cheia (a lista fica `hidden lg:block`).
- **Por quê:**
  - o link direto e o F5 mostram exatamente a mesma tela;
  - com rota interceptada, o F5 cai numa página diferente da navegação suave, que é justo o caso do link direto;
  - o botão "voltar" do navegador fecha o painel;
  - sem estado no cliente, tudo renderiza no servidor;
  - layouts não recebem `searchParams`, por isso a lista é um componente reaproveitado pelas duas páginas, e não um layout;
  - fechar o painel volta para `/admin/pedidos?` mantendo os filtros.
- Os estados efêmeros (painel inferior de filtros, menu do site, ações do veículo, confirmação de exclusão, conta) ficam no cliente, sem URL. Os filtros do catálogo ficam na URL (`?marca=toyota,jeep&precoMax=60000&cambio=automatico&ordem=menor-preco`).

---

## 4. Arquitetura (decisões que afetam todas as etapas)

1. **Uploads direto para o Storage.**
   - Server Actions aceitam 1 MB por padrão e a Vercel limita o corpo da requisição a 4,5 MB, então fotos de 10 MB não podem passar pelo servidor.
   - O fluxo fica assim:
     1. uma Server Action valida o pedido (tipo, tamanho, quantidade, limite por IP);
     2. a Server Action devolve URLs assinadas de upload (`createSignedUploadUrl`);
     3. o navegador envia as fotos direto ao bucket;
     4. o envio do formulário grava só os caminhos das fotos.
   - Vale para o admin (até 20 fotos) e para "Venda seu carro" (até 8 fotos, bucket privado).
2. **Contagem em tempo real dos filtros, sem rede.** O servidor manda para o painel de filtros só os atributos filtráveis dos veículos visíveis (algumas dezenas de bytes por carro). "Ver N veículos" e as contagens por marca são calculados no navegador a cada toque. A lista em si é renderizada no servidor a partir da URL.
3. **Limite por IP:** tabela `limites_envio` no Postgres (hash SHA-256 do IP com sal + formulário + horário). Na Vercel não há memória compartilhada entre execuções, e isso evita um serviço extra (Redis). Mais o campo honeypot.
4. **Escrita pública só no servidor:** `lib/supabase/admin.ts` com `import 'server-only'` e a service role key. O cliente só recebe a anon key.
5. **Máscaras e validação:** utilitários próprios, sem dependência, para CPF, data, WhatsApp e R$. Esquemas Zod compartilhados entre cliente e servidor em `lib/validacao/`. O CPF é validado pelos dígitos verificadores e a idade mínima é 18 anos.
6. **Dados da loja:** `lib/loja.ts` (endereço, horário, WhatsApp, e-mail, mapa, texto "A loja"), com `TODO: dado real do cliente`. A URL do site vem de `NEXT_PUBLIC_SITE_URL`.
7. **SEO:**
   - `generateMetadata` em cada página e Open Graph do veículo com a foto de capa;
   - `app/sitemap.ts` com os veículos visíveis e `app/robots.ts` bloqueando `/admin`;
   - `noindex` no layout do admin.
8. **Dependências:**
   - **App:** `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `tailwindcss` + `@tailwindcss/postcss`, `server-only`, `@dnd-kit/core` + `@dnd-kit/sortable`. O arraste de fotos precisa funcionar no toque, e o drag-and-drop nativo do HTML não funciona em celular.
   - **Desenvolvimento:** `typescript`, `eslint` + `eslint-config-next`, `supabase` (CLI, para migrations), `@playwright/test`, `pixelmatch`, `pngjs`.

---

## 5. Banco de dados (Supabase)

Migrations em `supabase/migrations/`. Ajustes em relação à seção 5 do briefing, com o motivo de cada um:

| Ajuste | Motivo |
| --- | --- |
| Valores em R$ como `numeric(12,2)` | As máscaras das telas têm centavos ("R$ 0,00"); evita erro de ponto flutuante |
| Domínios como `text` + `check` (não `enum`) | É mais fácil acrescentar uma opção numa migration futura |
| `veiculos.publicado_em timestamptz` | "Mais recentes" ordena pela publicação. Por `created_at`, um rascunho publicado depois apareceria como antigo |
| `veiculos.tipo`, `combustivel`, `cambio` com `check` | Os filtros dependem de valores fechados |
| `opcionais.ordem` | Mantém a ordem da lista padrão das telas |
| Tabela `limites_envio` | Limite por IP (seção 4.3) |
| `simulacoes.veiculo_id` e `veiculos.consignacao_id` com `on delete set null` | Excluir um veículo não apaga a simulação (o snapshot preserva nome e preço) |
| Papel de admin em `app_metadata.role = 'admin'` | As políticas checam o papel além de `authenticated`. É uma segunda trava caso alguém ative o cadastro público por engano |

Tabelas:
- `veiculos`: os campos do briefing, mais `publicado_em`. `slug` único; `final_placa char(1)` só com dígito; `selos text[]` restrito aos 5 selos; `etiqueta` (nenhuma/destaque/novidade/baixa_km).
- `veiculo_fotos (id, veiculo_id, path, ordem)`, com `unique (veiculo_id, ordem)` adiável.
- `opcionais (id, nome unique, ordem)` e `veiculo_opcionais (veiculo_id, opcional_id)`, com chave composta.
- `simulacoes`, `pedidos_busca`, `consignacoes` e `consignacao_fotos`: como no briefing. Os status ficam como slugs:
  - pedidos: `novo | em_busca | encontrado | finalizado`;
  - simulações: `nova | em_analise | aprovada | recusada`;
  - consignações: `nova | em_avaliacao | negocio_fechado | recusada`.
- Gatilho de `updated_at`; índices em `veiculos (status, publicado, publicado_em desc)` e em `status, created_at` de cada tabela de contatos.

**RLS e Storage:**
- `veiculos`, `veiculo_fotos`, `opcionais` e `veiculo_opcionais`: o anon só **lê**, e só o que pertence a veículos `disponivel` e `publicado`. O admin pode tudo.
- `simulacoes`, `pedidos_busca`, `consignacoes`, `consignacao_fotos` e `limites_envio`: o anon não tem nenhuma política. A escrita é feita pela service role nas Server Actions; o admin pode tudo.
- Bucket `veiculos`: leitura pública, escrita só do admin, JPG/PNG, 10 MB (ver dúvida 7).
- Bucket `consignacoes`: **privado**, upload por URL assinada emitida no servidor, leitura no admin por URL assinada, JPG/PNG, 10 MB.

**Seed** (`supabase/seed.sql` + `scripts/seed-fotos`):
- 38 veículos: os 11 das telas + 27 fictícios. Os 31 disponíveis seguem as contagens por marca da tela 21: Toyota 5, Jeep 3, Fiat 6, VW 5, Hyundai 4, Chevrolet 4, Honda 2, Renault 2. Reservados: Compass, HR-V + 2. Vendidos: HB20 + 2.
- Fotos de seed: imagens geradas com a mesma hachura e o rótulo das marcações ("foto · corolla prata · pátio"), na quantidade de cada carro (12, 14, 10…). Assim a comparação visual bate até nas fotos.
- 16 opcionais (os 14 das telas + Teto solar + Bancos aquecidos, da tela 28).
- 6 pedidos e 7 simulações das telas (contadores 2 e 3, como nas telas) e 5 consignações (2 novas).
- Usuário admin "Raimundo Sá · Proprietário", criado pelo script `scripts/criar-admin` (nome e papel em `user_metadata`).

**Inconsistências nos dados das telas** (a comparação vai acusar estas diferenças, que são esperadas):
1. Quatro pedidos usam faixas que não existem na lista definida no item 9.6 (ex.: "R$ 100 a 130 mil"). O seed usa a faixa válida mais próxima.
2. O painel de filtros diz "Ver 24 veículos" com Toyota + Jeep marcados, mas só existem 8 desses. O app mostra a contagem real.
3. A ordem do estoque no admin (Corolla, Compass, Strada…) e no catálogo (Corolla, Tracker, Strada…) não pode vir da mesma data de publicação. Sigo a ordem do catálogo.
4. A nota da tela 03 mostra o link `todecarro.com.br/corolla-xei-2022`. Pelo briefing, a rota é `/carros/[slug]` e o slug junta marca, modelo, versão e ano: `/carros/toyota-corolla-xei-2-0-2023`.

---

## 6. Verificação visual (`scripts/comparar-telas`)

1. O Playwright abre `referencias/telas.html`, aplica a classe `dv-pdf` (que esconde rótulos e marcações) e captura `#nXX .dv-card`.
2. Captura a rota equivalente do app em 390×844 ou 1440 de largura, com o mesmo seed. As telas longas são capturadas inteiras; as de 844/900 px, só na altura da janela.
3. As telas de estado (02, 08, 09, 13, 14, 20, 30, 32 e similares) são alcançadas por cliques ou pela URL dentro do script.
4. `pixelmatch` gera a diferença, com máscaras opcionais por tela para dados dinâmicos.
5. O relatório fica em `relatorios/telas/index.html`, com referência, app, diferença e percentual por tela.
6. Corrijo até sobrarem só as diferenças de dados listadas na seção 5.

---

## 7. Etapas

| # | Etapa | Abre do HTML | Entrega |
| --- | --- | --- | --- |
| 1 | Ambiente: Node, git, Next.js, Tailwind v4 com tokens, fontes, ícones, `.env.example` | Tokens (já extraídos) | Projeto rodando, página de tokens só em dev |
| 2 | Componentes comuns | 01, 03, 04, 12, 27 | Header, cartão, chips, campos, botões, painéis, barra e menu do admin |
| 3 | Supabase: migrations, RLS, buckets, seed, script do admin | — | `supabase db reset` reproduzível |
| 4 | Catálogo: `/`, `/carros/[slug]`, `/a-loja`, menu, SEO | 01, 02, 03, 08, 09, 10, 21, 22, 25 | Filtros na URL, ordenação, WhatsApp |
| 5 | Formulários públicos: simular (3 rotas), pedido de busca, venda do carro, confirmações, política | 04, 05, 05b, 06, 07, 23, 24 + seção 10 | Validação no cliente e no servidor, consentimento, honeypot, limite por IP, uploads |
| 6 | Admin: login e senha, estoque, cadastro, pedidos, simulações, consignações, conta | 11–20, 26–32 + seção 10 | Status, contadores, anotações, copiar, cadastrar a partir da consignação |
| 7 | Comparação visual tela por tela e correções | todas | Relatório |
| 8 | Testes dos fluxos completos (Playwright), lint, typecheck, build, README | — | Pronto para a Vercel |

---

## 8. Dúvidas e decisões (preciso da sua resposta nas marcadas com ★)

1. ★ **Node.js:** posso instalar o Node LTS com `winget install OpenJS.NodeJS.LTS`? Sem ele não dá para começar.
2. ★ **Supabase:** projeto na nuvem (você cria em supabase.com e cola as três chaves no `.env.local`) ou local com Docker? Recomendo a nuvem: um projeto de desenvolvimento agora e um de produção no deploy.
3. **Git:** posso rodar `git init` na pasta? Recomendado.
4. **Breakpoint único em 1024 px** (seção 2.4). OK?
5. **Paginação:**
   - Catálogo: as telas não mostram paginação, então listo todos os disponíveis (31).
   - Estoque do admin: a tela mostra "1–8 de 38". Proponho 20 por página no mesmo componente; 8 por página só se você preferir idêntico à prancha.
6. **Modelo como seleção no cadastro** (15/28 mostram seta de select): não há base de modelos. Proposta: campo de texto com sugestões dos modelos já cadastrados daquela marca, com o mesmo visual e a seta.
7. **Fotos dos veículos:**
   - Proposta: bucket público com nomes aleatórios (UUID). É rápido e tem cache; a foto de um rascunho só abre para quem tiver a URL exata.
   - Alternativa estrita: bucket privado com URL assinada. Custa mais e cacheia pior.
8. **Esqueci minha senha:**
   - O e-mail padrão do Supabase só envia para membros da equipe do projeto e com limite baixo.
   - Para produção, é preciso configurar um SMTP próprio (ex.: Resend).
   - Até lá, o e-mail do admin precisa ser membro do projeto no Supabase.
9. **Limite de envios:** 5 por formulário, por IP, por hora. OK?
10. **Estado de erro dos campos** (não aparece nas telas): borda `2px #B42318`, mensagem `400 14px #B42318` abaixo do campo, no mesmo padrão do foco. OK?
11. **Etiqueta da forma de venda** (consignações): neutra (`#F5F7FA`, borda `#D5DAE1`, texto `#3A4252`, com ícone), para não competir com as cores de status. OK?
12. **Barra inferior com 4 abas:**
    - "Consignações" mede 96,8 px em `600 14px`, e cada aba teria 97,5 px em 390 px de largura, ou seja, no limite.
    - Proposta: largura de cada aba pelo conteúdo, para caber até em 360 px sem quebrar e sem reduzir a fonte.
13. **"Manter conectado":** desmarcado, a sessão termina ao fechar o navegador; marcado, ela dura até o refresh token expirar. OK?
14. **Informação, não é pergunta:** o plano gratuito do Supabase pausa projetos parados por 7 dias e não tem backup diário. Para produção, recomendo o plano Pro.
