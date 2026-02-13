# Como configurar o projeto no Render – Passo a passo

Este guia explica **como fazer** para o site **https://rh-gppm.onrender.com** funcionar e mostrar a tela de login (sem "Server error").

---

## O que você precisa ter

- Conta no [Render](https://dashboard.render.com)
- Repositório do projeto no GitHub (ou GitLab) já conectado ao Render
- Dois serviços no Render: **rh-backend** (API) e **rh-gppm** (site/login)

Se você ainda **não conectou** o repositório ao Render, vá direto para a [Parte A](#parte-a-primeira-vez-conectar-o-repositório-e-criar-os-serviços).  
Se os serviços **já existem** e só aparece "Server error" ou erro 500, vá para a [Parte B](#parte-b-corrigir-erro-server-error--500).

---

## Parte A: Primeira vez – Conectar o repositório e criar os serviços

### 1. Criar o banco de dados (PostgreSQL)

1. Acesse: **https://dashboard.render.com**
2. Clique em **New +** → **PostgreSQL**
3. Preencha:
   - **Name:** `rh-db`
   - **Region:** Oregon (ou a mesma do seu app)
   - **Plan:** Free
4. Clique em **Create Database**
5. Quando o banco estiver **Available**, entre nele e copie a **Internal Database URL** (não use a External)

### 2. Criar os serviços com o Blueprint

1. No Render, clique em **New +** → **Blueprint**
2. Conecte o repositório do seu projeto (GitHub/GitLab)
3. O Render vai ler o arquivo **`render.yaml`** na raiz do projeto e criar:
   - **rh-backend** (API)
   - **rh-gppm** (site com tela de login)
4. Na tela do Blueprint, clique em **Apply**
5. **Antes do primeiro deploy**, configure as variáveis (Parte B, passo 2 e 3)

---

## Parte B: Corrigir erro "Server error" / 500

Quando aparece **"Server error"** ou **"There is a problem with the server configuration"**, é porque as variáveis de ambiente do **rh-gppm** não estão configuradas (ou estão erradas). Siga estes passos.

### 1. Abrir o serviço do site (rh-gppm)

1. Acesse: **https://dashboard.render.com**
2. Na lista de serviços, clique em **rh-gppm** (é o serviço do **frontend**, onde fica a tela de login)

### 2. Configurar as variáveis de ambiente do rh-gppm

1. No menu da esquerda, clique em **Environment**
2. Clique em **Add Environment Variable** (ou **Edit** nas que já existem) e confira/crie **estas variáveis**:

| Nome (Key) | Valor (Value) | Obrigatório? |
|------------|----------------|--------------|
| **NEXTAUTH_SECRET** | Uma chave longa e aleatória. No Render você pode clicar em **"Generate"** (ao lado do campo) para gerar automaticamente. | Sim |
| **NEXTAUTH_URL** | `https://rh-gppm.onrender.com` (exatamente assim, **sem** barra no final) | Sim |
| **NEXT_PUBLIC_API_URL** | `https://rh-backend.onrender.com` (URL da API) | Sim |
| **NODE_ENV** | `production` | Sim (geralmente já existe) |

**Como preencher NEXTAUTH_SECRET no Render:**

- Ao adicionar a variável **NEXTAUTH_SECRET**, aparece a opção **"Generate"** (ou um ícone de chave).
- Clique em **Generate** e o Render preenche uma chave segura para você.
- Ou digite você mesmo uma frase longa e difícil de adivinhar (por exemplo: `minha-chave-super-secreta-rh-2026-nao-compartilhar`).

3. Clique em **Save Changes**

### 3. Fazer o deploy (subir a aplicação de novo)

1. No topo da página do **rh-gppm**, clique em **Manual Deploy**
2. Escolha **Clear build cache & deploy**
3. Aguarde alguns minutos (o build e o deploy aparecem em **Logs**)
4. Quando o status ficar **Live** (verde), está no ar

### 4. Testar

Abra no navegador: **https://rh-gppm.onrender.com**

- Deve aparecer a **tela de login** do sistema.
- Se ainda aparecer "Server error", confira de novo o passo 2 (NEXTAUTH_SECRET e NEXTAUTH_URL) e faça outro **Manual Deploy** → **Clear build cache & deploy**.

---

## Configurar o backend (rh-backend) – para o login funcionar de verdade

A tela de login só funciona se a **API** estiver no ar e com banco configurado.

### 1. Abrir o serviço da API

1. No Dashboard do Render, clique em **rh-backend**

### 2. Variáveis de ambiente do rh-backend

1. No menu da esquerda, clique em **Environment**
2. Adicione ou confira:

| Nome (Key) | Valor (Value) |
|------------|----------------|
| **DATABASE_URL** | A **Internal Database URL** do PostgreSQL que você criou (Passo A.1). Exemplo: `postgresql://usuario:senha@dpg-xxxxx-a.oregon-postgres.render.com/nome_do_banco?schema=public` |
| **JWT_SECRET** | Uma chave longa (pode usar "Generate" no Render) |
| **NODE_ENV** | `production` |
| **PORT** | `10000` |
| **FRONTEND_URL** | `https://rh-gppm.onrender.com` |

3. Clique em **Save Changes**
4. Faça **Manual Deploy** → **Clear build cache & deploy** no **rh-backend**

### 3. (Opcional) Criar usuários iniciais no banco

1. No serviço **rh-backend**, no menu da esquerda, clique em **Shell**
2. No terminal que abrir, digite:

```bash
cd backend
npx prisma db seed
```

3. Siga a mensagem que aparecer (isso cria os usuários para você fazer login)

---

## Resumo rápido

| O que fazer | Onde | O que configurar |
|-------------|------|-------------------|
| Site mostrar login e não "Server error" | **rh-gppm** → Environment | **NEXTAUTH_SECRET** (Generate) e **NEXTAUTH_URL** = `https://rh-gppm.onrender.com` |
| Login funcionar (validar usuário/senha) | **rh-backend** → Environment | **DATABASE_URL** (Internal do Postgres), **JWT_SECRET**, **FRONTEND_URL** = `https://rh-gppm.onrender.com` |
| Ver erros / status do deploy | Qualquer serviço | Aba **Logs** |

Depois de salvar as variáveis, **sempre** fazer **Manual Deploy** (e, se quiser, "Clear build cache & deploy") para as mudanças valerem.

---

## Se ainda der erro

1. **Logs:** Em **rh-gppm** ou **rh-backend**, abra **Logs** e veja a última mensagem de erro.
2. **URLs:** Confirme que **NEXTAUTH_URL** é exatamente `https://rh-gppm.onrender.com` (sem barra no final) e que **NEXT_PUBLIC_API_URL** é `https://rh-backend.onrender.com`.
3. **Redeploy:** Depois de mudar qualquer variável, faça de novo **Manual Deploy** no serviço que você alterou.

Se você disser qual mensagem aparece na tela ou nos Logs, dá para indicar o próximo passo exato.
