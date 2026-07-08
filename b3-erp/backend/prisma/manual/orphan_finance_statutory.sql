-- Additive tables for Finance statutory filings + period-close checklist.
-- ADDITIVE ONLY: never DROP or ALTER existing tables. Idempotent.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entities:
--   src/modules/finance/entities/statutory-return.entity.ts
--   src/modules/finance/entities/period-close-step.entity.ts

-- ============================================================================
-- GST returns (GSTR-1 / GSTR-3B filings + imported GSTR-2A datasets).
-- Entity: GstReturn
-- ============================================================================
CREATE TABLE IF NOT EXISTS "gst_returns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "returnType" character varying(20) NOT NULL,
  "period" character varying(20) NOT NULL,
  "dueDate" date,
  "status" character varying(30) NOT NULL DEFAULT 'Draft',
  "filedDate" timestamp without time zone,
  "ackNo" character varying(100),
  "totalSales" numeric(15,2) NOT NULL DEFAULT 0,
  "totalPurchases" numeric(15,2) NOT NULL DEFAULT 0,
  "outputTax" numeric(15,2) NOT NULL DEFAULT 0,
  "inputTax" numeric(15,2) NOT NULL DEFAULT 0,
  "netTax" numeric(15,2) NOT NULL DEFAULT 0,
  "rows" json,
  "notes" text,
  "createdBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_gst_returns" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_gst_returns_type_period"
  ON "gst_returns" ("returnType", "period");

-- ============================================================================
-- TDS returns (24Q / 26Q / 27Q / 27EQ).
-- Entity: TdsReturn
-- ============================================================================
CREATE TABLE IF NOT EXISTS "tds_returns" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "formType" character varying(20) NOT NULL,
  "quarter" character varying(30) NOT NULL,
  "dueDate" date,
  "status" character varying(30) NOT NULL DEFAULT 'Draft',
  "filedDate" timestamp without time zone,
  "acknowledgementNumber" character varying(100),
  "totalDeductions" numeric(15,2) NOT NULL DEFAULT 0,
  "totalDeposited" numeric(15,2) NOT NULL DEFAULT 0,
  "deducteeCount" integer NOT NULL DEFAULT 0,
  "rows" json,
  "notes" text,
  "createdBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_tds_returns" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tds_returns_form_quarter"
  ON "tds_returns" ("formType", "quarter");

-- ============================================================================
-- TDS challans (bank deposit receipts).
-- Entity: TdsChallan
-- ============================================================================
CREATE TABLE IF NOT EXISTS "tds_challans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "challanNumber" character varying(50) NOT NULL,
  "challanDate" date NOT NULL,
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "section" character varying(20) NOT NULL,
  "bankName" character varying(150),
  "bsrCode" character varying(20),
  "status" character varying(30) NOT NULL DEFAULT 'Paid',
  "quarter" character varying(30),
  "notes" text,
  "createdBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_tds_challans" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_tds_challans_section"
  ON "tds_challans" ("section");

-- ============================================================================
-- Period-close checklist read model (one row per period + standard step).
-- Entity: PeriodCloseStep
-- ============================================================================
CREATE TABLE IF NOT EXISTS "period_close_steps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "financialPeriodId" character varying NOT NULL,
  "stepKey" character varying(60) NOT NULL,
  "stepName" character varying(150) NOT NULL,
  "description" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "status" character varying(30) NOT NULL DEFAULT 'not-started',
  "completedBy" character varying(100),
  "completedAt" timestamp without time zone,
  "notes" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_period_close_steps" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_period_close_steps_period_step"
  ON "period_close_steps" ("financialPeriodId", "stepKey");
