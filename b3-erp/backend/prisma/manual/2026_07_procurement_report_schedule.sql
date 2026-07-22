-- Scheduling columns for procurement_report_templates.
-- ADDITIVE + IDEMPOTENT: only ADD COLUMN IF NOT EXISTS. Never DROP or ALTER existing data.
-- Backs the @Cron scheduled-report execution engine (procurement.module).
-- Entity: src/modules/procurement/entities/procurement-report-template.entity.ts
-- NOTE: "schedule" column already exists on this table (created in the base migration);
--       ADD COLUMN IF NOT EXISTS is a safe no-op there.

ALTER TABLE "procurement_report_templates"
  ADD COLUMN IF NOT EXISTS "schedule" varchar(100);

ALTER TABLE "procurement_report_templates"
  ADD COLUMN IF NOT EXISTS "recipients" jsonb;

ALTER TABLE "procurement_report_templates"
  ADD COLUMN IF NOT EXISTS "last_run_at" timestamp;

ALTER TABLE "procurement_report_templates"
  ADD COLUMN IF NOT EXISTS "next_run_at" timestamp;

ALTER TABLE "procurement_report_templates"
  ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;

-- Speeds up the due-template scan.
CREATE INDEX IF NOT EXISTS "IDX_procurement_report_templates_due"
  ON "procurement_report_templates" ("is_active", "next_run_at");
