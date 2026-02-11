# 🧪 Passo 3: Testar Endpoints da API

## 🎯 Objetivo
Validar que todos os endpoints do backend estão funcionando corretamente após o deploy.

---

## 📋 Pré-requisitos

- ✅ Migrations rodadas com sucesso
- ✅ Seed executado (usuários criados)
- ✅ Deploy no Render concluído
- ✅ URL da API: `https://rh-backend.onrender.com`

---

## 🔧 Ferramentas para Testar

### Opção 1: cURL (Linha de Comando) ⭐ Mais Rápido

Abra o terminal e rode os comandos abaixo.

### Opção 2: Postman/Insomnia (Interface Gráfica)

1. Baixe: [Postman](https://www.postman.com/downloads/) ou [Insomnia](https://insomnia.rest/download)
2. Importe a collection (vou criar abaixo)

### Opção 3: VS Code REST Client

1. Instale extensão: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
2. Use o arquivo `api-tests.http` (vou criar abaixo)

---

## 🧪 Testes dos Endpoints

### 1. Health Check

**Objetivo**: Verificar se a API está no ar

**cURL:**
```bash
curl https://rh-backend.onrender.com
```

**Resposta esperada:**
```
Hello World!
```

---

### 2. Login (Obter Token JWT)

**Objetivo**: Autenticar e obter access_token

**cURL:**
```bash
curl -X POST https://rh-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@rh.com\",\"password\":\"admin123\"}"
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm...",
    "name": "Administrador",
    "email": "admin@rh.com",
    "role": "ADMIN"
  }
}
```

⚠️ **IMPORTANTE**: Copie o `access_token` para usar nos próximos testes!

---

### 3. Criar Empresa

**Objetivo**: Testar endpoint protegido (precisa de token)

**cURL:**
```bash
curl -X POST https://rh-backend.onrender.com/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"nome_interno\":\"Empresa Teste\",\"sigilosa\":false,\"perguntar_recontratacao\":true,\"modo_pergunta_recontratacao\":\"COM_NOME\"}"
```

**Resposta esperada:**
```json
{
  "id": "cm...",
  "nome_interno": "Empresa Teste",
  "ativo": true,
  "sigilosa": false,
  "perguntar_recontratacao": true,
  "modo_pergunta_recontratacao": "COM_NOME",
  "created_at": "2026-02-11T05:00:00.000Z",
  "updated_at": "2026-02-11T05:00:00.000Z"
}
```

⚠️ **Copie o `id` da empresa** para usar no próximo teste!

---

### 4. Listar Empresas

**cURL:**
```bash
curl https://rh-backend.onrender.com/companies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada:**
```json
[
  {
    "id": "cm...",
    "nome_interno": "Empresa Teste",
    "ativo": true,
    ...
  }
]
```

---

### 5. Criar Setor

**cURL:**
```bash
curl -X POST https://rh-backend.onrender.com/sectors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"company_id\":\"ID_DA_EMPRESA\",\"nome\":\"Operacional\"}"
```

**Resposta esperada:**
```json
{
  "id": "cm...",
  "company_id": "cm...",
  "nome": "Operacional",
  "ativo": true,
  ...
}
```

⚠️ **Copie o `id` do setor** para o próximo teste!

---

### 6. Criar Pré-Cadastro (Application)

**Objetivo**: Testar fluxo completo de pré-cadastro

**cURL:**
```bash
curl -X POST https://rh-backend.onrender.com/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"phone\":\"(11) 98765-4321\",\"company_id\":\"ID_DA_EMPRESA\",\"sector_id\":\"ID_DO_SETOR\"}"
```

**Resposta esperada:**
```json
{
  "id": "cm...",
  "protocol": "RH-20260211-A1B2",
  "status": "PRE_CADASTRO",
  "cadastro_link": "http://localhost:3001/cadastro/t/abc123...",
  "whatsapp_link": "https://wa.me/5511987654321?text=...",
  "token": "abc123...",
  "candidate": { ... },
  "company": { ... },
  "sector": { ... }
}
```

✅ **Sucesso!** Se chegou até aqui, todos os endpoints principais estão funcionando!

---

## 📄 Arquivo de Testes (VS Code REST Client)

Crie um arquivo `api-tests.http` na raiz do projeto:

```http
### 1. Health Check
GET https://rh-backend.onrender.com

### 2. Login
POST https://rh-backend.onrender.com/auth/login
Content-Type: application/json

{
  "email": "admin@rh.com",
  "password": "admin123"
}

### 3. Criar Empresa
POST https://rh-backend.onrender.com/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "nome_interno": "Empresa Teste",
  "sigilosa": false,
  "perguntar_recontratacao": true,
  "modo_pergunta_recontratacao": "COM_NOME"
}

### 4. Listar Empresas
GET https://rh-backend.onrender.com/companies
Authorization: Bearer {{token}}

### 5. Criar Setor
POST https://rh-backend.onrender.com/sectors
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "company_id": "{{company_id}}",
  "nome": "Operacional"
}

### 6. Criar Pré-Cadastro
POST https://rh-backend.onrender.com/applications
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "phone": "(11) 98765-4321",
  "company_id": "{{company_id}}",
  "sector_id": "{{sector_id}}"
}
```

---

## ✅ Checklist de Validação

- [ ] Health check retorna "Hello World!"
- [ ] Login retorna `access_token` e dados do usuário
- [ ] Criar empresa retorna empresa com ID
- [ ] Listar empresas retorna array com empresas
- [ ] Criar setor retorna setor com ID
- [ ] Criar pré-cadastro retorna:
  - [ ] Protocolo único (RH-YYYYMMDD-XXXX)
  - [ ] Link de cadastro
  - [ ] Link WhatsApp
  - [ ] Token
  - [ ] Dados do candidato, empresa e setor

---

## 🔧 Troubleshooting

### Erro: "Unauthorized" (401)

**Causa**: Token JWT inválido ou expirado

**Solução**: Faça login novamente e use o novo token

---

### Erro: "Not Found" (404)

**Causa**: Endpoint não existe ou URL incorreta

**Solução**: Verifique a URL: `https://rh-backend.onrender.com`

---

### Erro: "Internal Server Error" (500)

**Causa**: Erro no servidor (migrations não rodadas, banco desconectado, etc.)

**Solução**: 
1. Verifique logs do Render
2. Confirme que migrations foram rodadas
3. Verifique variáveis de ambiente

---

## 🎉 Próximos Passos

Após validar todos os endpoints:
- **Passo 4**: Implementar frontend (Next.js)
- **Fase 6**: CRUD (Companies, Sectors, Candidates)
- **Fase 7**: Fluxo Principal (Dashboard, Pré-cadastro)
- **Fase 8**: Formulário Público (Cadastro do candidato)
