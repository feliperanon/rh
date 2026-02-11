# 🚨 SOLUÇÃO URGENTE: Configurar Render Corretamente

## ❌ Problema Atual

O Render continua usando:
```
==> Running 'yarn start'
error Couldn't find a package.json file in "/opt/render/project/src"
```

**Isso significa**: As configurações do dashboard **NÃO foram salvas** ou você está no serviço errado.

---

## ✅ SOLUÇÃO PASSO A PASSO (COM SCREENSHOTS)

### 1. Verificar o Serviço Correto

URL do seu site: `https://rh-gppm.onrender.com`

1. Acesse: https://dashboard.render.com
2. Procure pelo serviço com nome: **`rh-gppm`** (NÃO `rh-backend`)
3. Clique nele

---

### 2. Ir em Settings

1. No menu lateral esquerdo, clique em **"Settings"**
2. Role até a seção **"Build & Deploy"**

---

### 3. Configurar Root Directory

**Procure por**: "Root Directory"

**Valor atual**: (provavelmente vazio ou `src`)

**Novo valor**: `backend`

⚠️ **IMPORTANTE**: Digite exatamente: `backend` (sem barra, sem espaços)

---

### 4. Configurar Build Command

**Procure por**: "Build Command"

**Valor atual**: (provavelmente vazio ou `yarn`)

**Novo valor**:
```bash
npm install && npx prisma generate && npm run build
```

⚠️ **IMPORTANTE**: Copie e cole exatamente como está acima

---

### 5. Configurar Start Command

**Procure por**: "Start Command"

**Valor atual**: (provavelmente vazio ou `yarn start`)

**Novo valor**:
```bash
npm run start:prod
```

⚠️ **IMPORTANTE**: Copie e cole exatamente como está acima

---

### 6. SALVAR AS MUDANÇAS

⚠️ **CRÍTICO**: Você DEVE fazer isso:

1. Role até o **FINAL DA PÁGINA**
2. Procure pelo botão **"Save Changes"** (vermelho/azul)
3. **CLIQUE NO BOTÃO**
4. Aguarde a mensagem de confirmação

**SEM CLICAR EM "Save Changes", AS MUDANÇAS NÃO SÃO APLICADAS!**

---

### 7. Forçar Redeploy

Após salvar:

1. Vá no canto superior direito
2. Clique em **"Manual Deploy"**
3. Selecione **"Clear build cache & deploy"**
4. Aguarde 5-10 minutos

---

## 📸 Checklist Visual

Antes de salvar, verifique se está assim:

```
┌─────────────────────────────────────────┐
│ Build & Deploy Settings                 │
├─────────────────────────────────────────┤
│ Root Directory:                          │
│ [backend                            ]    │
│                                          │
│ Build Command:                           │
│ [npm install && npx prisma generate &&  │
│  npm run build                      ]    │
│                                          │
│ Start Command:                           │
│ [npm run start:prod                 ]    │
│                                          │
│ [Save Changes]  ← CLIQUE AQUI!          │
└─────────────────────────────────────────┘
```

---

## 🔍 Como Saber se Funcionou

Após o redeploy, os logs devem mostrar:

```
✅ ==> Running build command 'npm install && npx prisma generate && npm run build'...
✅ npm install
✅ npx prisma generate
✅ npm run build
✅ ==> Build successful 🎉
✅ ==> Running 'npm run start:prod'
✅ Your service is live 🎉
```

**NÃO DEVE APARECER**: `yarn start` ou `yarn` em lugar nenhum!

---

## ⚠️ Se Ainda Não Funcionar

Se após salvar e fazer redeploy ainda aparecer `yarn start`:

### Opção A: Deletar e Recriar o Serviço

1. Delete o serviço `rh-gppm`
2. Crie um novo Web Service
3. Configure desde o início com os valores corretos

### Opção B: Usar Blueprint (render.yaml)

1. Delete o serviço atual
2. Crie um novo usando "Blueprint"
3. Aponte para o repositório
4. O Render vai ler o `render.yaml` automaticamente

---

## 📝 Configuração Completa (Referência)

| Campo | Valor |
|-------|-------|
| **Name** | `rh-backend` |
| **Environment** | Node |
| **Region** | Oregon (ou Virginia) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start:prod` |

**Environment Variables:**
```
DATABASE_URL=postgresql://rh_backend_user:5WBjAq397lccoMgzUASKHGArcaoK9uRp@dpg-d660ma7pm1nc738lcsfg-a/rh_backend?schema=public
JWT_SECRET=rh-jwt-secret-production-2026-super-seguro-nao-compartilhar
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:3001
```

---

## 🎯 Ação Imediata

1. **Vá em Settings do serviço `rh-gppm`**
2. **Configure Root Directory, Build Command, Start Command**
3. **CLIQUE EM "Save Changes"** (CRÍTICO!)
4. **Faça Manual Deploy → Clear build cache & deploy**
5. **Aguarde e acompanhe os logs**

---

**Me avise quando:**
- ✅ Você salvou as configurações
- ✅ O redeploy iniciou
- ✅ Apareceu algo diferente de `yarn start` nos logs
