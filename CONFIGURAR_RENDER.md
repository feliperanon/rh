# ⚙️ Configurar Variáveis de Ambiente no Render

## 🎯 Objetivo
Configurar as variáveis de ambiente no Web Service `rh-backend` do Render.

---

## 📋 Passo a Passo

### 1. Acessar Configurações do Web Service

1. Acesse: https://dashboard.render.com
2. Clique no Web Service **`rh-backend`**
3. Vá na aba **"Environment"** (menu lateral esquerdo)

---

### 2. Adicionar Variáveis de Ambiente

Clique em **"Add Environment Variable"** e adicione as seguintes variáveis:

#### DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://rh_backend_user:5WBjAq397lccoMgzUASKHGArcaoK9uRp@dpg-d660ma7pm1nc738lcsfg-a/rh_backend
```
⚠️ **IMPORTANTE**: Use a **Internal Database URL** (não a External)

---

#### JWT_SECRET
```
Key: JWT_SECRET
Value: rh-jwt-secret-production-2026-super-seguro-nao-compartilhar
```
⚠️ **IMPORTANTE**: Em produção, use um secret forte e único

---

#### NODE_ENV
```
Key: NODE_ENV
Value: production
```

---

#### PORT
```
Key: PORT
Value: 10000
```
⚠️ **IMPORTANTE**: Render usa porta 10000 por padrão

---

#### FRONTEND_URL
```
Key: FRONTEND_URL
Value: http://localhost:3001
```
⚠️ **Atualizar depois** quando o frontend estiver no ar: `https://rh-frontend.onrender.com`

---

### 3. Salvar e Fazer Redeploy

1. Clique em **"Save Changes"**
2. O Render vai fazer **redeploy automático**
3. Aguarde o deploy terminar (acompanhe nos **Logs**)

---

## ✅ Verificar se Funcionou

Após o deploy, você deve ver nos logs:

```
🚀 Backend rodando em http://localhost:10000
```

---

## 🔧 Próximos Passos

Após configurar as variáveis de ambiente:

1. **Aguardar deploy bem-sucedido**
2. **Rodar migrations** (via Shell do Render):
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. **Rodar seed** (criar usuários iniciais):
   ```bash
   npx prisma db seed
   ```
4. **Testar API** (endpoint de login)

---

## 📝 Resumo das Variáveis

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://rh_backend_user:5WBjAq397lccoMgzUASKHGArcaoK9uRp@dpg-d660ma7pm1nc738lcsfg-a/rh_backend` |
| `JWT_SECRET` | `rh-jwt-secret-production-2026-super-seguro-nao-compartilhar` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `http://localhost:3001` (atualizar depois) |
