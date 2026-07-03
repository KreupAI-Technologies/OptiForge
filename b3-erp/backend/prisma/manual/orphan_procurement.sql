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
