# Guia de Instalação e Execução

Você precisa ter o **PostgreSQL** instalado.

## 1. Instale o PostgreSQL (se não tiver)
1. Baixe em: [PostgreSQL.org](https://www.postgresql.org/download/windows/)
2. Na instalação:
   - Defina a senha do superusuário `postgres`.
   - Escolha a porta padrão `5432`.
   - Pode desmarcar o Stack Builder no final.

## 2. Configure o Banco de Dados
1. Edite o arquivo `backend\.env` (já criado).
2. Atualize `DATABASE_URL` com a senha que você escolheu na instalação:
   ```ini
   DATABASE_URL="postgresql://postgres:SuaSenhaAqui@localhost:5432/rh?schema=public"
   ```
   *Se você não definiu senha ou usuário diferente, ajuste conforme necessário.*

3. Crie o Banco de Dados (se não existir):
   - Abra o `psql` ou `pgAdmin`.
   - Execute: `CREATE DATABASE rh;`

## 3. Preparar o Backend
Abra o terminal na pasta `backend` e rode:
```powershell
cd backend
npm install
npx prisma migrate dev --name init
```
*Isso vai criar as tabelas no banco de dados.*

## 4. Rodar o Projeto
Na pasta raiz do projeto, execute o script:
```powershell
.\run.ps1
```
*Ele vai instalar dependências do Frontend, construir o Backend e iniciar ambos.*

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3000 (Redirecionado pelo Next)
