-- Additive-only tables for net-new procurement endpoints.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_notifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'info',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "title" varchar(255) NOT NULL,
  "message" text NULL,
  "read" boolean NOT NULL DEFAULT false,
  "action" varchar(255) NULL,
  "actionUrl" varchar(255) NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_notifications" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_notifications_company_read"
  ON "procurement_notifications" ("companyId", "read");

CREATE TABLE IF NOT EXISTS "procurement_budgets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "fiscalYear" varchar(20) NULL,
  "name" varchar(255) NOT NULL,
  "budgetType" varchar(50) NOT NULL DEFAULT 'department',
  "budget" numeric(15,2) NOT NULL DEFAULT 0,
  "spent" numeric(15,2) NOT NULL DEFAULT 0,
  "committed" numeric(15,2) NOT NULL DEFAULT 0,
  "available" numeric(15,2) NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_budgets" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_budgets_company_year"
  ON "procurement_budgets" ("companyId", "fiscalYear");

CREATE TABLE IF NOT EXISTS "procurement_calendar_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'meeting',
  "eventDate" date NOT NULL,
  "time" varchar(50) NULL,
  "vendor" varchar(255) NULL,
  "description" text NULL,
  "location" varchar(255) NULL,
  "items" integer NULL,
  "value" numeric(15,2) NULL,
  "status" varchar(50) NOT NULL DEFAULT 'scheduled',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_calendar_events" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_calendar_events_company_date"
  ON "procurement_calendar_events" ("companyId", "eventDate");

-- ============================================================
-- Follow-up pass: additive tables for orphan mock-only pages
-- (bom-receipt, category-management, savings-tracker, vendor-management scorecards)
-- ADDITIVE ONLY - CREATE TABLE IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS "procurement_bom_receipts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "bomCode" varchar(50) NOT NULL,
  "productName" varchar(255) NOT NULL,
  "submittedBy" varchar(255) NULL,
  "submittedDate" date NULL,
  "status" varchar(50) NOT NULL DEFAULT 'Received',
  "itemsCount" integer NOT NULL DEFAULT 0,
  "totalValue" numeric(15,2) NOT NULL DEFAULT 0,
  "accessoriesCount" integer NOT NULL DEFAULT 0,
  "fittingsCount" integer NOT NULL DEFAULT 0,
  "materialsCount" integer NOT NULL DEFAULT 0,
  "prNumber" varchar(50) NULL,
  "poNumber" varchar(50) NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_bom_receipts" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_bom_receipts_company_status"
  ON "procurement_bom_receipts" ("companyId", "status");

CREATE TABLE IF NOT EXISTS "procurement_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "code" varchar(50) NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "budget" numeric(15,2) NOT NULL DEFAULT 0,
  "spent" numeric(15,2) NOT NULL DEFAULT 0,
  "suppliers" integer NOT NULL DEFAULT 0,
  "items" integer NOT NULL DEFAULT 0,
  "manager" varchar(255) NULL,
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "savingsTarget" numeric(15,2) NOT NULL DEFAULT 0,
  "actualSavings" numeric(15,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_categories" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_categories_company_status"
  ON "procurement_categories" ("companyId", "status");

CREATE TABLE IF NOT EXISTS "procurement_savings_initiatives" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NULL,
  "category" varchar(100) NULL,
  "type" varchar(100) NULL,
  "targetSavings" numeric(15,2) NOT NULL DEFAULT 0,
  "actualSavings" numeric(15,2) NOT NULL DEFAULT 0,
  "owner" varchar(255) NULL,
  "startDate" date NULL,
  "endDate" date NULL,
  "status" varchar(30) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_savings_initiatives" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_savings_initiatives_company_status"
  ON "procurement_savings_initiatives" ("companyId", "status");

CREATE TABLE IF NOT EXISTS "procurement_vendor_scorecards" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "vendorCode" varchar(50) NULL,
  "vendorName" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "overallScore" numeric(5,2) NOT NULL DEFAULT 0,
  "qualityScore" numeric(5,2) NOT NULL DEFAULT 0,
  "deliveryScore" numeric(5,2) NOT NULL DEFAULT 0,
  "costScore" numeric(5,2) NOT NULL DEFAULT 0,
  "serviceScore" numeric(5,2) NOT NULL DEFAULT 0,
  "tier" varchar(30) NULL,
  "riskScore" numeric(5,2) NOT NULL DEFAULT 0,
  "riskLevel" varchar(20) NOT NULL DEFAULT 'low',
  "totalSpend" numeric(15,2) NOT NULL DEFAULT 0,
  "totalOrders" integer NOT NULL DEFAULT 0,
  "lastEvaluated" date NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_vendor_scorecards" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_vendor_scorecards_company_status"
  ON "procurement_vendor_scorecards" ("companyId", "status");
