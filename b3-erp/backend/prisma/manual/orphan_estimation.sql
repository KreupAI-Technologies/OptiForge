-- Additive tables for orphaned Estimation pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs estimation/pricing (price lists) page.
CREATE TABLE IF NOT EXISTS "estimation_price_lists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "priceListName" character varying NOT NULL,
  "description" text,
  "currency" character varying NOT NULL DEFAULT 'USD',
  "effectiveFrom" date,
  "effectiveTo" date,
  "status" character varying NOT NULL DEFAULT 'active',
  "totalItems" integer NOT NULL DEFAULT 0,
  "priceType" character varying NOT NULL DEFAULT 'standard',
  "customerSegment" character varying,
  "lastUpdated" date,
  "updatedBy" character varying,
  "averageMargin" numeric(5,2) NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_price_lists" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_price_lists_company"
  ON "estimation_price_lists" ("companyId");

-- Backs estimation/settings/markup page.
CREATE TABLE IF NOT EXISTS "estimation_markup_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "category" character varying NOT NULL,
  "subcategory" character varying,
  "defaultMarkup" numeric(5,2) NOT NULL DEFAULT 0,
  "minMarkup" numeric(5,2) NOT NULL DEFAULT 0,
  "maxMarkup" numeric(5,2) NOT NULL DEFAULT 0,
  "costBasis" character varying NOT NULL DEFAULT 'full-cost',
  "approvalRequired" boolean NOT NULL DEFAULT false,
  "approvalThreshold" numeric(5,2) NOT NULL DEFAULT 0,
  "updatedBy" character varying,
  "status" character varying NOT NULL DEFAULT 'active',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_markup_settings" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_markup_settings_company"
  ON "estimation_markup_settings" ("companyId");

-- Backs estimation/settings/workflow page.
CREATE TABLE IF NOT EXISTS "estimation_workflow_stage_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "stageCode" character varying NOT NULL,
  "stageName" character varying NOT NULL,
  "stageOrder" integer NOT NULL DEFAULT 0,
  "description" text,
  "approverRole" character varying,
  "approvalRequired" boolean NOT NULL DEFAULT false,
  "autoAdvance" boolean NOT NULL DEFAULT false,
  "notifyOnEntry" boolean NOT NULL DEFAULT false,
  "notifyOnApproval" boolean NOT NULL DEFAULT false,
  "maxDaysInStage" integer NOT NULL DEFAULT 0,
  "escalationEnabled" boolean NOT NULL DEFAULT false,
  "escalationDays" integer NOT NULL DEFAULT 0,
  "escalateTo" character varying,
  "allowReject" boolean NOT NULL DEFAULT false,
  "allowRevision" boolean NOT NULL DEFAULT false,
  "status" character varying NOT NULL DEFAULT 'active',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_workflow_stage_settings" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_workflow_stage_settings_company"
  ON "estimation_workflow_stage_settings" ("companyId");

-- ============================================================
-- Follow-up pass: additive tables for orphan mock-only pages
-- (settings/categories, costing/labor, costing/materials, costing/overhead)
-- ADDITIVE ONLY - CREATE TABLE IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS "estimation_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "code" varchar(50) NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "parentCategory" varchar(100) NULL,
  "type" varchar(50) NOT NULL DEFAULT 'material',
  "defaultMarkup" numeric(5,2) NOT NULL DEFAULT 0,
  "itemCount" integer NOT NULL DEFAULT 0,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_categories" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_categories_company_code"
  ON "estimation_categories" ("companyId", "code");

CREATE TABLE IF NOT EXISTS "estimation_labor_cost_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "skill" varchar(255) NOT NULL,
  "department" varchar(100) NULL,
  "level" varchar(50) NULL,
  "standardRate" numeric(12,2) NOT NULL DEFAULT 0,
  "overtimeRate" numeric(12,2) NOT NULL DEFAULT 0,
  "unit" varchar(20) NOT NULL DEFAULT 'hour',
  "efficiency" numeric(5,2) NOT NULL DEFAULT 0,
  "utilization" numeric(5,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_labor_cost_rates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_labor_cost_rates_company_dept"
  ON "estimation_labor_cost_rates" ("companyId", "department");

CREATE TABLE IF NOT EXISTS "estimation_material_cost_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "materialCode" varchar(50) NULL,
  "materialName" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "unit" varchar(20) NOT NULL DEFAULT 'unit',
  "currentPrice" numeric(12,2) NOT NULL DEFAULT 0,
  "previousPrice" numeric(12,2) NOT NULL DEFAULT 0,
  "variancePercent" numeric(8,2) NOT NULL DEFAULT 0,
  "supplier" varchar(255) NULL,
  "lastUpdated" date NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_material_cost_rates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_material_cost_rates_company_cat"
  ON "estimation_material_cost_rates" ("companyId", "category");

CREATE TABLE IF NOT EXISTS "estimation_overhead_costs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "costType" varchar(50) NOT NULL DEFAULT 'fixed',
  "monthlyAmount" numeric(15,2) NOT NULL DEFAULT 0,
  "annualAmount" numeric(15,2) NOT NULL DEFAULT 0,
  "allocationMethod" varchar(50) NOT NULL DEFAULT 'percentage',
  "allocationRate" numeric(8,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_overhead_costs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_overhead_costs_company_cat"
  ON "estimation_overhead_costs" ("companyId", "category");

-- ============================================================
-- Report schedules (estimation/analytics/reports/schedule pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS "estimation_report_schedules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "reportType" varchar(255) NOT NULL,
  "frequency" varchar(20) NOT NULL DEFAULT 'weekly',
  "dayOfWeek" varchar(20) NULL,
  "dayOfMonth" varchar(20) NULL,
  "time" varchar(10) NOT NULL DEFAULT '09:00',
  "format" varchar(20) NOT NULL DEFAULT 'pdf',
  "recipients" jsonb NOT NULL DEFAULT '[]',
  "isActive" boolean NOT NULL DEFAULT true,
  "lastRunAt" timestamp NULL,
  "nextRunAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_report_schedules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_report_schedules_company"
  ON "estimation_report_schedules" ("companyId", "isActive");

-- ============================================================
-- Estimate comments (estimation/workflow/pending/comments pages)
-- ============================================================
CREATE TABLE IF NOT EXISTS "estimation_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "estimateId" varchar(100) NOT NULL,
  "authorId" varchar(100) NULL,
  "authorName" varchar(255) NULL,
  "message" text NOT NULL,
  "commentType" varchar(30) NOT NULL DEFAULT 'comment',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_comments" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_comments_estimate"
  ON "estimation_comments" ("companyId", "estimateId");

-- ============================================================
-- What-If simulation scenarios (estimation/what-if pages)
-- Net-new capability. ADDITIVE ONLY - CREATE TABLE IF NOT EXISTS.
-- ============================================================
CREATE TABLE IF NOT EXISTS "estimation_whatif_scenarios" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "estimateId" character varying NULL,
  "name" character varying NOT NULL,
  "baseValue" numeric(15,2) NULL,
  "variables" jsonb NOT NULL DEFAULT '[]',
  "results" jsonb NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_whatif_scenarios" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_whatif_scenarios_company"
  ON "estimation_whatif_scenarios" ("companyId", "estimateId");

-- ============================================================
-- BOM import sessions (estimation/bom-import pages)
-- Net-new capability. ADDITIVE ONLY - CREATE TABLE IF NOT EXISTS.
-- ============================================================
CREATE TABLE IF NOT EXISTS "estimation_bom_import_sessions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "estimateId" character varying NULL,
  "fileName" character varying NOT NULL,
  "status" character varying NOT NULL DEFAULT 'completed',
  "rowCount" integer NOT NULL DEFAULT 0,
  "rows" jsonb NOT NULL DEFAULT '[]',
  "errors" jsonb NOT NULL DEFAULT '[]',
  "totalValue" numeric(15,2) NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_bom_import_sessions" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_bom_import_sessions_company"
  ON "estimation_bom_import_sessions" ("companyId", "estimateId");
