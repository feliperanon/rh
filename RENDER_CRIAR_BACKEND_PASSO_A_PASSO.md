# Como criar o backend no Render – Passo a passo

Você já tem o **frontend** (tela de login) e o **banco de dados**. Falta criar o **serviço do backend** (a API) para o login funcionar. Siga os passos abaixo.

---

## Passo 1: Abrir o Render

1. Abra o navegador e acesse: **https://dashboard.render.com**
2. Faça login se precisar.

---

## Passo 2: Criar um novo Web Service (backend)

1. Clique no botão **"New +"** (canto superior direito, azul).
2. Escolha **"Web Service"** (não escolha Static Site nem Background Worker).

---

## Passo 3: Conectar o repositório

1. Na tela que abrir, procure onde está escrito **"Connect a repository"** ou **"Build and deploy from a Git repository"**.
2. Se o seu projeto **já estiver conectado** (GitHub/GitLab), clique nele na lista.
3. Se não estiver, clique em **"Connect account"** ou **"Configure account"** e autorize o Render a acessar o repositório onde está o projeto **rh**.
4. Depois de conectar, escolha o repositório **rh** (ou o nome que você deu no GitHub).

Clique em **"Connect"** ou **"Continue"** quando terminar.

---

## Passo 4: Configurar o serviço (backend)

Preencha os campos **exatamente** como abaixo. Não mude o nome do repositório.

| Campo | O que colocar |
|-------|-------------------------------|
| **Name** | `rh-backend` (ou outro nome que você quiser para a API) |
| **Region** | Oregon (ou a mesma do seu banco) |
| **Branch** | `main` |
| **Root Directory** | Deixe **em branco** (não preencha) |
| **Runtime** | Node |
| **Build Command** | `cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build` |
| **Start Command** | `cd backend && npm run start:prod` |
| **Instance Type** | Free (se quiser plano grátis) |

---

## Passo 5: Variáveis de ambiente (Environment)

1. Procure a seção **"Environment"** ou **"Environment Variables"** na mesma tela (ou em "Advanced").
2. Clique em **"Add Environment Variable"** e adicione **uma por uma**:

| Key (nome) | Value (valor) |
|------------|----------------|
| `DATABASE_URL` | Cole aqui a **Internal Database URL** do seu banco. No Render: abra o banco **rh-backend** (PostgreSQL) → aba **Info** → copie **"Internal Database URL"**. No final, adicione `?schema=public` se ainda não tiver. |
| `JWT_SECRET` | Uma frase longa e secreta. Exemplo: `minha-chave-jwt-super-secreta-2026` (em produção use uma chave forte). |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://rh-gppm.onrender.com` |

3. Salve (geralmente há um botão **"Add"** ou **"Save"** ao lado de cada variável).

---

## Passo 6: Criar o serviço

1. Role até o final da página.
2. Clique em **"Create Web Service"** (ou **"Deploy"**).
3. O Render vai começar o deploy. Espere alguns minutos (pode levar 5–10 min).
4. Acompanhe em **"Logs"**. Quando aparecer algo como **"Your service is live"**, o backend está no ar.

---

## Passo 7: Copiar a URL do backend

1. No topo da página do serviço que você criou (rh-backend), aparece a **URL** do serviço.
2. Algo como: **https://rh-backend.onrender.com** (o nome pode mudar conforme o que você colocou em **Name**).
3. **Copie** essa URL. Você vai usar no próximo passo.

---

## Passo 8: Dizer ao frontend qual é a URL da API

1. No Render, abra o serviço do **frontend** (o **rh** ou **rh-gppm** – aquele que mostra a tela de login).
2. Vá em **"Environment"** (menu da esquerda).
3. Procure a variável **NEXT_PUBLIC_API_URL**.
   - Se existir: **edite** e coloque a URL do backend que você copiou (ex.: `https://rh-backend.onrender.com`). **Sem barra no final.**
   - Se não existir: clique em **"Add Environment Variable"**, Key: `NEXT_PUBLIC_API_URL`, Value: a URL do backend.
4. Clique em **"Save Changes"**.
5. Faça um **novo deploy** do frontend: **"Manual Deploy"** → **"Deploy latest commit"**.

---

## Passo 9: Criar seu usuário (chamar a API)

Quando o **backend** estiver **Live** (verde):

1. Abra o **PowerShell** no seu computador.
2. Cole o comando abaixo e **troque** `https://rh-backend.onrender.com` pela **URL real** do seu backend (a que você copiou no Passo 7):

```powershell
Invoke-RestMethod -Uri "https://rh-backend.onrender.com/auth/init" -Method POST
```

3. Aperte Enter. Deve aparecer uma mensagem de sucesso (usuários criados, etc.).

---

## Passo 10: Fazer login no site

1. Abra no navegador: **https://rh-gppm.onrender.com**
2. Use:
   - **E-mail:** `feliperanon@live.com`
   - **Senha:** `571232Ce!`
3. Clique em **Entrar**.

Se tudo estiver certo, você entra no painel.

---

## Resumo do que você tem no final

| Serviço no Render | O que é | URL exemplo |
|-------------------|--------|-------------|
| **rh** ou **rh-gppm** | Frontend (tela de login) | https://rh-gppm.onrender.com |
| **rh-backend** (novo) | Backend (API) | https://rh-backend.onrender.com |
| **rh-backend** (PostgreSQL) | Banco de dados | (só usado pelas variáveis, não abre no navegador) |

Se algum passo não der certo, diga em qual passo parou e o que apareceu na tela que eu te ajudo a ajustar.
