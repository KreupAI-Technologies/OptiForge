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

-- ============================================================================
-- Follow-up pass: wire remaining mock-only finance pages.
-- These tables are backed by pre-existing TypeORM entities (already in
-- FinanceModule.forFeature). CREATE TABLE IF NOT EXISTS statements below are
-- ADDITIVE and idempotent — they are no-ops when the table already exists and
-- never DROP/ALTER. New CRUD/analytics controllers were added over them.
-- ============================================================================

-- Backs /finance/budgeting/budgets (BudgetController @ finance/budgets).
-- Entity: src/modules/finance/entities/budget.entity.ts
CREATE TABLE IF NOT EXISTS "budgets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "budgetCode" character varying(50) NOT NULL,
  "budgetName" character varying(255) NOT NULL,
  "financialYearId" character varying,
  "budgetType" character varying NOT NULL DEFAULT 'Operating Budget',
  "startDate" date NOT NULL,
  "endDate" date NOT NULL,
  "status" character varying NOT NULL DEFAULT 'Draft',
  "department" character varying(100),
  "costCenter" character varying(100),
  "project" character varying(100),
  "location" character varying(100),
  "totalBudgetedAmount" numeric(15,2) NOT NULL DEFAULT 0,
  "totalActualAmount" numeric(15,2) NOT NULL DEFAULT 0,
  "totalVariance" numeric(15,2) NOT NULL DEFAULT 0,
  "utilizationPercentage" numeric(5,2) NOT NULL DEFAULT 0,
  "description" text,
  "submittedBy" character varying,
  "submittedAt" timestamp,
  "approvedBy" character varying,
  "approvedAt" timestamp,
  "rejectedBy" character varying,
  "rejectedAt" timestamp,
  "rejectionReason" text,
  "version" integer NOT NULL DEFAULT 1,
  "previousVersionId" character varying,
  "revisionNotes" text,
  "notes" text,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_budgets" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_budgets_code" UNIQUE ("budgetCode")
);
CREATE INDEX IF NOT EXISTS "IDX_budgets_status" ON "budgets" ("status");
CREATE INDEX IF NOT EXISTS "IDX_budgets_department" ON "budgets" ("department");

-- Backs /finance/assets/fixed-assets (FixedAssetController @ finance/fixed-assets)
-- and the /finance/assets dashboard (finance/fixed-assets/summary).
-- Entity: src/modules/finance/entities/fixed-asset.entity.ts
CREATE TABLE IF NOT EXISTS "fixed_assets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "assetCode" character varying(50) NOT NULL,
  "assetName" character varying(255) NOT NULL,
  "description" text,
  "assetCategory" character varying(100) NOT NULL,
  "assetSubCategory" character varying(100),
  "glAccountId" character varying,
  "acquisitionDate" date NOT NULL,
  "acquisitionCost" numeric(15,2) NOT NULL,
  "supplier" character varying(100),
  "invoiceNumber" character varying(100),
  "poNumber" character varying(100),
  "depreciationMethod" character varying NOT NULL DEFAULT 'Straight Line',
  "usefulLifeYears" integer NOT NULL,
  "usefulLifeMonths" integer NOT NULL DEFAULT 12,
  "depreciationRate" numeric(5,2),
  "salvageValue" numeric(15,2) NOT NULL DEFAULT 0,
  "depreciationStartDate" date NOT NULL,
  "accumulatedDepreciation" numeric(15,2) NOT NULL DEFAULT 0,
  "netBookValue" numeric(15,2) NOT NULL DEFAULT 0,
  "lastDepreciationDate" date,
  "nextDepreciationDate" date,
  "location" character varying(100),
  "department" character varying(100),
  "costCenter" character varying(100),
  "assignedToEmployeeId" character varying,
  "assignedToEmployeeName" character varying(255),
  "manufacturer" character varying(100),
  "model" character varying(100),
  "serialNumber" character varying(100),
  "barcode" character varying(100),
  "status" character varying NOT NULL DEFAULT 'Active',
  "isDepreciable" boolean NOT NULL DEFAULT true,
  "warrantyStartDate" date,
  "warrantyEndDate" date,
  "warrantyProvider" character varying(255),
  "isInsured" boolean NOT NULL DEFAULT false,
  "insuranceProvider" character varying(255),
  "insurancePolicyNumber" character varying(100),
  "insuranceExpiryDate" date,
  "insuredValue" numeric(15,2),
  "disposalDate" date,
  "disposalAmount" numeric(15,2),
  "gainLossOnDisposal" numeric(15,2),
  "disposalReason" text,
  "attachments" json,
  "notes" text,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_fixed_assets" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_fixed_assets_code" UNIQUE ("assetCode")
);
CREATE INDEX IF NOT EXISTS "IDX_fixed_assets_status" ON "fixed_assets" ("status");
CREATE INDEX IF NOT EXISTS "IDX_fixed_assets_category" ON "fixed_assets" ("assetCategory");

-- Backs /finance/cost-centers (CostCenterController @ finance/cost-centers).
-- Entity: src/modules/finance/entities/cost-accounting.entity.ts (CostCenter)
CREATE TABLE IF NOT EXISTS "cost_centers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "costCenterCode" character varying(50) NOT NULL,
  "costCenterName" character varying(255) NOT NULL,
  "description" text,
  "parentCostCenterId" character varying,
  "department" character varying(100),
  "location" character varying(100),
  "managerId" character varying,
  "managerName" character varying(255),
  "isActive" boolean NOT NULL DEFAULT true,
  "isProfitCenter" boolean NOT NULL DEFAULT false,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cost_centers" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_cost_centers_code" UNIQUE ("costCenterCode")
);
CREATE INDEX IF NOT EXISTS "IDX_cost_centers_department" ON "cost_centers" ("department");

-- Backs /finance/tax (TaxMasterController @ finance/tax-masters).
-- Entity: src/modules/finance/entities/tax.entity.ts (TaxMaster)
CREATE TABLE IF NOT EXISTS "tax_masters" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "taxCode" character varying(50) NOT NULL,
  "taxName" character varying(255) NOT NULL,
  "taxType" character varying NOT NULL,
  "taxCategory" character varying NOT NULL,
  "taxRate" numeric(5,2) NOT NULL,
  "effectiveFrom" date NOT NULL,
  "effectiveTo" date,
  "description" text,
  "taxPayableAccountId" character varying,
  "taxReceivableAccountId" character varying,
  "taxExpenseAccountId" character varying,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_tax_masters" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_tax_masters_code" UNIQUE ("taxCode")
);
CREATE INDEX IF NOT EXISTS "IDX_tax_masters_type" ON "tax_masters" ("taxType");

-- Backs the /finance/cash dashboard (CashAnalyticsController @ finance/cash).
-- Read-only aggregation over the existing cash_flow_transactions table.
-- Entity: src/modules/finance/entities/cash-flow.entity.ts (CashFlowTransaction)
CREATE TABLE IF NOT EXISTS "cash_flow_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "transactionNumber" character varying(50) NOT NULL,
  "periodId" character varying NOT NULL,
  "transactionDate" date NOT NULL,
  "category" character varying NOT NULL,
  "flowType" character varying NOT NULL,
  "source" character varying NOT NULL DEFAULT 'Actual',
  "description" text NOT NULL,
  "amount" numeric(15,2) NOT NULL,
  "referenceNumber" character varying(100),
  "referenceType" character varying(50),
  "referenceId" character varying,
  "partyId" character varying,
  "partyName" character varying(255),
  "partyType" character varying(50),
  "bankAccountId" character varying,
  "glAccountId" character varying,
  "costCenter" character varying(100),
  "department" character varying(100),
  "project" character varying(100),
  "location" character varying(100),
  "notes" text,
  "createdBy" character varying(100),
  "updatedBy" character varying(100),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cash_flow_transactions" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_cash_flow_transactions_number" UNIQUE ("transactionNumber")
);
CREATE INDEX IF NOT EXISTS "IDX_cash_flow_transactions_date" ON "cash_flow_transactions" ("transactionDate");
