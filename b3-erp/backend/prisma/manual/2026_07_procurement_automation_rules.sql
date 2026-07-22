-- Additive-only table for net-new procurement automation rules.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_automation_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "trigger" varchar(100) NOT NULL,
  "conditions" jsonb NULL,
  "actions" jsonb NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_automation_rules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_automation_rules_company_active"
  ON "procurement_automation_rules" ("companyId", "is_active");
