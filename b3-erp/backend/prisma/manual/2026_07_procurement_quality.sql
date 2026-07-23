-- Additive-only tables backing the procurement Quality Assurance module:
--   inspections -> GET/POST /api/v1/procurement/quality/inspections
--                  PATCH .../inspections/:id/results | :id/reject
--   templates   -> GET/POST /api/v1/procurement/quality/templates
--                  PATCH .../templates/:id | POST .../templates/:id/use
--   ncrs        -> GET/POST /api/v1/procurement/quality/ncrs
-- (ProcurementInspection / ProcurementInspectionTemplate / ProcurementNcr)
-- Column names are camelCase + quoted to match TypeORM's default naming
-- (no SnakeNamingStrategy is configured in this backend).
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_inspections" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "poNumber" varchar(100) NULL,
  "supplierId" varchar(100) NULL,
  "supplier" varchar(255) NULL,
  "items" varchar(255) NULL,
  "quantity" integer NOT NULL DEFAULT 0,
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "dueDate" date NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "inspector" varchar(255) NULL,
  "riskLevel" varchar(20) NOT NULL DEFAULT 'medium',
  "templateId" varchar(100) NULL,
  "result" varchar(20) NULL,
  "defectsFound" integer NULL,
  "resultNotes" text NULL,
  "rejectionReason" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_inspections" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_inspections_company_status"
  ON "procurement_inspections" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_procurement_inspections_company_created"
  ON "procurement_inspections" ("companyId", "createdAt");

CREATE TABLE IF NOT EXISTS "procurement_inspection_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "checkpoints" integer NOT NULL DEFAULT 0,
  "usage" integer NOT NULL DEFAULT 0,
  "lastUsed" date NULL,
  "description" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_inspection_templates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_inspection_templates_company_category"
  ON "procurement_inspection_templates" ("companyId", "category");

CREATE TABLE IF NOT EXISTS "procurement_ncrs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "ncrNumber" varchar(100) NULL,
  "inspectionId" varchar(100) NULL,
  "supplierId" varchar(100) NULL,
  "supplier" varchar(255) NULL,
  "title" varchar(255) NULL,
  "description" text NULL,
  "severity" varchar(20) NOT NULL DEFAULT 'minor',
  "status" varchar(20) NOT NULL DEFAULT 'open',
  "rootCause" text NULL,
  "correctiveAction" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_ncrs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_ncrs_company_status"
  ON "procurement_ncrs" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_procurement_ncrs_company_created"
  ON "procurement_ncrs" ("companyId", "createdAt");
