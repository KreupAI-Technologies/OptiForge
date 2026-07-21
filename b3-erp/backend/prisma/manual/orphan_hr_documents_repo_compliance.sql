-- Additive columns on the EXISTING `hr_documents` table to support the
-- document-repository (view/index over this table) and document-compliance
-- (computed tracking) features. ADDITIVE ONLY — ADD COLUMN IF NOT EXISTS,
-- never DROP or rename. Column names quoted to match the TypeORM entity.
-- Entity: src/modules/hr/entities/hr-document.entity.ts

ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "fileUrl" varchar;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "archived" boolean NOT NULL DEFAULT false;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "employeeId" varchar;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "employeeName" varchar;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "employeeCode" varchar;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "department" varchar;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "remindersSent" integer NOT NULL DEFAULT 0;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "lastReminderAt" timestamp without time zone;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "resolvedAt" timestamp without time zone;
ALTER TABLE "hr_documents" ADD COLUMN IF NOT EXISTS "resolvedBy" varchar;
