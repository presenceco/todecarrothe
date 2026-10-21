# Notas sobre o HTML de referência

Particularidades de `referencias/telas.html` que afetam a reprodução exata das telas.

## 1. Sem `box-sizing: border-box` global

O HTML das telas não tem o reset `* { box-sizing: border-box }`. Onde um elemento declara altura ou largura
**junto com** padding ou borda e **sem** `box-sizing:border-box` no próprio estilo, ele renderiza maior do
que o declarado. O Tailwind usa `border-box` em tudo, então nesses casos a classe precisa ter o tamanho
**renderizado**.

Levantado na própria referência (script no navegador sobre `.dv-card [style]`):

| Tela | Elemento | Declarado | Renderizado |
| --- | --- | --- | --- |
| 01 | Chips de marca (Todas, Toyota…) | 48 + borda 1 | **50** de altura |
| 01 | Atalhos (Até R$ 60 mil, SUVs, Automáticos) | 68 + borda 1 | **70** |
| 02 | Seletores de ano (2020 ▾ / 2024 ▾) | 48 + borda 1 | **50** |
| 03 | Selos "Verificado pela loja" | 40 + borda 1 | **42** |
| 07 / 24 | Linha do interruptor (troca) | min 52 + padding-top 12 + borda 1 | **≥ 65** |
| 13 | "Cancelar" | 52 + borda 1 | **54** |
| 15 | "Adicionar fotos" | 48 + borda 1 | **50** |
| 16 / 18 | "Ver detalhes" dos cartões | 48 + borda 1 | **50** |
| 17 / 19 | "Copiar dados" (mobile) | 52 + borda 1 | **54** |
| 21 | Atalhos do hero desktop | 48 + borda 1 | **50** |
| 21 | Ano "De" / "Até" | 44 + borda 1 | **46** |
| 21 | "Ordenar: Mais recentes" | 44 + borda 1 | **46** |
| 21 | Chamada "Não encontrou seu carro?" | min 420 + padding 32×2 | **484** |
| 26 | Cartão do login | largura 420 + padding 40×2 | **500** de largura |
| 27 | Cabeçalho da tabela | 44 + borda inferior 1 | **45** |
| 27 | Linhas da tabela | 72 + borda inferior 1 | **73** |
| 27 | Menu "⋯" aberto | largura 260 + padding 6×2 + borda 1×2 | **274** |
| 27 | Item "Excluir" do menu | 44 + borda superior 1 | **45** |
| 28 | "Salvar rascunho" | 48 + borda 1 | **50** |
| 28 | Área de soltar fotos | 104 + borda 2 | **108** |
| 29 / 30 | Linhas | 76 + borda 1 | **77** |
| 31 / 32 | Linhas | 80 + borda 1 | **81** |

Quando a mesma peça aparece com `box-sizing:border-box` em outra tela, ela tem o tamanho declarado
(ex.: chips de marca do painel de filtros, 48; "Copiar dados" do painel desktop, 52).

## 2. Frações de pixel

Alturas de linha `normal` geram frações (ex.: Inter 15px = 18,15px), então elementos caem em posições como
y = 299,39. A comparação visual alinha a fração da posição do elemento do app à da referência antes de
capturar (scripts/lib/comparacao.ts); sem isso, o antisserrilhado do texto muda e acusa diferença falsa.

## 3. Algarismos

Só alguns números usam `tabular-nums` nas telas (preços, contagem das marcas no filtro desktop, ano/km na
lista do admin). Contadores de chips, abas e badges usam algarismos proporcionais.

## 4. Larguras que as telas não cobrem (achados do teste de pior caso, etapa 2)

- **Cabeçalho das listas do admin mobile:** a linha tem 202px fixos (símbolo, distâncias, busca, avatar), então
  sobram 188px para título + pílula em 390px. "Estoque · 38 veículos" (182px) cabe; "Simulações · 3 novas" (193px)
  e "Consignações · 12 novas" (224px) não. O componente esconde a pílula quando ela não cabe inteira.
- **Barra de ferramentas do estoque desktop (27):** busca de 380px + abas de status não cabem em 1024px
  (sobram 696px). As abas rolam na horizontal; na etapa 6, decidir se a busca encolhe ou se a linha quebra.
- **320px:** o câmbio do cartão quebra para a linha de baixo; o wordmark do header cai de 30 para 26px abaixo de 360px.

## 5. Grades e flex (achados da comparação da etapa 4)

- `grid-cols-N` do Tailwind é `repeat(N, minmax(0, 1fr))`; as telas usam `repeat(N, 1fr)`, que deixa a coluna
  crescer até o conteúdo mínimo (ex.: atalho "Até R$ 60 mil" pede 115,88px; as outras colunas ficam com
  113,06px). Onde o conteúdo pode passar da divisão igual, use `grid-cols-[repeat(N,1fr)]`.
- Em flex com `gap`, texto partido em vários nós vira vários itens: o espaço no fim de um nó some e entra o
  `gap`. Mantenha o texto num nó só (ex.: "Ordenar: Mais recentes").

## 6. Comparação visual: o que o script normaliza

- Chromium do teste sem suavização LCD (`--disable-lcd-text`): o `<dialog>` fica em camada própria e usaria a
  suavização cinza, a página a colorida; no celular é sempre cinza.
- Transições desligadas, ponteiro afastado depois de abrir painéis, `sticky` tratado como `relative` e janela
  esticada até a altura da página quando há rodapé fixo.
