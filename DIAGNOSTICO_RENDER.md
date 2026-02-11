# 🔍 Diagnóstico: API Não Responde

## ❌ Problema Detectado

A API `https://rh-backend.onrender.com` não está respondendo.

**Erro**: `A conexão foi fechada de modo inesperado`

**Causa provável**: Deploy falhou ou serviço está offline.

---

## 🔧 Passo a Passo para Corrigir

### 1. Verificar Logs do Render

1. Acesse: https://dashboard.render.com
2. Clique no Web Service **`rh-backend`** (ou `rh-gppm`)
3. Vá em **"Logs"** (menu lateral esquerdo)
4. Procure por erros, especialmente:
   - ❌ `Build failed`
   - ❌ `npm install failed`
   - ❌ `prisma generate failed`
   - ❌ `Application failed to start`

---

### 2. Verificar Configurações do Web Service

No dashboard do Render, vá em **"Settings"** e verifique:

#### Build Command (deve ser):
```bash
cd backend && npm install && npx prisma generate && npm run build
```

#### Start Command (deve ser):
```bash
cd backend && npm run start:prod
```

#### Root Directory:
```
(deixar VAZIO ou colocar: backend)
```

⚠️ **IMPORTANTE**: Se o Root Directory estiver como `backend`, então os comandos devem ser SEM `cd backend`:

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

---

### 3. Verificar Variáveis de Ambiente

Vá em **"Environment"** e confirme que existem:

- ✅ `DATABASE_URL` (com `?schema=public` no final)
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV=production`
- ✅ `PORT=10000`
- ✅ `FRONTEND_URL`

---

### 4. Forçar Redeploy

Se tudo estiver correto:

1. Vá em **"Manual Deploy"** (canto superior direito)
2. Clique em **"Clear build cache & deploy"**
3. Aguarde o deploy (5-10 minutos)
4. Acompanhe os logs

---

### 5. Verificar Status do Serviço

No dashboard, verifique:

- ✅ Status: **"Live"** (verde)
- ❌ Status: **"Build failed"** (vermelho)
- ⏸️ Status: **"Suspended"** (cinza - plano free inativo)

---

## 🐛 Erros Comuns nos Logs

### Erro: "Cannot find module '@prisma/client'"

**Causa**: Prisma Client não foi gerado

**Solução**: Adicionar `npx prisma generate` no build command

---

### Erro: "Port 3000 is already in use"

**Causa**: Aplicação tentando usar porta errada

**Solução**: Adicionar variável `PORT=10000`

---

### Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Variável não configurada

**Solução**: Adicionar `DATABASE_URL` nas variáveis de ambiente

---

### Erro: "ECONNREFUSED" ou "Can't reach database"

**Causa**: Banco de dados não acessível

**Solução**: 
1. Verificar se o banco Postgres está rodando
2. Usar **Internal Database URL** (não External)

---

## ✅ Checklist de Verificação

- [ ] Logs verificados (sem erros de build)
- [ ] Build command correto
- [ ] Start command correto
- [ ] Root Directory configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Status do serviço: "Live"
- [ ] Redeploy forçado (se necessário)

---

## 🎯 Próximos Passos

Após corrigir o deploy:

1. **Aguarde** o serviço ficar "Live" (5-10 min)
2. **Teste** o health check:
   ```powershell
Invoke-WebRequest -Uri "https://rh-backend.onrender.com"
   ```
3. **Abra o Shell do Render** e rode migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. **Teste** o login e demais endpoints

---

## 📝 Informações para Compartilhar

Se precisar de ajuda, me envie:
- Screenshot dos logs (últimas 50 linhas)
- Screenshot das configurações (Build/Start commands)
- Status atual do serviço
