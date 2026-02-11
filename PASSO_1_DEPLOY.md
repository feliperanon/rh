# Passo 1: Deploy no Render - Guia Completo

## 🎯 Objetivo
Fazer deploy do backend no Render e corrigir o erro atual: `"Couldn't find a package.json file"`

---

## 📋 Checklist

### 1. Configurar Web Service no Render

Acesse: https://dashboard.render.com

1. **Criar novo Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub: `feliperanon/rh`
   - Branch: `main`

2. **Configurações Básicas**
   ```
   Name: rh-backend
   Region: Oregon (ou mais próximo)
   Branch: main
   Root Directory: (deixar VAZIO)
   Runtime: Node
   ```

3. **Build & Deploy Settings** ⚠️ IMPORTANTE

   **Build Command:**
   ```bash
   cd backend && npm install && npx prisma generate && npm run build
   ```

   **Start Command:**
   ```bash
   cd backend && npm run start:prod
   ```

---

### 2. Criar Banco de Dados Postgres

1. No Render Dashboard, clique em "New +" → "PostgreSQL"
2. Configurações:
   ```
   Name: rh-database
   Database: rh
   User: rh_user
   Region: Oregon (mesma do backend)
   Plan: Free
   ```
3. Aguarde a criação (1-2 minutos)
4. **Copie a "Internal Database URL"** (formato: `postgresql://...`)

---

### 3. Configurar Variáveis de Ambiente

No Web Service (`rh-backend`), vá em "Environment" e adicione:

```
DATABASE_URL=postgresql://rh_user:senha@dpg-xxxxx/rh
JWT_SECRET=seu-secret-super-seguro-mude-em-producao-12345
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://rh-frontend.onrender.com
```

⚠️ **IMPORTANTE**: 
- Use a **Internal Database URL** copiada do Postgres
- Gere um `JWT_SECRET` forte (ex: `openssl rand -base64 32`)
- `PORT` deve ser `10000` (padrão do Render)

---

### 4. Fazer Deploy

1. **Commit e Push** (se ainda não fez):
   ```bash
   git add .
   git commit -m "feat: adicionar configuração de deploy (render.yaml)"
   git push origin main
   ```

2. **Trigger Manual Deploy** (se necessário):
   - No Render Dashboard → `rh-backend` → "Manual Deploy" → "Deploy latest commit"

3. **Acompanhar Logs**:
   - Clique em "Logs" para ver o progresso
   - Aguarde mensagem: `🚀 Backend rodando em http://localhost:10000`

---

### 5. Rodar Migrations e Seed

Após o deploy bem-sucedido:

1. **Abrir Shell do Render**:
   - No dashboard → `rh-backend` → "Shell"

2. **Rodar comandos**:
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Verificar**:
   ```bash
   # Deve mostrar:
   # ✅ Usuário admin criado: admin@rh.com / admin123
   # ✅ Usuária psicóloga criada: psicologa@rh.com / admin123
   ```

---

### 6. Testar API

1. **Endpoint de Health Check**:
   ```bash
   curl https://rh-backend.onrender.com
   # Deve retornar: "Hello World!" ou similar
   ```

2. **Testar Login**:
   ```bash
   curl -X POST https://rh-backend.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@rh.com","password":"admin123"}'
   
   # Deve retornar:
   # {
   #   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   #   "user": { "id": "...", "name": "Administrador", ... }
   # }
   ```

---

## 🔧 Troubleshooting

### Erro: "Couldn't find a package.json file"

**Causa**: Render está rodando comandos na raiz, mas `package.json` está em `backend/`

**Solução**: Adicionar `cd backend &&` nos comandos de build e start (já feito no `render.yaml`)

---

### Erro: "Environment variable not found: DATABASE_URL"

**Causa**: Variável não configurada

**Solução**: 
1. Ir em "Environment" no dashboard
2. Adicionar `DATABASE_URL` com valor da Internal Database URL

---

### Erro: "Prisma Client not generated"

**Causa**: `npx prisma generate` não foi executado

**Solução**: Adicionar no build command (já feito):
```bash
cd backend && npm install && npx prisma generate && npm run build
```

---

### Deploy trava em "Building..."

**Possíveis causas**:
1. Dependências muito pesadas
2. Timeout do Render (15 min no free tier)

**Solução**:
- Verificar logs para ver onde travou
- Remover dependências desnecessárias

---

## ✅ Checklist Final

- [ ] Web Service criado no Render
- [ ] Postgres criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Build command correto: `cd backend && npm install && npx prisma generate && npm run build`
- [ ] Start command correto: `cd backend && npm run start:prod`
- [ ] Deploy bem-sucedido
- [ ] Migrations rodadas (`npx prisma migrate deploy`)
- [ ] Seed rodado (`npx prisma db seed`)
- [ ] Login testado e funcionando

---

## 📝 Próximos Passos

Após concluir o Passo 1:
- **Passo 2**: Testar todos os endpoints (Postman/Insomnia)
- **Passo 3**: Implementar frontend (Next.js)
- **Passo 4**: Deploy do frontend no Render
