-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PSICOLOGA');

-- CreateEnum
CREATE TYPE "QuestionMode" AS ENUM ('GENERICO', 'COM_NOME');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PRE_CADASTRO', 'LINK_GERADO', 'WHATSAPP_ABERTO', 'LINK_ENVIADO', 'CADASTRO_PREENCHIDO', 'EM_CONTATO', 'ENTREVISTA_MARCADA', 'ENCAMINHADO', 'APROVADO', 'REPROVADO', 'DESISTIU');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRE_CADASTRO_CRIADO', 'EMPRESA_SETOR_DEFINIDOS', 'PROTOCOLO_GERADO', 'LINK_GERADO', 'WHATSAPP_ABERTO_PARA_ENVIO', 'LINK_ENVIADO_CONFIRMADO', 'CADASTRO_PREENCHIDO', 'REENVIO_LINK', 'CONTATO_REALIZADO', 'SEM_RESPOSTA', 'ENTREVISTA_MARCADA', 'ENCAMINHADO', 'APROVADO', 'REPROVADO', 'DESISTIU');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO');

-- CreateEnum
CREATE TYPE "SchedulePref" AS ENUM ('MANHA', 'TARDE', 'NOITE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PSICOLOGA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "nome_interno" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "sigilosa" BOOLEAN NOT NULL DEFAULT false,
    "perguntar_recontratacao" BOOLEAN NOT NULL DEFAULT false,
    "modo_pergunta_recontratacao" "QuestionMode" NOT NULL DEFAULT 'GENERICO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "phone_normalizado" TEXT NOT NULL,
    "phone_e164" TEXT NOT NULL,
    "name" TEXT,
    "cpf" TEXT,
    "birth_date" TIMESTAMP(3),
    "education" "Education",
    "vt_value_cents" INTEGER,
    "schedule_prefs" "SchedulePref"[],
    "worked_here_before" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PRE_CADASTRO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_tokens" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "EventType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sectors_company_id_idx" ON "sectors"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_phone_normalizado_key" ON "candidates"("phone_normalizado");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_phone_e164_key" ON "candidates"("phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_cpf_key" ON "candidates"("cpf");

-- CreateIndex
CREATE INDEX "candidates_phone_normalizado_idx" ON "candidates"("phone_normalizado");

-- CreateIndex
CREATE INDEX "candidates_cpf_idx" ON "candidates"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "applications_protocol_key" ON "applications"("protocol");

-- CreateIndex
CREATE INDEX "applications_candidate_id_idx" ON "applications"("candidate_id");

-- CreateIndex
CREATE INDEX "applications_company_id_idx" ON "applications"("company_id");

-- CreateIndex
CREATE INDEX "applications_sector_id_idx" ON "applications"("sector_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_protocol_idx" ON "applications"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "invite_tokens_token_hash_key" ON "invite_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "invite_tokens_token_hash_idx" ON "invite_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "invite_tokens_application_id_idx" ON "invite_tokens"("application_id");

-- CreateIndex
CREATE INDEX "events_application_id_idx" ON "events"("application_id");

-- CreateIndex
CREATE INDEX "events_candidate_id_idx" ON "events"("candidate_id");

-- CreateIndex
CREATE INDEX "events_user_id_idx" ON "events"("user_id");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_occurred_at_idx" ON "events"("occurred_at");

-- AddForeignKey
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
