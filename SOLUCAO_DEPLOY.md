# 🔧 Solução: Configurar Build/Start Commands no Dashboard

## ❌ Problema Identificado

```
error Couldn't find a package.json file in "/opt/render/project/src"
==> Running 'yarn start'
```

**Causa**: Render está usando comandos padrão (`yarn`, `yarn start`) em vez dos comandos do `render.yaml`.

**Solução**: Configurar manualmente no dashboard.

---

## 📋 Passo a Passo (SOLUÇÃO DEFINITIVA)

### 1. Acessar Settings do Web Service

1. Acesse: https://dashboard.render.com
2. Clique no Web Service **`rh-backend`** (ou `rh-gppm`)
3. Vá em **"Settings"** (menu lateral esquerdo)
4. Role até a seção **"Build & Deploy"**

---

### 2. Configurar Root Directory

**Root Directory:**
```
backend
```

⚠️ **IMPORTANTE**: Com Root Directory = `backend`, NÃO use `cd backend` nos comandos!

---

### 3. Configurar Build Command

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

---

### 4. Configurar Start Command

**Start Command:**
```bash
npm run start:prod
```

---

### 5. Salvar e Fazer Redeploy

1. Role até o final da página
2. Clique em **"Save Changes"**
3. O Render vai fazer **redeploy automático**
4. Aguarde 5-10 minutos
5. Acompanhe os logs

---

## ✅ Configuração Final (Resumo)

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Environment** | Node |
| **Node Version** | 22.22.0 (default) |

---

## 📝 Variáveis de Ambiente (Verificar)

Certifique-se de que existem:

```
DATABASE_URL=postgresql://rh_backend_user:5WBjAq397lccoMgzUASKHGArcaoK9uRp@dpg-d660ma7pm1nc738lcsfg-a/rh_backend?schema=public
JWT_SECRET=rh-jwt-secret-production-2026-super-seguro-nao-compartilhar
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:3001
```

---

## 🎯 O Que Vai Acontecer

Após salvar:

1. ✅ Render vai entrar em `backend/`
2. ✅ Vai encontrar `package.json`
3. ✅ Vai rodar `npm install`
4. ✅ Vai rodar `npx prisma generate`
5. ✅ Vai rodar `npm run build`
6. ✅ Vai rodar `npm run start:prod`
7. ✅ API vai ficar online em `https://rh-backend.onrender.com`

---

## ⏱️ Tempo Estimado

- **Build**: 3-5 minutos
- **Deploy**: 1-2 minutos
- **Total**: 5-10 minutos

---

## ✅ Como Verificar se Funcionou

Após o deploy, você deve ver nos logs:

```
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

Teste:

```powershell
Invoke-WebRequest -Uri "https://rh-backend.onrender.com"
```

Deve retornar: `StatusCode: 200`

---

## 🚀 Próximos Passos

Após deploy bem-sucedido:

1. **Abrir Shell do Render**
2. **Rodar migrations**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
3. **Testar login**:
   ```bash
  curl -X POST https://rh-backend.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@rh.com","password":"admin123"}'
   ```

---

**Faça essas configurações no dashboard e me avise quando o deploy terminar!** 🚀
