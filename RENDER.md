# Fazer o projeto rodar no Render

Este guia descreve como colocar o **backend** (NestJS) e o **frontend** (Next.js) no [Render](https://render.com).

---

## Pré-requisitos

- Conta no [Render](https://dashboard.render.com/register)
- Repositório Git (GitHub/GitLab) com o projeto
- **PostgreSQL** no Render (pode criar ao configurar o backend)

---

## 1. Banco de dados PostgreSQL

1. No [Dashboard do Render](https://dashboard.render.com), clique em **New** → **PostgreSQL**.
2. Preencha:
   - **Name**: `rh-db` (ou outro nome)
   - **Region**: Oregon (mesma do app)
   - **Plan**: Free
3. Clique em **Create Database**.
4. Quando estiver **Available**, entre no banco e vá em **Info**.
5. Copie a **Internal Database URL** (use sempre a *Internal* para o backend no Render).

Exemplo (substitua pela sua URL):

```txt
postgresql://usuario:senha@dpg-xxxxx-a.oregon-postgres.render.com/nome_do_banco
```

Recomendado adicionar `?schema=public` no final:

```txt
postgresql://usuario:senha@dpg-xxxxx-a.oregon-postgres.render.com/nome_do_banco?schema=public
```

---

## 2. Conectar repositório e criar serviços

### Opção A: Blueprint (recomendado)

1. No Render: **New** → **Blueprint**.
2. Conecte o repositório do projeto (GitHub/GitLab).
3. Render vai ler o arquivo **`render.yaml`** na raiz e criar os dois Web Services:
   - **rh-backend**
   - **rh-gppm** (frontend)
4. Antes do primeiro deploy, configure as variáveis de ambiente (passo 3).

### Opção B: Dois Web Services manuais

**Backend**

1. **New** → **Web Service**.
2. Conecte o repositório.
3. Configure:
   - **Name**: `rh-backend`
   - **Region**: Oregon
   - **Root Directory**: *(deixe vazio)*
   - **Build Command**: `cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Plan**: Free

**Frontend**

1. **New** → **Web Service**.
2. Mesmo repositório.
3. Configure:
   - **Name**: `rh-gppm`
   - **Region**: Oregon
   - **Root Directory**: *(vazio)*
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Start Command**: `cd frontend && npm run start`
   - **Plan**: Free

---

## 3. Variáveis de ambiente

### rh-backend

No serviço **rh-backend**, aba **Environment**, adicione:

| Key           | Value |
|---------------|--------|
| `DATABASE_URL` | *(Internal Database URL do Postgres, com `?schema=public`)* |
| `JWT_SECRET`   | *(string longa e aleatória; o Render pode gerar)* |
| `NODE_ENV`     | `production` |
| `PORT`         | `10000` |
| `FRONTEND_URL` | `https://rh-gppm.onrender.com` *(ou a URL real do seu frontend no Render)* |

**Importante:** use a **Internal Database URL** do PostgreSQL, não a External.

### rh-gppm (frontend)

No serviço **rh-gppm**, aba **Environment**:

| Key                  | Value |
|----------------------|--------|
| `NODE_ENV`           | `production` |
| `NEXT_PUBLIC_API_URL`| `https://rh-backend.onrender.com` *(ou a URL real do backend)* |
| `NEXTAUTH_URL`       | `https://rh-gppm.onrender.com` *(URL do próprio frontend)* |
| `NEXTAUTH_SECRET`    | *(string longa e aleatória; o Render pode gerar)* |

O Render já define `PORT` automaticamente; não é obrigatório definir no frontend.

---

## 4. Deploy

1. Salve as variáveis de ambiente.
2. Se os serviços foram criados pelo Blueprint, o deploy deve iniciar sozinho. Senão, use **Manual Deploy** → **Deploy latest commit**.
3. Acompanhe os **Logs** de cada serviço. O build pode levar alguns minutos.
4. Quando o status estiver **Live** (verde), anote as URLs:
   - Backend: `https://rh-backend.onrender.com`
   - Frontend: `https://rh-gppm.onrender.com`

---

## 5. Seed (usuários iniciais) – opcional

Se quiser criar usuários iniciais no banco:

1. No serviço **rh-backend**, abra **Shell** (menu lateral).
2. Execute:

```bash
cd backend
npx prisma db seed
```

(O seed está configurado no `package.json` do backend.)

---

## 6. Testar

- **Backend:** abra no navegador ou com `curl`:  
  `https://rh-backend.onrender.com`  
  Deve retornar uma mensagem do backend (ex.: “Hello World” ou similar).
- **Frontend:** abra no navegador:  
  `https://rh-gppm.onrender.com`  
  Faça login e teste o fluxo da aplicação.

---

## Problemas comuns

| Problema | O que verificar |
|----------|------------------|
| Build falha com “Cannot find module” | Build command inclui `npm ci` e `npx prisma generate` no backend? |
| “Prisma Client did not initialize” | `npx prisma generate` está no build do backend? |
| “Port already in use” ou listen na porta errada | Variável `PORT=10000` no backend? |
| “DATABASE_URL not found” ou erro de conexão | `DATABASE_URL` no Environment do **rh-backend** usando Internal URL e `?schema=public`? |
| Frontend não abre ou 502 | Logs do **rh-gppm**; `NEXTAUTH_URL` e `NEXT_PUBLIC_API_URL` batem com as URLs reais do Render? |
| CORS ou API não acessível pelo frontend | `FRONTEND_URL` no backend igual à URL do frontend (ex.: `https://rh-gppm.onrender.com`)? |

Se o deploy falhar, use **Logs** do serviço e procure por mensagens de erro (build ou runtime). O arquivo **DEPLOY_FALHOU.md** tem mais dicas de diagnóstico.

---

## Plano Free – comportamento

- Os serviços podem **ficar inativos** após ~15 min sem acesso; o primeiro request depois disso pode demorar 30–60 s.
- O banco Free também pode hibernar; a primeira conexão pode ser mais lenta.

Depois de configurar `DATABASE_URL`, build e start commands como acima, o projeto deve rodar no Render. Se algo falhar, envie a URL do serviço e as últimas linhas dos Logs para analisar.
