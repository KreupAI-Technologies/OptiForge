-- Additive-only table for net-new supplier diversity programs.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "supplier_diversity_programs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplier_id" varchar(100) NULL,
  "category" varchar(100) NOT NULL,
  "certification_type" varchar(100) NULL,
  "status" varchar(30) NOT NULL DEFAULT 'prospect',
  "spend_amount" numeric(15,2) NOT NULL DEFAULT 0,
  "goal_percent" numeric(5,2) NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_supplier_diversity_programs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_diversity_programs_company_status"
  ON "supplier_diversity_programs" ("companyId", "status");
