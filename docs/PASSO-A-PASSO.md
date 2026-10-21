# Passo a passo: Supabase e GitHub

Leva uns 15 minutos. No fim, volte ao Claude e mande: **"Preenchi o .env.local, pode aplicar a etapa 3."**

> Os nomes dos botões podem mudar um pouco no site. Se algum não estiver exatamente assim, procure o mais
> parecido.

---

## 1. Supabase: criar o projeto (supabase.com)

1. Acesse **supabase.com** e clique em **Start your project** (ou **Sign in**).
2. Entre com o **GitHub da conta certa** (ou com e-mail e senha).
3. Se for o primeiro acesso, ele pede para criar uma **organização**:
   - Nome: `Tô de Carro`
   - Tipo: **Company** (ou Personal, tanto faz)
   - Plano: **Free**
4. Clique em **New project** e preencha:
   - **Name:** `todecarro`
   - **Database Password:** clique em **Generate a password**, depois em **Copy**, e **guarde essa senha**
     (cole num bloco de notas por enquanto). Ela vai no passo 4.
   - **Region:** **South America (São Paulo)**
   - Deixe o resto como está e clique em **Create new project**.
5. Espere 1 a 2 minutos até aparecer o painel do projeto.

## 2. Supabase: copiar as chaves

No menu da esquerda do projeto, vá em **Project Settings** (ícone de engrenagem, embaixo).

1. **URL do projeto:** em **Data API** (ou no botão **Connect**, no topo), copie a **Project URL**.
   Ela tem o formato `https://abcdefghijkl.supabase.co`.
2. **Chaves:** em **API Keys**. O painel pode mostrar duas abas; vale qualquer uma das duas:
   - Aba nova: **Publishable key** (`sb_publishable_…`) e **Secret key** (`sb_secret_…`; clique em
     **Reveal** ou crie uma, se pedir).
   - Aba **Legacy API keys**: **anon public** e **service_role** (clique em **Reveal**).

   A pública é a **Publishable** ou a **anon**. A secreta é a **Secret** ou a **service_role**.

> A chave secreta dá acesso total ao banco. Cole só no arquivo `.env.local` (passo 4), nunca em chat,
> e-mail ou print.

## 3. Supabase: token para o Claude aplicar o banco

1. Clique no seu **avatar** (canto superior direito) → **Account preferences** (ou **Account**).
2. Abra **Access Tokens** e clique em **Generate new token**.
3. Nome: `todecarro-cli`. Clique em **Generate token** e **copie** (ele só aparece uma vez).

## 4. Preencher o `.env.local` (no seu computador)

1. Abra a pasta do projeto:
   `Documentos\Presence.co\Tô De Carro The\Development`
2. Clique com o botão direito em **`.env.local`** → **Abrir com** → **Bloco de Notas**.
3. Cole cada valor logo depois do `=`, **sem espaços e sem aspas**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=(chave pública: Publishable ou anon)
   SUPABASE_SERVICE_ROLE_KEY=(chave secreta: Secret ou service_role)
   SUPABASE_DB_PASSWORD=(senha do banco do passo 1)
   SUPABASE_ACCESS_TOKEN=(token do passo 3)
   ```

   Não mexa nas outras linhas (`NEXT_PUBLIC_SITE_URL` e `IP_HASH_SALT` já estão preenchidas).
4. Salve (**Ctrl+S**) e feche.

## 5. GitHub: dados para os commits (github.com)

Os commits vão sair com o nome e o e-mail da conta certa. Faça login no GitHub dessa conta e:

1. **Nome:** clique no avatar → **Your profile**. Anote o nome que aparece (ou o usuário, `@…`).
2. **E-mail:** avatar → **Settings** → **Emails**. Use o e-mail principal ou, para não expor o seu
   e-mail, o endereço **noreply** que aparece ali (ex.: `12345678+usuario@users.noreply.github.com`).
3. Mande esses dois dados para o Claude. Ele configura só neste projeto, sem mudar o resto do computador.

**Opcional:** se quiser o código já no GitHub, crie um repositório **vazio e privado**: botão **New**,
nome `todecarro`, **Private**, **sem** README, .gitignore ou licença. Depois mande o link para o Claude.

## 6. De volta ao Claude

Mande: **"Preenchi o .env.local, pode aplicar a etapa 3."** e os dados do GitHub (passo 5).

O Claude aplica as tabelas, os dados de exemplo, as fotos e as configurações de login. Depois disso,
**você** cria o seu usuário do painel. Rode no terminal do app (o Claude vai lembrar):

```bash
npm run criar-admin -- --email seu@email.com --nome "Seu Nome" --papel "Proprietário"
```

A senha é digitada no terminal (não aparece na tela) e precisa ter **10 caracteres ou mais, com
maiúscula, minúscula e número**.

---

**Vercel:** nada a fazer agora. A publicação do site é a última etapa.
