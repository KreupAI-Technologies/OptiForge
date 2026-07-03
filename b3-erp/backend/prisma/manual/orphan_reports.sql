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

-- ---------------------------------------------------------------------------
-- Report catalog: available reports grouped by module. Backs the module
-- report-landing pages (/reports/financial, /reports/hr, ...). Additive only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "report_catalog_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" varchar(64) NOT NULL,
  "module" varchar(60) NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" varchar(500),
  "category" varchar(120),
  "frequency" varchar(60),
  "href" varchar(300),
  "lastGenerated" varchar(40),
  "sortOrder" int NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "report_catalog_items_company_module_idx"
  ON "report_catalog_items" ("companyId", "module");

-- ---------------------------------------------------------------------------
-- Saved / custom reports ("My Reports" on the custom report builder page).
-- Independent of the Prisma SavedReport model. Additive only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "report_saved_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" varchar(64) NOT NULL,
  "name" varchar(200) NOT NULL,
  "description" varchar(500),
  "category" varchar(60),
  "dataSource" varchar(120),
  "config" jsonb,
  "outputFormat" varchar(20) NOT NULL DEFAULT 'pdf',
  "createdByName" varchar(120),
  "isFavorite" boolean NOT NULL DEFAULT false,
  "isShared" boolean NOT NULL DEFAULT false,
  "runCount" int NOT NULL DEFAULT 0,
  "lastRunAt" varchar(40),
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "report_saved_items_company_idx"
  ON "report_saved_items" ("companyId");
