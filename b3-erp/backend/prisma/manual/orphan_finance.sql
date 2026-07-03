-- Additive tables for orphaned Finance pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs the finance costing page (/finance/costing), which previously rendered
-- a hardcoded mock array. Tracks estimated vs actual cost per manufacturing job.
-- Entity: src/modules/finance/entities/job-cost-sheet.entity.ts
CREATE TABLE IF NOT EXISTS "job_cost_sheets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "costSheetNumber" character varying(50) NOT NULL,
  "jobNumber" character varying(50) NOT NULL,
  "jobName" character varying(255) NOT NULL,
  "projectType" character varying(100),
  "customer" character varying(255),
  "costingDate" date NOT NULL,
  "status" character varying NOT NULL DEFAULT 'Draft',
  "materialCost" numeric(15,2) NOT NULL DEFAULT 0,
  "laborCost" numeric(15,2) NOT NULL DEFAULT 0,
  "overheadCost" numeric(15,2) NOT NULL DEFAULT 0,
  "totalEstimatedCost" numeric(15,2) NOT NULL DEFAULT 0,
  "totalActualCost" numeric(15,2) NOT NULL DEFAULT 0,
  "profitMargin" numeric(5,2) NOT NULL DEFAULT 0,
  "costEngineer" character varying(100),
  "notes" text,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_job_cost_sheets" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_job_cost_sheets_number" UNIQUE ("costSheetNumber")
);

CREATE INDEX IF NOT EXISTS "IDX_job_cost_sheets_status"
  ON "job_cost_sheets" ("status");

CREATE INDEX IF NOT EXISTS "IDX_job_cost_sheets_project_type"
  ON "job_cost_sheets" ("projectType");
