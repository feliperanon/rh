-- AlterTable: add schedule_prefs to sectors
ALTER TABLE "sectors" ADD COLUMN "schedule_prefs" "SchedulePref"[] NOT NULL DEFAULT ARRAY[]::"SchedulePref"[];

-- AlterTable: remove schedule_prefs from candidates
ALTER TABLE "candidates" DROP COLUMN "schedule_prefs";
