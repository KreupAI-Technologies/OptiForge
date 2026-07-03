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
