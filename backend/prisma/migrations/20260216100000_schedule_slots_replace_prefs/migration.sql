-- AlterTable: replace schedule_prefs (enum[]) with schedule_slots (text[])

ALTER TABLE "sectors" ADD COLUMN "schedule_slots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "sectors" DROP COLUMN "schedule_prefs";
