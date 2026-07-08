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

-- ============================================================================
-- finance/advanced-features page — enterprise feature toggle registry
-- Additive only. Backs AdvancedFeature entity (finance_advanced_features).
-- ============================================================================
CREATE TABLE IF NOT EXISTS "finance_advanced_features" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default',
  "feature_key" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "category" varchar(50) NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "config" jsonb NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_advanced_features" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_advanced_features_company"
  ON "finance_advanced_features" ("company_id", "sort_order");

-- ============================================================================
-- Finance extras — new page-backing tables (additive, idempotent).
-- Entity: src/modules/finance/entities/finance-extras.entity.ts
-- Column names match the TypeORM @Column({ name }) snake_case mappings.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "finance_exchange_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "from_currency" varchar(10) NOT NULL,
  "to_currency" varchar(10) NOT NULL,
  "rate" numeric(18,6) NOT NULL DEFAULT 0,
  "previous_rate" numeric(18,6) NOT NULL DEFAULT 0,
  "effective_date" date NULL,
  "source" varchar(100) NULL,
  "type" varchar(20) NOT NULL DEFAULT 'spot',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_exchange_rates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_exchange_rates_company" ON "finance_exchange_rates" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_recurring_transactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "type" varchar(50) NULL,
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "frequency" varchar(50) NOT NULL DEFAULT 'monthly',
  "next_run_date" date NULL,
  "end_date" date NULL,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "account_name" varchar(255) NULL,
  "party_name" varchar(255) NULL,
  "occurrences_generated" integer NOT NULL DEFAULT 0,
  "description" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_recurring_transactions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_recurring_txn_company" ON "finance_recurring_transactions" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_approval_workflows" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "document_type" varchar(100) NULL,
  "description" text NULL,
  "min_amount" numeric(15,2) NOT NULL DEFAULT 0,
  "max_amount" numeric(15,2) NULL,
  "steps" jsonb NULL,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_approval_workflows" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_approval_wf_company" ON "finance_approval_workflows" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_alerts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "severity" varchar(50) NOT NULL DEFAULT 'medium',
  "condition_type" varchar(100) NULL,
  "threshold_value" numeric(15,2) NULL,
  "message" text NULL,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "is_enabled" boolean NOT NULL DEFAULT true,
  "last_triggered_at" timestamp NULL,
  "trigger_count" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_alerts" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_alerts_company" ON "finance_alerts" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "document_type" varchar(100) NULL,
  "reference_number" varchar(100) NULL,
  "file_url" text NULL,
  "file_size" varchar(50) NULL,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "uploaded_by" varchar(100) NULL,
  "tags" jsonb NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_documents" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_documents_company" ON "finance_documents" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_audit_trail" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "entity_type" varchar(100) NULL,
  "entity_id" varchar(100) NULL,
  "action" varchar(100) NULL,
  "performed_by" varchar(100) NULL,
  "description" varchar(255) NULL,
  "ip_address" varchar(50) NULL,
  "changes" jsonb NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_audit_trail" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_audit_trail_company" ON "finance_audit_trail" ("company_id", "created_at");

CREATE TABLE IF NOT EXISTS "finance_credit_limits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "customer_id" varchar(100) NULL,
  "customer_name" varchar(255) NOT NULL,
  "credit_limit" numeric(15,2) NOT NULL DEFAULT 0,
  "credit_used" numeric(15,2) NOT NULL DEFAULT 0,
  "payment_terms" varchar(100) NULL,
  "credit_rating" varchar(20) NULL,
  "risk_category" varchar(50) NOT NULL DEFAULT 'low',
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "on_hold" boolean NOT NULL DEFAULT false,
  "review_date" date NULL,
  "notes" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_credit_limits" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_credit_limits_company" ON "finance_credit_limits" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_investments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "investment_type" varchar(100) NULL,
  "principal_amount" numeric(15,2) NOT NULL DEFAULT 0,
  "current_value" numeric(15,2) NOT NULL DEFAULT 0,
  "interest_rate" numeric(8,4) NOT NULL DEFAULT 0,
  "start_date" date NULL,
  "maturity_date" date NULL,
  "institution" varchar(100) NULL,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "notes" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_investments" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_investments_company" ON "finance_investments" ("company_id");

CREATE TABLE IF NOT EXISTS "finance_report_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "description" text NULL,
  "report_type" varchar(100) NULL,
  "columns" jsonb NULL,
  "filters" jsonb NULL,
  "group_by" varchar(255) NULL,
  "is_shared" boolean NOT NULL DEFAULT false,
  "created_by" varchar(100) NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_report_templates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_report_templates_company" ON "finance_report_templates" ("company_id");

-- ============================================================================
-- Finance integrations (external system configs / status) — /finance/integrations
-- Additive & idempotent.
-- ============================================================================
CREATE TABLE IF NOT EXISTS "finance_integrations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar(100) NOT NULL DEFAULT 'default-company-id',
  "name" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'custom',
  "provider" varchar(255) NULL,
  "status" varchar(50) NOT NULL DEFAULT 'inactive',
  "connection_type" varchar(50) NOT NULL DEFAULT 'api',
  "frequency" varchar(50) NOT NULL DEFAULT 'manual',
  "last_sync" timestamp NULL,
  "next_sync" timestamp NULL,
  "data_flow" varchar(20) NOT NULL DEFAULT 'inbound',
  "version" varchar(50) NULL,
  "endpoint" varchar(500) NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_integrations" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_finance_integrations_company" ON "finance_integrations" ("company_id");

-- Seed a couple of rows idempotently so the page renders with data.
INSERT INTO "finance_integrations" ("id", "name", "type", "provider", "status", "connection_type", "frequency", "last_sync", "data_flow", "version", "endpoint")
SELECT gen_random_uuid(), 'SAP Integration', 'erp', 'SAP S/4HANA', 'active', 'api', 'realtime', now(), 'bidirectional', '2.3.1', 'https://api.sap.com/v2'
WHERE NOT EXISTS (SELECT 1 FROM "finance_integrations" WHERE "name" = 'SAP Integration');

INSERT INTO "finance_integrations" ("id", "name", "type", "provider", "status", "connection_type", "frequency", "last_sync", "data_flow", "version", "endpoint")
SELECT gen_random_uuid(), 'Stripe Payments', 'payment', 'Stripe', 'active', 'webhook', 'realtime', now(), 'inbound', '3.0.0', 'https://api.stripe.com/v1'
WHERE NOT EXISTS (SELECT 1 FROM "finance_integrations" WHERE "name" = 'Stripe Payments');

INSERT INTO "finance_integrations" ("id", "name", "type", "provider", "status", "connection_type", "frequency", "last_sync", "data_flow", "version", "endpoint")
SELECT gen_random_uuid(), 'QuickBooks Online', 'accounting', 'Intuit', 'active', 'api', 'hourly', now(), 'bidirectional', '4.2.0', 'https://api.quickbooks.com/v3'
WHERE NOT EXISTS (SELECT 1 FROM "finance_integrations" WHERE "name" = 'QuickBooks Online');

-- ============================================================================
-- Seed rows so the multi-currency, credit and investments pages render data.
-- All idempotent (guarded by NOT EXISTS) and scoped to the default company so
-- the FinanceExtrasService company_id filter returns them.
-- ============================================================================

-- Exchange rates (finance/exchange-rates -> /finance/multi-currency)
INSERT INTO "finance_exchange_rates" ("id", "company_id", "from_currency", "to_currency", "rate", "previous_rate", "effective_date", "source", "type", "is_active")
SELECT gen_random_uuid(), 'default-company-id', 'USD', 'INR', 83.250000, 83.100000, CURRENT_DATE, 'RBI Reference', 'spot', true
WHERE NOT EXISTS (SELECT 1 FROM "finance_exchange_rates" WHERE "from_currency" = 'USD' AND "to_currency" = 'INR');

INSERT INTO "finance_exchange_rates" ("id", "company_id", "from_currency", "to_currency", "rate", "previous_rate", "effective_date", "source", "type", "is_active")
SELECT gen_random_uuid(), 'default-company-id', 'EUR', 'INR', 90.400000, 90.150000, CURRENT_DATE, 'RBI Reference', 'spot', true
WHERE NOT EXISTS (SELECT 1 FROM "finance_exchange_rates" WHERE "from_currency" = 'EUR' AND "to_currency" = 'INR');

INSERT INTO "finance_exchange_rates" ("id", "company_id", "from_currency", "to_currency", "rate", "previous_rate", "effective_date", "source", "type", "is_active")
SELECT gen_random_uuid(), 'default-company-id', 'GBP', 'INR', 105.600000, 105.900000, CURRENT_DATE, 'RBI Reference', 'spot', true
WHERE NOT EXISTS (SELECT 1 FROM "finance_exchange_rates" WHERE "from_currency" = 'GBP' AND "to_currency" = 'INR');

INSERT INTO "finance_exchange_rates" ("id", "company_id", "from_currency", "to_currency", "rate", "previous_rate", "effective_date", "source", "type", "is_active")
SELECT gen_random_uuid(), 'default-company-id', 'AED', 'INR', 22.660000, 22.610000, CURRENT_DATE, 'RBI Reference', 'spot', true
WHERE NOT EXISTS (SELECT 1 FROM "finance_exchange_rates" WHERE "from_currency" = 'AED' AND "to_currency" = 'INR');

-- Credit limits (finance/credit-limits -> /finance/credit)
INSERT INTO "finance_credit_limits" ("id", "company_id", "customer_name", "credit_limit", "credit_used", "payment_terms", "credit_rating", "risk_category", "status", "on_hold", "review_date", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Sterling Hotels Pvt Ltd', 5000000.00, 3200000.00, 'Net 45', 'A', 'low', 'active', false, CURRENT_DATE + INTERVAL '90 days', 'Long-standing hospitality client'
WHERE NOT EXISTS (SELECT 1 FROM "finance_credit_limits" WHERE "customer_name" = 'Sterling Hotels Pvt Ltd');

INSERT INTO "finance_credit_limits" ("id", "company_id", "customer_name", "credit_limit", "credit_used", "payment_terms", "credit_rating", "risk_category", "status", "on_hold", "review_date", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Metro Catering Services', 2500000.00, 2350000.00, 'Net 30', 'B', 'medium', 'active', false, CURRENT_DATE + INTERVAL '60 days', 'Nearing credit ceiling'
WHERE NOT EXISTS (SELECT 1 FROM "finance_credit_limits" WHERE "customer_name" = 'Metro Catering Services');

INSERT INTO "finance_credit_limits" ("id", "company_id", "customer_name", "credit_limit", "credit_used", "payment_terms", "credit_rating", "risk_category", "status", "on_hold", "review_date", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Coastal Resorts Group', 8000000.00, 1200000.00, 'Net 60', 'A', 'low', 'active', false, CURRENT_DATE + INTERVAL '120 days', 'Healthy utilisation'
WHERE NOT EXISTS (SELECT 1 FROM "finance_credit_limits" WHERE "customer_name" = 'Coastal Resorts Group');

INSERT INTO "finance_credit_limits" ("id", "company_id", "customer_name", "credit_limit", "credit_used", "payment_terms", "credit_rating", "risk_category", "status", "on_hold", "review_date", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Urban Kitchen Solutions', 1500000.00, 1500000.00, 'Net 30', 'C', 'high', 'active', true, CURRENT_DATE + INTERVAL '15 days', 'On hold - limit exhausted'
WHERE NOT EXISTS (SELECT 1 FROM "finance_credit_limits" WHERE "customer_name" = 'Urban Kitchen Solutions');

-- Investments (finance/investments -> /finance/investments)
INSERT INTO "finance_investments" ("id", "company_id", "name", "investment_type", "principal_amount", "current_value", "interest_rate", "start_date", "maturity_date", "institution", "status", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'HDFC Fixed Deposit - 2024', 'fixed_deposit', 10000000.00, 10725000.00, 7.2500, CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE + INTERVAL '365 days', 'HDFC Bank', 'active', 'Two-year corporate FD'
WHERE NOT EXISTS (SELECT 1 FROM "finance_investments" WHERE "name" = 'HDFC Fixed Deposit - 2024');

INSERT INTO "finance_investments" ("id", "company_id", "name", "investment_type", "principal_amount", "current_value", "interest_rate", "start_date", "maturity_date", "institution", "status", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'SBI Liquid Mutual Fund', 'mutual_fund', 5000000.00, 5320000.00, 6.4000, CURRENT_DATE - INTERVAL '180 days', NULL, 'SBI Mutual Fund', 'active', 'Short-term liquidity parking'
WHERE NOT EXISTS (SELECT 1 FROM "finance_investments" WHERE "name" = 'SBI Liquid Mutual Fund');

INSERT INTO "finance_investments" ("id", "company_id", "name", "investment_type", "principal_amount", "current_value", "interest_rate", "start_date", "maturity_date", "institution", "status", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Govt of India Treasury Bill', 'treasury_bill', 3000000.00, 3082000.00, 6.9000, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '91 days', 'RBI', 'active', '182-day T-bill'
WHERE NOT EXISTS (SELECT 1 FROM "finance_investments" WHERE "name" = 'Govt of India Treasury Bill');

INSERT INTO "finance_investments" ("id", "company_id", "name", "investment_type", "principal_amount", "current_value", "interest_rate", "start_date", "maturity_date", "institution", "status", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'ICICI Corporate Bond', 'bond', 7500000.00, 7912000.00, 8.1500, CURRENT_DATE - INTERVAL '400 days', CURRENT_DATE + INTERVAL '700 days', 'ICICI Bank', 'active', 'AAA-rated corporate bond'
WHERE NOT EXISTS (SELECT 1 FROM "finance_investments" WHERE "name" = 'ICICI Corporate Bond');

INSERT INTO "finance_investments" ("id", "company_id", "name", "investment_type", "principal_amount", "current_value", "interest_rate", "start_date", "maturity_date", "institution", "status", "notes")
SELECT gen_random_uuid(), 'default-company-id', 'Axis Recurring Deposit', 'recurring_deposit', 2400000.00, 2510000.00, 6.7500, CURRENT_DATE - INTERVAL '240 days', CURRENT_DATE + INTERVAL '120 days', 'Axis Bank', 'matured', 'Matured, awaiting reinvestment'
WHERE NOT EXISTS (SELECT 1 FROM "finance_investments" WHERE "name" = 'Axis Recurring Deposit');
