# Servidor MCP do estoque (agente Fco da SendPulse)

O site tem um servidor MCP em **`https://www.todecarrothe.com.br/api/mcp`**. Por ele, o agente de IA **Fco**, da
SendPulse, consulta o estoque real durante as conversas no WhatsApp:

```
Cliente no WhatsApp → SendPulse → Fco decide consultar → /api/mcp (este site) → Supabase → resposta → WhatsApp
```

Não há planilha nem cadastro na SendPulse: cada pergunta lê o banco naquele momento. Quando o lojista muda um preço
ou marca um carro como vendido no painel, a próxima resposta do Fco já sai com o dado novo.

---

## 1. Ferramentas

| Ferramenta | Para quê | Pedidos atendidos |
| --- | --- | --- |
| `buscar_veiculos` | Busca por marca, modelo, versão, categoria, faixa de preço, ano, km, câmbio e combustível (todos opcionais) | 1, 2, 6 |
| `listar_estoque` | Total, contagem por marca e categoria, faixa de preço e a lista atualizada | 8 |
| `detalhar_veiculo` | Ficha completa: km, ano, motorização, câmbio, combustível, cor, equipamentos, selos, preço, todas as fotos e link | 3, 4, 5, 6 |
| `verificar_disponibilidade` | Confere agora se até 10 veículos continuam à venda e o preço atual | 7 |

Os 8 itens pedidos viraram 4 ferramentas. A SendPulse envia a descrição de todas as ferramentas conectadas em
cada pergunta ao modelo, então menos ferramentas, cada uma com um papel claro, gastam menos e confundem menos o
agente.

- **Identificador do veículo (`id`):** é o slug do anúncio (`toyota-corolla-xei-2-0-2023`). `detalhar_veiculo` e
  `verificar_disponibilidade` também aceitam o **link do anúncio**, que o cliente manda quando toca em "Tenho
  interesse" no site.
- **Respostas:** JSON estruturado (`structuredContent`, com `outputSchema`) e o mesmo JSON em texto. Cada veículo
  traz os números puros (`preco: 129900`) e o texto pronto para o cliente (`preco_texto: "R$ 129.900"`).
- **Só leitura:** nenhuma ferramenta altera dados.

### O que o servidor nunca mostra

- **Veículo reservado, vendido, em rascunho ou apagado.** A leitura usa a chave pública do Supabase, e o RLS só a
  deixa ver carros `disponivel` e publicados. Mesmo um erro no código não teria como mostrar um carro vendido.
- **Dados de clientes** (simulações, pedidos, consignações, cupons). A chave pública não tem acesso a essas
  tabelas.

Por isso a política de privacidade não muda: o servidor só repete o que o catálogo público já mostra.

### Limitações

- **Motorização:** o cadastro não tem um campo para o motor. `motorizacao` é extraída do nome da versão
  ("XEi 2.0" → `2.0`, "Highline 1.0 TSI" → `1.0 turbo`) e vem `null` quando a versão não traz a cilindrada.
  Para ter sempre esse dado, o caminho é criar um campo no formulário do veículo (migration nova).
- **Reservado × vendido:** para o servidor, os dois são apenas "não disponível", porque a chave pública não vê o
  status de carros fora do catálogo. O Fco deve dizer que o carro não está mais disponível e oferecer outras
  opções.

---

## 2. Publicar (Vercel)

1. Gere o token, um valor aleatório longo (mínimo de 32 caracteres):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Na Vercel, em **Settings → Environment Variables**, crie **`MCP_TOKEN`** com esse valor (ambiente
   *Production*). Não coloque o token no código, em commits nem no chat.
3. Na mesma tela, confira se **`NEXT_PUBLIC_SITE_URL`** é `https://www.todecarrothe.com.br`. É dela que saem os
   links dos anúncios que o Fco envia.
4. Faça o deploy e teste. Sem token, a resposta deve ser **401**:

   ```bash
   curl -i -X POST https://www.todecarrothe.com.br/api/mcp
   ```

   Com o token, a resposta deve listar as 4 ferramentas:

   ```bash
   curl -X POST https://www.todecarrothe.com.br/api/mcp \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -H "MCP-Protocol-Version: 2025-06-18" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
   ```

> Use o endereço exato com `www`. Se o domínio sem `www` redirecionar para o com `www`, algumas ferramentas não
> seguem o redirecionamento de um POST e a conexão falha.

---

## 3. Conectar na SendPulse

1. **Chatbots → AI Agents → aba MCP Servers → Add server.**
2. **MCP Server URL:** `https://www.todecarrothe.com.br/api/mcp`
3. **Internal name:** `todecarro_estoque`
4. **Authentication:** *Bearer token*, colando o mesmo valor de `MCP_TOKEN`.
5. Clique em **Get tools**, marque as 4 ferramentas e clique em **Connect**.
6. Abra o agente **Fco** (ou o elemento *AI Agent* do fluxo), ligue **MCP servers** e selecione `todecarro_estoque`.
7. Deixe **Reasoning** em *Low* ou mais. Na SendPulse, o MCP só funciona com modelos da OpenAI e da Claude.
8. Acrescente ao prompt do Fco o trecho da seção 4 e teste com **Save and send to yourself**.

---

## 4. Trecho para o prompt do Fco

```
Estoque de veículos
- Você tem acesso ao estoque real do site da Tô de Carro pelas ferramentas do servidor "todecarro_estoque".
- Nunca invente nem repita de memória preço, quilometragem, ano, equipamentos ou disponibilidade. Sempre consulte.
- Pedido genérico ("o que vocês têm?", "quais SUVs?", "carro até 60 mil"): use buscar_veiculos com os filtros
  que o cliente disse, ou listar_estoque para uma visão geral.
- Pergunta sobre um carro específico, ou quando o cliente mandar o link de um anúncio: use detalhar_veiculo.
- Antes de dizer que um carro está disponível, de passar o preço final ou de combinar uma visita: use
  verificar_disponibilidade.
- Se o carro não estiver disponível, diga isso com gentileza e ofereça opções parecidas (mesma categoria e faixa
  de preço) com buscar_veiculos.
- Mostre no máximo 3 a 5 carros por mensagem: nome, ano, km, preço (use preco_texto) e o link do anúncio.
- Para fotos, envie o link do anúncio. Se o canal permitir imagem, use foto_capa.
- Para financiamento, ofereça a simulação pelo link do anúncio.
```

---

## 5. Testar no computador

Com o `.env.local` preenchido (inclusive `MCP_TOKEN`) e `npm run dev` rodando:

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" -H "MCP-Protocol-Version: 2025-06-18" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buscar_veiculos","arguments":{"categoria":"suv","preco_max":150000}}}'
```

Também dá para usar o MCP Inspector (`npx @modelcontextprotocol/inspector`). Use o transporte *Streamable HTTP*,
a URL `http://localhost:3000/api/mcp` e o cabeçalho `Authorization: Bearer SEU_TOKEN`.

---

## 6. Onde está o código

| Arquivo | O que faz |
| --- | --- |
| `app/api/mcp/route.ts` | A rota: confere o token e entrega a requisição ao MCP (`mcp-handler`, Streamable HTTP, sem sessão) |
| `lib/mcp/autenticacao.ts` | Compara o `Authorization: Bearer` com `MCP_TOKEN` em tempo constante |
| `lib/mcp/servidor.ts` | As 4 ferramentas: descrições, parâmetros (Zod), esquemas das respostas e instruções do servidor |
| `lib/mcp/estoque.ts` | Busca, resumo do estoque, motorização e o formato dos veículos (funções puras) |
| `lib/catalogo/consultas.ts` | `lerCatalogoAgora`, `lerVeiculoAgora` e `precosNoCatalogoAgora`: as mesmas leituras do catálogo, sem cache |

**Para trocar o token:** gere outro, atualize `MCP_TOKEN` na Vercel, faça o redeploy e troque o token no cadastro
da SendPulse.

**Nova ferramenta:** registre em `lib/mcp/servidor.ts` com descrição clara, `inputSchema` e `outputSchema`. Se ela
precisar de algo além do catálogo público (status de reservado, dados de clientes), pare e reavalie: isso exigiria
a service role e mudaria a política de privacidade.
