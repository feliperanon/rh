# Deploy no Render - Instruções

## Configuração do Backend

### 1. Criar Web Service no Render

- **Name**: rh-backend
- **Environment**: Node
- **Region**: Oregon (ou mais próximo)
- **Branch**: main
- **Root Directory**: (deixar vazio)

### 2. Build & Deploy Settings

**Build Command:**
```bash
cd backend && npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

### 3. Variáveis de Ambiente

Adicionar no Render Dashboard:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=seu-secret-super-seguro-mude-em-producao
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://rh-frontend.onrender.com
```

### 4. Banco de Dados (Render Postgres)

1. Criar Postgres no Render
2. Copiar **Internal Database URL** para `DATABASE_URL`
3. Rodar migrations após primeiro deploy:

```bash
# No Render Shell
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## Configuração do Frontend (Próxima Fase)

### 1. Criar Web Service no Render

- **Name**: rh-frontend
- **Environment**: Node
- **Branch**: main

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Start Command:**
```bash
cd frontend && npm start
```

### 2. Variáveis de Ambiente

```
NEXT_PUBLIC_API_URL=https://rh-backend.onrender.com
NEXTAUTH_SECRET=seu-secret-nextauth
NEXTAUTH_URL=https://rh-frontend.onrender.com
```

---

## Troubleshooting

### Erro: "Couldn't find a package.json file"

**Causa**: Render está tentando rodar comandos na raiz, mas package.json está em `backend/`

**Solução**: Adicionar `cd backend &&` antes dos comandos de build e start

### Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Variável de ambiente não configurada

**Solução**: Adicionar `DATABASE_URL` no Render Dashboard

### Erro: "Prisma Client not generated"

**Causa**: `npx prisma generate` não foi executado no build

**Solução**: Adicionar `npx prisma generate` no build command

---

## Comandos Úteis (Render Shell)

```bash
# Ver logs
tail -f /var/log/render/service.log

# Rodar migrations
cd backend && npx prisma migrate deploy

# Rodar seed
cd backend && npx prisma db seed

# Ver status do banco
cd backend && npx prisma studio
```
