---
trigger: always_on
---

Você é uma IA engenheira de software sênior e deve construir um sistema web de recrutamento/triagem multiempresa, com captação inicial via WhatsApp (SEM integração com WhatsApp API). O sistema deve funcionar perfeitamente em smartphones e desktops. Entregue código de produção, com segurança, logs, histórico datado e exportação para Excel.

0) O que NÃO faremos (decisão do produto)

Não vamos enviar mensagens automaticamente pelo WhatsApp.

Não vamos ler/monitorar mensagens do WhatsApp.

O sistema apenas:

Cadastra o candidato inicialmente pelo telefone

Gera protocolo e link com token

Abre um link wa.me com mensagem pronta para a psicóloga enviar

Registra histórico datado dos eventos

1) Stack recomendada (melhor custo/benefício no Render)
Opção A (recomendada para MVP rápido e sólido)

Monorepo (pnpm + turbo)

Web + API: Next.js (App Router) + TypeScript

Admin e páginas públicas no mesmo app

Rotas API no Next (Route Handlers) para reduzir infra

UI: TailwindCSS + shadcn/ui

Banco: PostgreSQL (Render)

ORM: Prisma

Auth: NextAuth (Credentials) + RBAC (papéis)

Exportação: XLSX no backend (route handler)

Timezone: America/Sao_Paulo (armazenar UTC e exibir em BR)

Validações:

CPF válido (dígitos verificadores)

Telefone normalizado

Deploy: Render Web Service + Render Postgres

Sugestão importante: para MVP, faça tudo em um único serviço Next.js + Postgres. Simples, barato, fácil.

Opção B (se quiser separar desde o começo)

Front: Next.js

API: NestJS

DB: Postgres

ORM: Prisma

Deploy: 2 Web Services + Postgres no Render

2) Regras críticas de negócio

Primeiro contato: psicóloga só tem o telefone (WhatsApp).

Ela cria um pré-cadastro no sistema com esse telefone.

Em seguida escolhe Empresa e Setor/Vaga (somente interno).

O sistema gera:

Protocolo único

Link de cadastro com token seguro

O sistema deve ter botão:

“Abrir WhatsApp para enviar”
que abre wa.me com mensagem neutra (sem empresa), contendo protocolo + link.

Como não há integração com WhatsApp, o sistema precisa de:

Evento automático ao clicar “Abrir WhatsApp”

Botão “Marcar como enviado” para registrar o envio oficialmente

Sigilo: candidato nunca vê a empresa quando ela for sigilosa.

Antiduplicidade:

Telefone normalizado é único.

CPF, quando informado, deve ser validado e não duplicar.

Histórico datado obrigatório (linha do tempo):

pré-cadastro criado (data/hora)

empresa/vaga definida (data/hora)

protocolo/link gerados (data/hora)

WhatsApp aberto (data/hora)

link enviado confirmado (data/hora)

cadastro preenchido (data/hora)

contatos e reenvios (data/hora)

Exportação Excel/CSV

Reutilização: o banco deve servir para outras vagas/empresas.

3) Modelagem de dados (obrigatória, escalável)
Sugestão forte (melhor arquitetura):

Separar Candidate (pessoa) de Application (inscrição no processo).
Assim, a mesma pessoa não duplica no banco, mas pode participar de processos diferentes.

users

id, name, email, password_hash, role (ADMIN/PSICOLOGA), created_at

companies

id

nome_interno (obrigatório)

ativo

sigilosa (boolean)

perguntar_recontratacao (boolean)

modo_pergunta_recontratacao enum: GENERICO | COM_NOME

regra: se sigilosa=true → modo deve ser GENERICO

created_at, updated_at

sectors (vagas/subsetores)

id, company_id, nome, ativo, created_at, updated_at

candidates (pessoa)

id

phone_normalizado (único) + phone_e164 (único)

name (nullable até preencher)

cpf (nullable, único quando não nulo)

birth_date (nullable)

education (nullable)

vt_value_cents (nullable)

schedule_prefs (array enum: MANHA/TARDE/NOITE)

worked_here_before (nullable boolean) // resposta da pergunta “já trabalhou aqui?”

created_at, updated_at

applications (inscrição/processo)

id

candidate_id

company_id

sector_id

protocol (único)

status enum:
PRE_CADASTRO, LINK_GERADO, WHATSAPP_ABERTO, LINK_ENVIADO,
CADASTRO_PREENCHIDO, EM_CONTATO, ENTREVISTA_MARCADA,
ENCAMINHADO, APROVADO, REPROVADO, DESISTIU

created_at, updated_at

invite_tokens

id

application_id

token_hash (único)

expires_at (opcional)

used_at (quando o candidato finalizar)

created_at

events (histórico / auditoria)

id

application_id

candidate_id

user_id (nullable para eventos gerados pelo candidato)

type enum

occurred_at timestamp tz

notes text

metadata jsonb (opcional)

created_at

Tipos de evento mínimos

PRE_CADASTRO_CRIADO

EMPRESA_SETOR_DEFINIDOS

PROTOCOLO_GERADO

LINK_GERADO

WHATSAPP_ABERTO_PARA_ENVIO

LINK_ENVIADO_CONFIRMADO

CADASTRO_PREENCHIDO

REENVIO_LINK

CONTATO_REALIZADO

SEM_RESPOSTA

ENTREVISTA_MARCADA

ENCAMINHADO

APROVADO

REPROVADO

DESISTIU

4) Campos do formulário público (candidato)

Obrigatórios:

Nome

CPF (validar)

Telefone (travado/validado conforme pré-cadastro)

Valor VT (R$)

Escolaridade

Data de Nascimento

Preferência de horário (checkbox):

Manhã, Tarde, Noite (1, 2 ou 3)

Pergunta condicional por empresa:

Se company.perguntar_recontratacao = true:

Se company.sigilosa = false e modo = COM_NOME:

“Você já trabalhou na {NOME}?”

Caso contrário:

“Você já trabalhou nesta empresa anteriormente?”

Resposta: SIM / NÃO

Sigilo total: nenhuma informação da empresa/vaga aparece publicamente.

5) UX / Telas obrigatórias (100% responsivas)
/login (psicóloga)

e-mail + senha

entrar

proteger todo painel com auth

/dashboard

cards com contadores por status

fila “Aguardando envio”

fila “Aguardando preenchimento”

fila “Cadastro completo”

/companies (CRUD)

incluir campos sigilosa + perguntar_recontratacao + modo_pergunta

validações de regra (sigilosa força modo genérico)

/sectors (CRUD por empresa)
/applications/new (pré-cadastro)

input telefone

select empresa

select setor/vaga

ao salvar:

cria candidate (só telefone)

cria application

gera protocol

gera token/link

registra eventos: PRE_CADASTRO_CRIADO, EMPRESA_SETOR_DEFINIDOS, PROTOCOLO_GERADO, LINK_GERADO

Tela exibe:

Protocolo

Link

Botão “Abrir WhatsApp para enviar”

Botão “Marcar como enviado”

Botão “Copiar mensagem” (sugestão importante)

/applications/[id]

detalhes (candidato + empresa/vaga interna)

linha do tempo (events)

ações:

abrir whatsapp para reenviar

marcar enviado

registrar contato (modal)

alterar status

editar candidato (admin)

/candidates

busca por telefone/CPF/nome

ao encontrar candidato → ver inscrições (applications)

/cadastro/t/[token] (público)

formulário neutro

ao enviar:

atualiza dados do candidate

status app: CADASTRO_PREENCHIDO

used_at no token

evento CADASTRO_PREENCHIDO

6) WhatsApp deep link (obrigatório)

Implementar:

Normalizar telefone para E.164: 55 + DDD + número

Botão “Abrir WhatsApp” abre:
https://wa.me/55DDDNXXXXXXXX?text=<texto-url-encoded>

Mensagem (neutra, sem empresa):
“Olá! 😊 Tudo bem?
Para concluir seu cadastro no processo seletivo, preencha este link: {LINK}
Protocolo: {PROTOCOLO}
Obrigado!”

Ao clicar “Abrir WhatsApp”:

registrar evento WHATSAPP_ABERTO_PARA_ENVIO

Ao clicar “Marcar como enviado”:

registrar evento LINK_ENVIADO_CONFIRMADO

status: LINK_ENVIADO

Sugestão: adicionar botão “Copiar mensagem” porque em alguns celulares o WhatsApp pode abrir e o texto não colar perfeito.

7) Exportação Excel/CSV (obrigatório)

Endpoint/tela para exportar:

filtros:

empresa

setor/vaga

período (data inicial/final)

status

export XLSX com:

aba “Inscrições” (dados do candidato + status + datas principais)

aba “Eventos” (timeline completa por inscrição) — recomendado

Datas principais a incluir no export:

data pré-cadastro

data link gerado

data link enviado confirmado

data cadastro preenchido

8) Qualidade, segurança e “sugestões do arquiteto”

Obrigatório:

Validar CPF (dígitos) e bloquear duplicidade

Normalizar telefone (só números + DDD)

Tokens:

armazenar token hash no banco (não salvar token puro)

expiração opcional (ex.: 7 dias)

Rate limit no endpoint público (anti-spam)

Índices:

candidates.phone_normalizado

candidates.cpf

applications.protocol

invite_tokens.token_hash

Logs e auditoria por user_id

Testes mínimos:

CPF válido/inválido

duplicidade telefone

sigilo (nunca expor empresa)

token inválido/expirado

Deploy no Render:

Web Service Next.js

Postgres com backups

env vars: DATABASE_URL, AUTH_SECRET, etc.

9) Entrega final esperada

Repositório com:

Prisma schema + migrações

Next.js app com páginas internas/públicas

Auth funcionando

CRUD companies/sectors

Fluxo completo:
pré-cadastro → empresa/vaga → protocolo/link → abrir WhatsApp → marcar enviado → candidato preenche → timeline → export

README com:

como rodar local (Docker opcional)

como subir no Render

variáveis de ambiente

Construa com código limpo, comentários úteis, e foco em produtividade da psicóloga (poucos cliques e tudo rastreável).