# Corrigir rh-gppm: mostrar tela de login em vez de "Hello World!"

Se **https://rh-gppm.onrender.com/** mostra apenas "Hello World!", o serviço **rh-gppm** está rodando o **backend** (NestJS) em vez do **frontend** (Next.js). Siga os passos abaixo.

---

## 1. Abrir o serviço rh-gppm no Render

1. Acesse: **https://dashboard.render.com**
2. Clique no serviço **rh-gppm** (não no rh-backend).

---

## 2. Conferir e corrigir os comandos

1. No menu lateral, vá em **Settings**.
2. Role até **Build & Deploy**.
3. Confira e, se estiver diferente, altere para:

| Campo | Valor correto |
|-------|-------------------------------|
| **Root Directory** | *(deixe vazio)* |
| **Build Command** | `cd frontend && npm ci && npm run build` |
| **Start Command** | `cd frontend && npm run start` |

4. Clique em **Save Changes**.

---

## 3. Variáveis de ambiente (Environment)

Na aba **Environment**, confira se existem:

| Key | Valor |
|-----|--------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://rh-backend.onrender.com` |
| `NEXTAUTH_URL` | `https://rh-gppm.onrender.com` |
| `NEXTAUTH_SECRET` | *(gerado pelo Render ou uma string longa aleatória)* |

O Render define `PORT` automaticamente; não é obrigatório criar.

---

## 4. Fazer redeploy

1. No topo da página do serviço **rh-gppm**, clique em **Manual Deploy**.
2. Escolha **Clear build cache & deploy**.
3. Aguarde o build e o deploy (pode levar alguns minutos).
4. Acompanhe em **Logs**; ao final deve aparecer algo como:
   - `▲ Next.js ...`
   - `- Local: http://localhost:10000` (ou a porta que o Render usar).

---

## 5. Testar de novo

Abra de novo: **https://rh-gppm.onrender.com/**

Você deve ver a **tela de login** da aplicação, e não mais "Hello World!".

---

## Resumo

- **rh-gppm** = frontend (Next.js) → deve mostrar a aplicação (login, etc.).
- **rh-backend** = API (NestJS) → responde "Hello World!" em `/` e expõe os endpoints da API.

Se o **Build Command** ou **Start Command** do rh-gppm estiverem com `cd backend` ou `npm run start:prod`, o Render está rodando o backend nesse serviço; por isso aparece "Hello World!". Corrija para os comandos do **frontend** acima e faça o redeploy.
