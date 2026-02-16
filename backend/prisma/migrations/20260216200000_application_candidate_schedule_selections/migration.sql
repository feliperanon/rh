-- AlterTable: add candidate_schedule_selections to applications

ALTER TABLE "applications" ADD COLUMN "candidate_schedule_selections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
