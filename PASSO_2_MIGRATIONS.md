# 🗄️ Passo 2: Rodar Migrations e Seed no Render

## 🎯 Objetivo
Inicializar o banco de dados com as tabelas e dados iniciais (usuários admin e psicóloga).

---

## 📋 Passo a Passo

### 1. Abrir Shell do Render

1. Acesse: https://dashboard.render.com
2. Clique no Web Service **`rh-backend`**
3. No menu superior direito, clique em **"Shell"**
4. Aguarde o terminal abrir

---

### 2. Rodar Migrations

⚠️ **IMPORTANTE**: Primeiro faça push do código atualizado (Prisma 5):

```bash
git add .
git commit -m "fix: downgrade Prisma para v5.22.0"
git push origin main
```

Aguarde o Render fazer redeploy automático (1-2 minutos).

Depois, no terminal do Shell do Render, execute:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

**O que esperar:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "rh_backend"

🚀  Your database is now in sync with your Prisma schema. Done in 2.5s

✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

---

### 3. Rodar Seed (Criar Usuários Iniciais)

No mesmo terminal, execute:

```bash
npx prisma db seed
```

**O que esperar:**
```
🌱 Iniciando seed do banco de dados...
✅ Usuário admin criado: { email: 'admin@rh.com', senha: 'admin123' }
✅ Usuária psicóloga criada: { email: 'psicologa@rh.com', senha: 'admin123' }

🎉 Seed concluído com sucesso!

📝 Credenciais de acesso:
Admin: admin@rh.com / admin123
Psicóloga: psicologa@rh.com / admin123
```

---

### 4. Verificar se Funcionou

Teste o endpoint de login:

```bash
curl -X POST https://rh-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Administrador",
    "email": "admin@rh.com",
    "role": "ADMIN"
  }
}
```

---

## 🔧 Troubleshooting

### Erro: "Migration failed"

**Causa**: Banco pode já ter tabelas ou migrations anteriores

**Solução**:
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset --force
```

---

### Erro: "Command not found: npx"

**Causa**: Node.js não está no PATH do Shell

**Solução**: O Render deve ter Node.js instalado. Tente:
```bash
node --version
npm --version
```

---

### Erro: "Seed script not found"

**Causa**: package.json não tem configuração de seed

**Solução**: Já configuramos isso. Verifique se o arquivo `prisma/seed.ts` existe.

---

## ✅ Checklist

- [ ] Shell do Render aberto
- [ ] `cd backend` executado
- [ ] `npx prisma migrate deploy` executado com sucesso
- [ ] `npx prisma db seed` executado com sucesso
- [ ] Usuários criados (admin e psicóloga)
- [ ] Endpoint de login testado e funcionando

---

## 🎉 Próximos Passos

Após concluir o Passo 2:
- **Passo 3**: Testar todos os endpoints (Postman/Insomnia)
- **Passo 4**: Implementar frontend (Next.js)
- **Passo 5**: Deploy do frontend no Render

---

## 📝 Credenciais de Acesso

**Admin:**
- Email: `admin@rh.com`
- Senha: `admin123`

**Psicóloga:**
- Email: `psicologa@rh.com`
- Senha: `admin123`

⚠️ **IMPORTANTE**: Troque essas senhas em produção!
