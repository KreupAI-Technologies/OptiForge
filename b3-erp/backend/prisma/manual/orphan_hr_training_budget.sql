-- Additive table for HR Training Budget.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_training_budgets` (model TrainingBudget). Column
-- names are quoted to match the TypeORM entity column names exactly.
-- Entity: src/modules/hr/entities/training-budget.entity.ts
-- Backs GET/POST/PUT/DELETE /hr/training-budgets.

CREATE TABLE IF NOT EXISTS "hr_training_budgets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "budgetCode" character varying NOT NULL,
  "budgetType" character varying NOT NULL,
  "departmentId" character varying,
  "departmentName" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "fiscalYear" character varying NOT NULL,
  "periodType" character varying NOT NULL DEFAULT 'annual',
  "periodStart" timestamp without time zone NOT NULL DEFAULT now(),
  "periodEnd" timestamp without time zone NOT NULL DEFAULT now(),
  "allocatedAmount" numeric NOT NULL DEFAULT 0,
  "utilizedAmount" numeric NOT NULL DEFAULT 0,
  "remainingAmount" numeric NOT NULL DEFAULT 0,
  "reservedAmount" numeric NOT NULL DEFAULT 0,
  "breakdown" jsonb,
  "status" character varying NOT NULL DEFAULT 'active',
  "approvedBy" character varying,
  "approvedAt" timestamp without time zone,
  "notes" character varying,
  "companyId" character varying NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_budgets" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_budgets_companyId"
  ON "hr_training_budgets" ("companyId");
