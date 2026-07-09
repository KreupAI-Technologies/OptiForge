-- Additive-only tables for net-new procurement RFQ bid + template endpoints.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_rfq_bids" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "rfqId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NULL,
  "supplierName" varchar(255) NOT NULL,
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "status" varchar(30) NOT NULL DEFAULT 'submitted',
  "notes" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_rfq_bids" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_rfq_bids_company_rfq"
  ON "procurement_rfq_bids" ("companyId", "rfqId");

CREATE INDEX IF NOT EXISTS "IDX_procurement_rfq_bids_company_status"
  ON "procurement_rfq_bids" ("companyId", "status");

CREATE TABLE IF NOT EXISTS "procurement_rfq_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "type" varchar(20) NOT NULL DEFAULT 'RFQ',
  "description" text NULL,
  "content" jsonb NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_rfq_templates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_rfq_templates_company"
  ON "procurement_rfq_templates" ("companyId");
