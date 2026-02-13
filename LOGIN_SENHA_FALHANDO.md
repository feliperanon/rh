# Login / senha falhando – o que fazer

Se ao tentar entrar no sistema a **senha está falhando** (ou aparece "credenciais inválidas"), siga os passos abaixo.

---

## 1. Usar as credenciais padrão (após o seed)

Depois de rodar o **seed** no backend, estes usuários existem no banco:

| Tipo      | Email             | Senha     |
|-----------|-------------------|-----------|
| Admin     | `admin@rh.com`    | `admin123` |
| Psicóloga | `psicologa@rh.com`| `admin123` |

- Use **exatamente** esse email e essa senha (tudo minúsculo, sem espaços).
- Se você já criou outros usuários no sistema, use o email e a senha que você definiu para eles.

---

## 2. Garantir que existem usuários no banco (seed no Render)

Se você **nunca rodou o seed** no backend no Render, **não há usuários** no banco e qualquer login vai falhar.

### Como rodar o seed no Render

1. Acesse **https://dashboard.render.com**
2. Abra o serviço **rh-backend** (API), não o rh-gppm.
3. No menu da esquerda, clique em **Shell**.
4. No terminal, você já estará em `~/project/src/backend`. **Não** rode `cd backend` de novo. Execute:

```bash
node prisma/seed.js
```

(Se o Shell abrir na raiz do projeto, aí sim rode `cd backend` e depois `node prisma/seed.js`.)

5. Deve aparecer algo como:
   - `Usuário admin criado: admin@rh.com`
   - `Usuária psicóloga criada: psicologa@rh.com`
   - `Credenciais: admin@rh.com / admin123` e `psicologa@rh.com / admin123`

Depois disso, tente de novo o login com **admin@rh.com** e senha **admin123**.

---

## 3. Backend no ar e frontend apontando para ele

O login chama a API em **rh-backend**. Se a API estiver fora do ar ou o frontend estiver com a URL errada, o login falha.

### No Render

- **rh-backend**  
  - Em **Environment** deve ter **DATABASE_URL** (e as outras variáveis).  
  - Em **Logs** confira se não há erro de conexão com o banco ou crash.

- **rh-gppm** (frontend)  
  - Em **Environment** deve ter:  
    **NEXT_PUBLIC_API_URL** = `https://rh-backend.onrender.com`  
  - Sem isso, o frontend não acha a API e o login não funciona.

Se você alterar **NEXT_PUBLIC_API_URL**, faça **Save** e um novo **Deploy** do rh-gppm.

---

## 4. Testar a API direto (opcional)

Para ver se o backend está aceitando login:

1. Abra **https://rh-backend.onrender.com** no navegador (deve aparecer algo como "Hello World!").
2. Ou teste o login com PowerShell (substitua se sua URL for outra):

```powershell
Invoke-RestMethod -Uri "https://rh-backend.onrender.com/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@rh.com","password":"admin123"}'
```

- Se der **erro de conexão** ou timeout: backend fora do ar ou URL errada.
- Se retornar **JSON** com `user` e `access_token`: backend e credenciais estão ok; o problema pode ser só no frontend (NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL).

---

## Resumo

| Situação                         | O que fazer |
|----------------------------------|------------|
| Nunca rodou seed no Render       | Shell no **rh-backend** → `cd backend` → `npx prisma db seed` |
| Esqueceu a senha padrão          | Email: `admin@rh.com`, senha: `admin123` (após o seed) |
| Backend não responde             | Ver **Logs** do rh-backend e **DATABASE_URL** no Environment |
| Frontend não acha a API          | No **rh-gppm**, definir **NEXT_PUBLIC_API_URL** = `https://rh-backend.onrender.com` e dar deploy |

Na maioria dos casos, **rodar o seed no rh-backend** e usar **admin@rh.com** / **admin123** resolve a “senha falhando”.
