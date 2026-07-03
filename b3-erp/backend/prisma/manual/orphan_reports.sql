-- Additive migration for the Reports module (NestJS / TypeORM).
-- Creates the generic report_datasets table used to store pre-computed report
-- render payloads keyed by (companyId, reportKey). Idempotent + non-destructive:
-- CREATE TABLE IF NOT EXISTS only, never DROP/ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

CREATE TABLE IF NOT EXISTS "report_datasets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" varchar(64) NOT NULL,
  "reportKey" varchar(150) NOT NULL,
  "title" varchar(255),
  "category" varchar(100),
  "payload" jsonb,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "report_datasets_company_key_uq"
  ON "report_datasets" ("companyId", "reportKey");
