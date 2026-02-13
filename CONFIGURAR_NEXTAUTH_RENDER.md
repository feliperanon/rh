# Corrigir "Server error" / "There is a problem with the server configuration"

Se ao abrir **https://rh-gppm.onrender.com** aparece a página do NextAuth em inglês:

- **"Server error"**
- **"There is a problem with the server configuration. Check the server logs for more information."**

significa que **NEXTAUTH_SECRET** ou **NEXTAUTH_URL** não estão configurados no serviço **rh-gppm** no Render.

---

## Solução (no Render)

### 1. Abrir o serviço do frontend

1. Acesse: **https://dashboard.render.com**
2. Clique no serviço **rh-gppm** (frontend).

### 2. Abrir Environment

No menu lateral, clique em **Environment**.

### 3. Adicionar ou conferir as variáveis

Clique em **Add Environment Variable** e garanta que existam **estas duas**:

| Key | Valor |
|-----|--------|
| **NEXTAUTH_SECRET** | Uma string longa e aleatória. No Render você pode clicar em **"Generate"** ao lado do campo para gerar automaticamente. Exemplo manual: `minha-chave-super-secreta-rh-2026-nao-compartilhar` (em produção use uma chave forte de 32+ caracteres). |
| **NEXTAUTH_URL** | `https://rh-gppm.onrender.com` (exatamente essa URL, **sem** barra no final) |

- Se **NEXTAUTH_SECRET** ou **NEXTAUTH_URL** já existirem mas estiverem errados, edite e corrija.
- **NEXTAUTH_URL** deve ser a URL do **próprio** frontend (rh-gppm), não do backend.

### 4. Salvar e fazer redeploy

1. Clique em **Save Changes**.
2. No topo da página, **Manual Deploy** → **Clear build cache & deploy**.
3. Aguarde o deploy terminar (alguns minutos).

### 5. Testar

Abra de novo: **https://rh-gppm.onrender.com**

Deve aparecer a **tela de login** do sistema, e não mais a página de "Server error".

---

## Resumo

| Erro | Causa | O que fazer |
|------|--------|-------------|
| "Server error" / "problem with the server configuration" | NextAuth exige `NEXTAUTH_SECRET` e `NEXTAUTH_URL` em produção | No Render → rh-gppm → Environment, definir **NEXTAUTH_SECRET** (gerar ou criar uma chave longa) e **NEXTAUTH_URL** = `https://rh-gppm.onrender.com`, salvar e fazer redeploy |

Sem **NEXTAUTH_SECRET**, o NextAuth não inicia em produção e mostra essa página de erro. Depois de configurar e fazer o redeploy, a aplicação passa a carregar normalmente.
