# Sistema de Recrutamento Multiempresa

Sistema web de recrutamento/triagem multiempresa com captação inicial via WhatsApp (sem integração direta com a API).

## Arquitetura
- Frontend: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- Backend: NestJS + Prisma + PostgreSQL
- Deploy: Render (backend + frontend + Postgres)

## Estrutura do repositório
```
rh/
├── backend/           # API NestJS + Prisma
│   ├── prisma/        # schema.prisma, migrations e seeds
│   └── src/           # código fonte
├── frontend/          # App Next.js (App Router)
└── render.yaml        # definição dos serviços no Render
```

## Executar localmente
Pré-requisitos: Node 18+, PostgreSQL 14+, npm.

### Backend
```bash
cd backend
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET
npx prisma db push          # cria tabelas conforme schema
npm run start:dev           # http://localhost:3000
```
Seed rápido (cria admin e psicóloga, senha `admin123`):
```bash
node seed-simple.js
# ou: curl -X POST http://localhost:3000/auth/setup
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # defina NEXT_PUBLIC_API_URL
npm run dev                         # http://localhost:3001
```

## Testes rápidos de API
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}'
```
Use o access_token retornado em `Authorization: Bearer <token>` para rotas protegidas (`/companies`, `/sectors`, `/applications`, etc.).

## Deploy no Render
- Arquivo `render.yaml` já preparado:
  - Backend build: `cd backend && npm install --production=false && npx prisma generate && npm run build`
  - Backend start: `cd backend && npm run start:prod`
  - Variáveis obrigatórias backend: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=10000`, `FRONTEND_URL=https://rh-gppm.onrender.com`
  - `.npmrc` no backend força instalação de devDependencies (necessárias para o `nest build`).
- Banco: crie Postgres no Render e defina `DATABASE_URL`.
- Após primeiro deploy, rode no shell do serviço:
  - `npx prisma db push` (ou `npx prisma migrate deploy` se houver migrations)
  - `node seed-simple.js` ou `curl -X POST https://<seu-backend>/auth/setup`

## Modelagem (tabelas principais)
`users`, `companies`, `sectors`, `candidates`, `applications`, `invite_tokens`, `events`.

## Funcionalidades Principais
- **Gestão de Candidatos**: Cadastro, listagem e edição.
- **Integração WhatsApp**: Geração de links `wa.me` com mensagem padrão e rastreamento de cliques.
- **Exportação Excel**: Relatório completo de inscrições e timeline de eventos.
- **Segurança**:
  - Validação rigorosa de CPF e Telefone.
  - Rate Limiting (limitador de requisições) em endpoints públicos.
  - Proteção contra duplicidade de candidatos.

## Segurança
- Hash de senha com bcrypt
- Tokens JWT com segredo configurável
- Tokens de convite armazenados com hash
- CORS liberado apenas para `FRONTEND_URL`
- Rate Limiting global (10 req/min para endpoints públicos)
- Validação de dados (Zod no frontend, Class-Validator no backend)

## Licença
Uso interno. Todos os direitos reservados.
