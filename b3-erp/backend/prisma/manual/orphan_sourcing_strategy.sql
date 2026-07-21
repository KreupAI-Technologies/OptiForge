-- Additive-only table for the net-new Strategic Sourcing "create" endpoints.
-- Backs POST/GET/PATCH/DELETE /api/v1/procurement/sourcing-strategies
-- (SourcingStrategy entity -> procurement_sourcing_strategies).
-- Column names are camelCase + quoted to match TypeORM's default naming
-- (no SnakeNamingStrategy is configured in this backend).
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_sourcing_strategies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "strategyCode" varchar(50) NULL,
  "name" varchar(255) NOT NULL,
  "description" text NULL,
  "category" varchar(100) NULL,
  "strategyType" varchar(40) NOT NULL DEFAULT 'sourcing_project',
  "status" varchar(30) NOT NULL DEFAULT 'planned',
  "progress" integer NOT NULL DEFAULT 0,
  "targetSavings" numeric(18,2) NOT NULL DEFAULT 0,
  "achievedSavings" numeric(18,2) NOT NULL DEFAULT 0,
  "spendUnderManagement" numeric(18,2) NOT NULL DEFAULT 0,
  "startDate" date NULL,
  "targetDate" date NULL,
  "owner" varchar(255) NULL,
  "details" jsonb NULL,
  "notes" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_sourcing_strategies" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_procurement_sourcing_strategies_company_status"
  ON "procurement_sourcing_strategies" ("companyId", "status");
