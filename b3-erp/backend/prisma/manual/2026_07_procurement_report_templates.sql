-- Additive-only table for net-new procurement report templates.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_report_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "report_type" varchar(100) NOT NULL,
  "config" jsonb NULL,
  "schedule" varchar(100) NULL,
  "created_by" varchar(100) NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_report_templates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_report_templates_company_type"
  ON "procurement_report_templates" ("companyId", "report_type");
