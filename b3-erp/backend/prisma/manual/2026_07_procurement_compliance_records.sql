-- Additive-only table for net-new procurement compliance records.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_compliance_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplier_id" varchar(100) NULL,
  "requirement" varchar(255) NOT NULL,
  "status" varchar(30) NOT NULL DEFAULT 'pending',
  "evidence" text NULL,
  "due_date" date NULL,
  "completed_date" date NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_compliance_records" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_compliance_records_company_status"
  ON "procurement_compliance_records" ("companyId", "status");
