-- Additive tables for orphaned Inventory pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs the adjustment reason codes page
-- (/inventory/adjustments/reasons), which previously rendered a hardcoded
-- mock array. The table + seed already exist via the AdjustmentReason TypeORM
-- entity and AdjustmentReasonSeederService; this statement is idempotent and
-- only creates the table if it is not already present.
-- Entity: src/modules/inventory/entities/adjustment-reason.entity.ts
CREATE TABLE IF NOT EXISTS "adjustment_reasons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" character varying(50) NOT NULL,
  "name" character varying(255) NOT NULL,
  "description" text,
  "reasonType" character varying NOT NULL DEFAULT 'Both',
  "status" character varying NOT NULL DEFAULT 'Active',
  "expenseAccountId" character varying,
  "expenseAccountName" character varying(255),
  "incomeAccountId" character varying,
  "incomeAccountName" character varying(255),
  "requiresApproval" boolean NOT NULL DEFAULT false,
  "approvalThreshold" numeric(15,2),
  "sortOrder" integer NOT NULL DEFAULT 0,
  "icon" character varying(50),
  "color" character varying(20),
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_adjustment_reasons" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_adjustment_reasons_code" UNIQUE ("code")
);

CREATE INDEX IF NOT EXISTS "IDX_adjustment_reasons_status"
  ON "adjustment_reasons" ("status");

CREATE INDEX IF NOT EXISTS "IDX_adjustment_reasons_sort_order"
  ON "adjustment_reasons" ("sortOrder");
