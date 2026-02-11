# 🚨 Deploy Falhou - Como Verificar os Logs

## ❌ Erro Reportado

```
Deploy failed for f1a2710: fix: corrigir PORT para 10000 no render.yaml + adicionar guias de diagnóstico
Exited with status 1 while running your code. Check your deploy logs for more information.
```

---

## 📋 Como Ver os Logs Completos

### 1. Acessar Dashboard do Render

1. Acesse: https://dashboard.render.com
2. Clique no Web Service **`rh-backend`** (ou `rh-gppm`)
3. Vá em **"Logs"** (menu lateral esquerdo)

### 2. Procurar pelo Erro

Role até encontrar linhas com:
- ❌ `ERROR`
- ❌ `FAILED`
- ❌ `Exit code 1`
- ⚠️ `npm ERR!`
- ⚠️ `prisma error`

### 3. Copiar Logs Relevantes

Copie as **últimas 50-100 linhas** dos logs, especialmente:
- A seção de **Build**
- A seção de **Start**
- Qualquer mensagem de erro

---

## 🔍 Erros Comuns e Soluções

### Erro 1: "Cannot find module"

**Exemplo:**
```
Error: Cannot find module '@nestjs/core'
```

**Causa**: Dependências não instaladas

**Solução**: Verificar se `npm install` está no build command

---

### Erro 2: "Prisma Client not generated"

**Exemplo:**
```
Error: @prisma/client did not initialize yet
```

**Causa**: `npx prisma generate` não foi executado

**Solução**: Adicionar `npx prisma generate` no build command

---

### Erro 3: "Port already in use"

**Exemplo:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa**: Aplicação tentando usar porta errada

**Solução**: Verificar variável `PORT=10000`

---

### Erro 4: "Build timeout"

**Exemplo:**
```
Build exceeded maximum time limit
```

**Causa**: Build muito lento (plano free tem limite de 15 min)

**Solução**: Otimizar dependências ou upgrade de plano

---

### Erro 5: "Root directory not found"

**Exemplo:**
```
Error: ENOENT: no such file or directory, scandir '/opt/render/project/src/backend'
```

**Causa**: Configuração de Root Directory incorreta

**Solução**: Deixar Root Directory **VAZIO** e usar `cd backend` nos comandos

---

## 🛠️ Configuração Correta (Referência)

### Build Command:
```bash
cd backend && npm install && npx prisma generate && npm run build
```

### Start Command:
```bash
cd backend && npm run start:prod
```

### Root Directory:
```
(VAZIO)
```

### Environment Variables:
```
DATABASE_URL=postgresql://rh_backend_user:5WBjAq397lccoMgzUASKHGArcaoK9uRp@dpg-d660ma7pm1nc738lcsfg-a/rh_backend?schema=public
JWT_SECRET=rh-jwt-secret-production-2026-super-seguro-nao-compartilhar
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:3001
```

---

## 📸 O Que Preciso Ver

Para te ajudar, me envie:

1. **Screenshot dos logs** (últimas 50-100 linhas)
2. **Screenshot das configurações**:
   - Build Command
   - Start Command
   - Root Directory
3. **Status atual** do serviço (Live/Failed/Building)

---

## 🔄 Alternativa: Simplificar Estrutura

Se o problema persistir, podemos simplificar:

### Opção A: Mover tudo para raiz

Mover arquivos de `backend/` para raiz do projeto.

### Opção B: Configurar Root Directory

Configurar Root Directory como `backend` e remover `cd backend` dos comandos.

---

**Aguardo os logs para te ajudar a corrigir!** 🚀
