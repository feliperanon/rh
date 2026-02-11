# 🚀 Deploy no Render – Passo a Passo (SEM pgAdmin)

No Render, **o banco de dados é criado automaticamente** quando você adiciona um PostgreSQL. Não é necessário usar pgAdmin nem criar o banco manualmente.

---

## Passo 1: Criar o banco PostgreSQL no Render

1. Acesse: **https://dashboard.render.com**
2. Clique em **New** → **PostgreSQL**
3. Preencha:
   - **Name**: `rh-database` (ou outro nome)
   - **Region**: Oregon (ou mais próximo)
   - **Plan**: Free
4. Clique em **Create Database**
5. Aguarde até o banco ficar disponível (status verde)

---

## Passo 2: Copiar a Internal Database URL

1. Com o banco criado, clique nele para abrir
2. Na seção **Connections**, encontre **Internal Database URL**
3. Clique em **Copy** para copiar a URL  
   (Formato: `postgresql://usuario:senha@host/database` – o banco já vem criado)

---

## Passo 3: Criar ou configurar o Web Service

### Se ainda não existe o Web Service

1. Clique em **New** → **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `rh-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: (deixar vazio)
   - **Build Command**: já está no `render.yaml`
   - **Start Command**: já está no `render.yaml`

### Se o Web Service já existe

1. Abra o serviço **rh-backend** no dashboard

---

## Passo 4: Configurar variáveis de ambiente

1. No serviço **rh-backend**, vá em **Environment**
2. Clique em **Add Environment Variable** e adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Cole a **Internal Database URL** do Passo 2 |
| `JWT_SECRET` | `rh-jwt-secret-production-2026-super-seguro` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://rh-frontend.onrender.com` (ou `http://localhost:3001` se o frontend ainda estiver local) |

3. Clique em **Save Changes**

---

## Passo 5: Vincular o banco ao Web Service

1. No **rh-backend**, vá em **Environment**
2. Na seção **Environment Groups** ou **Database**, clique em **Link**
3. Escolha o banco **rh-database** criado no Passo 1
4. O Render preenche a `DATABASE_URL` automaticamente (verifique se ficou certa)

---

## Passo 6: Fazer push do código

As migrations estão em `backend/prisma/migrations/`. O `buildCommand` no `render.yaml` já roda `prisma migrate deploy`, então as tabelas serão criadas no deploy.

1. No seu computador:
   ```powershell
   cd e:\Projeto\rh
   git add .
   git commit -m "Adiciona migrations e configura deploy automático"
   git push origin main
   ```

2. O Render vai detectar o push e fazer o deploy automaticamente

---

## Passo 7: Rodar o seed (criar usuário admin)

Depois do deploy, crie o usuário inicial:

1. No Render, abra o **rh-backend**
2. Menu lateral → **Shell**
3. No shell, execute:
   ```bash
   cd backend
   npx prisma db seed
   ```
4. Aguarde concluir – isso cria o usuário admin (admin@rh.com / admin123)

---

## Resumo – o que acontece automaticamente

- O **banco é criado** pelo Render quando você adiciona um PostgreSQL.
- O **nome do banco** já vem na URL.
- As **migrations rodam** em cada deploy via `prisma migrate deploy` no build.

Você **não precisa** de pgAdmin nem criar o banco manualmente.

---

## Troubleshooting

### Erro: "Database does not exist"

Use sempre a **Internal Database URL**, não a External.

### Erro nas migrations

Confira se a `DATABASE_URL` está correta e se o banco está “Available” no painel do Render.
