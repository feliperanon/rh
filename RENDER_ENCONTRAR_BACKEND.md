# Encontrar a URL do backend no Render

O endpoint **POST /auth/init** existe só no **backend** (NestJS). Se dá **404**, a URL que você está usando é de outro serviço (ex.: frontend) ou o backend não está deployado.

---

## 1. Listar os Web Services no Render

1. Acesse **https://dashboard.render.com**
2. Na lista da esquerda, veja **todos os Web Services** (não o banco de dados).

Você deve ter algo como:
- **rh** ou **rh-gppm** → costuma ser o **frontend** (Next.js)
- **rh-backend** ou **rh-api** → seria o **backend** (NestJS), se existir

O **banco** aparece como "PostgreSQL" / "Database", não como Web Service.

---

## 2. Descobrir qual serviço é o backend

Clique em cada **Web Service** e veja em **Settings** → **Build & Deploy**:

| Se o Build Command for… | É o… |
|-------------------------|------|
| `cd frontend && npm ci && npm run build` | **Frontend** (Next.js) → não tem `/auth/init` |
| `cd backend && npm ci && ... && npm run build` | **Backend** (NestJS) → tem `/auth/init` |

A **URL** do serviço aparece no topo da página (ex.: `https://rh-backend-xxxx.onrender.com`).  
Use **essa URL** para chamar o init.

---

## 3. Se não existir nenhum Web Service de backend

Se você só tem um Web Service (o do frontend) e nenhum com build em `backend/`:

1. Crie um **novo Web Service** no Render.
2. Conecte o **mesmo repositório** do projeto.
3. Configure:
   - **Name:** `rh-backend` (ou outro nome).
   - **Root Directory:** *(vazio)*
   - **Build Command:** `cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command:** `cd backend && npm run start:prod`
4. Em **Environment**, adicione:
   - **DATABASE_URL** = Internal Database URL do banco **rh-backend** (PostgreSQL)
   - **JWT_SECRET** = (gere uma chave)
   - **NODE_ENV** = `production`
   - **PORT** = `10000`
   - **FRONTEND_URL** = `https://rh-gppm.onrender.com`
5. Salve e faça o deploy. Quando estiver **Live**, a URL desse serviço será a do backend.

Depois chame:

```powershell
Invoke-RestMethod -Uri "https://URL-DO-BACKEND.onrender.com/auth/init" -Method POST
```

(substitua pela URL que o Render mostrar para esse novo serviço.)

---

## 4. Testar se a URL é do backend

Antes do init, teste no navegador ou no PowerShell:

```powershell
Invoke-RestMethod -Uri "https://SUA-URL-BACKEND.onrender.com" -Method GET
```

- Se retornar algo como **"Hello World!"** → é o backend. Use essa URL em **/auth/init**.
- Se retornar a **página de login** (HTML) → é o frontend; procure outro serviço com build em `backend/`.

---

## Resumo

| Onde você chama | O que precisa |
|-----------------|----------------|
| **POST /auth/init** | URL do **Web Service** cujo build é `cd backend && ...` (NestJS). |
| **Login no site** | Frontend em **rh-gppm**; ele usa **NEXT_PUBLIC_API_URL** apontando para essa mesma URL do backend. |

Se no Render só existir um Web Service e o build for de **frontend**, é preciso **criar um segundo Web Service** para o backend (passo 3).
