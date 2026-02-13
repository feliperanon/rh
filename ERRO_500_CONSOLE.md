# Erro 500 no Console do navegador

Quando aparece **"Failed to load resource: the server responded with a status of 500"** no Console (ou no Edge "Explique os erros do Console"), em geral é uma requisição que está falhando no servidor.

---

## O que é o "error:1" ou "500"?

- O navegador faz várias requisições ao carregar a página (HTML, API de auth, etc.).
- Uma delas retornou **status 500** (erro interno do servidor).
- O "1" costuma ser só o número da requisição na lista (primeira que falhou).

---

## Causa mais comum: NextAuth (login/sessão)

Na nossa aplicação, a requisição que mais costuma dar **500** é a do **NextAuth**:

- **URL que falha:** `/api/auth/session` (ou `/api/auth/providers`, etc.)
- **Motivo:** no **Render** (ou em produção), se **NEXTAUTH_SECRET** ou **NEXTAUTH_URL** não estiverem configurados, o NextAuth pode responder com 500.

### O que fazer (Render – serviço rh-gppm)

1. Acesse o [Dashboard do Render](https://dashboard.render.com) e abra o serviço **rh-gppm**.
2. Vá em **Environment**.
3. Confira se existem e estão corretos:

   | Variável          | Valor (exemplo)                    |
   |-------------------|-------------------------------------|
   | `NEXTAUTH_SECRET` | Uma string longa e aleatória (ex.: use "Generate value" no Render) |
   | `NEXTAUTH_URL`    | `https://rh-gppm.onrender.com`     |

4. Salve e faça **Redeploy** do rh-gppm.
5. Teste de novo a página; o erro 500 do Console tende a sumir se era auth.

---

## Como confirmar qual URL deu 500

1. Abra as **Ferramentas do desenvolvedor** (F12).
2. Aba **Rede** (Network).
3. Recarregue a página.
4. Procure a requisição em **vermelho** com status **500**.
5. Clique nela e veja a **URL** e a **Resposta** (Response).

- Se a URL for algo como `.../api/auth/session` ou `.../api/auth/...` → é NextAuth; corrija **NEXTAUTH_SECRET** e **NEXTAUTH_URL** no Render (acima).
- Se a URL for algo como `https://rh-backend.onrender.com/...` → o erro está no **backend**; veja os **Logs** do serviço **rh-backend** no Render.

---

## Resumo

| Onde aparece 500      | Onde configurar | O que verificar |
|----------------------|-----------------|-----------------|
| `/api/auth/...` (frontend) | Render → rh-gppm → Environment | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| Backend (rh-backend) | Render → rh-backend → Environment / Logs | `DATABASE_URL`, erros nos Logs |

Depois de ajustar as variáveis e fazer redeploy, o erro 500 do Console deve desaparecer se a causa for a configuração do NextAuth.
