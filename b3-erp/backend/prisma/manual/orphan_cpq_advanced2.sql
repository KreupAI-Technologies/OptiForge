-- Additive tables for CPQ advanced-features tabs (second pass):
-- guided-selling questions + margin guardrails.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Guided-selling questions/rules — backs the advanced-features
-- "Guided Selling" tab.
CREATE TABLE IF NOT EXISTS "cpq_guided_selling_questions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "title" character varying NOT NULL,
  "description" text,
  "questionType" character varying NOT NULL DEFAULT 'single',
  "required" boolean NOT NULL DEFAULT true,
  "displayOrder" integer NOT NULL DEFAULT 0,
  "options" json,
  "helpText" text,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_guided_selling_questions" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_guided_selling_company"
  ON "cpq_guided_selling_questions" ("companyId");

-- Margin guardrails — backs the advanced-features "Margin Analysis" tab
-- guardrail list.
CREATE TABLE IF NOT EXISTS "cpq_margin_guardrails" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "guardrailType" character varying NOT NULL DEFAULT 'min_margin',
  "threshold" numeric(8,2) NOT NULL DEFAULT 0,
  "enabled" boolean NOT NULL DEFAULT true,
  "action" character varying NOT NULL DEFAULT 'warn',
  "notifyRoles" json,
  "description" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_margin_guardrails" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_margin_guardrails_company"
  ON "cpq_margin_guardrails" ("companyId");
