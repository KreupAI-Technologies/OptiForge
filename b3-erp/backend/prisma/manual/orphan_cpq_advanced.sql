-- Additive tables + columns for CPQ advanced-features tabs.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- isFavorite flag for quote templates — previously presentation-only.
-- Backs the favorite star on cpq/quotes/templates.
ALTER TABLE "cpq_quote_templates"
  ADD COLUMN IF NOT EXISTS "isFavorite" boolean NOT NULL DEFAULT false;

-- Pricing version-control records — backs the advanced-features
-- "Pricing Version Control" tab.
CREATE TABLE IF NOT EXISTS "cpq_pricing_versions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "version" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "status" character varying NOT NULL DEFAULT 'draft',
  "changeType" character varying NOT NULL DEFAULT 'price_increase',
  "changes" json,
  "totalItems" integer NOT NULL DEFAULT 0,
  "avgPriceChange" numeric(8,2) NOT NULL DEFAULT 0,
  "notes" text,
  "createdBy" character varying,
  "approvedBy" character varying,
  "approvedAt" timestamp without time zone,
  "activatedAt" timestamp without time zone,
  "scheduledFor" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_pricing_versions" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_pricing_versions_company"
  ON "cpq_pricing_versions" ("companyId");

-- Approval-matrix rules — backs the advanced-features "Approval Matrix" tab.
CREATE TABLE IF NOT EXISTS "cpq_approval_matrix" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "condition" json,
  "requiredApprovers" json,
  "priority" character varying NOT NULL DEFAULT 'medium',
  "autoEscalateAfterHours" integer,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_approval_matrix" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_approval_matrix_company"
  ON "cpq_approval_matrix" ("companyId");
