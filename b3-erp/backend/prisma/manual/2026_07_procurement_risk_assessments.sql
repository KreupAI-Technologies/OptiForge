-- Additive-only table for net-new procurement risk assessments.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_risk_assessments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplier_id" varchar(100) NULL,
  "category" varchar(100) NOT NULL,
  "risk_level" varchar(30) NOT NULL DEFAULT 'medium',
  "likelihood" integer NOT NULL DEFAULT 3,
  "impact" integer NOT NULL DEFAULT 3,
  "mitigation_plan" text NULL,
  "status" varchar(30) NOT NULL DEFAULT 'identified',
  "review_date" date NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_risk_assessments" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_risk_assessments_company_status"
  ON "procurement_risk_assessments" ("companyId", "status");
