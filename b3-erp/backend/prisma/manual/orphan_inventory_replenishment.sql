-- Additive tables for the inventory replenishment pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables. Idempotent.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entities: src/modules/inventory/entities/replenishment.entity.ts

-- Backs /inventory/replenishment/auto (auto-replenishment config CRUD + toggle).
CREATE TABLE IF NOT EXISTS "auto_replenishment_configs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "configName" character varying(255) NOT NULL,
  "description" text,
  "category" character varying(100),
  "itemPattern" character varying(255),
  "enabled" boolean NOT NULL DEFAULT true,
  "schedule" character varying(20) NOT NULL DEFAULT 'daily',
  "autoApprove" boolean NOT NULL DEFAULT false,
  "maxOrderValue" numeric(15,2) NOT NULL DEFAULT 0,
  "notifyUsers" json,
  "lastRun" timestamp without time zone,
  "nextRun" timestamp without time zone,
  "totalRequests" integer NOT NULL DEFAULT 0,
  "successRate" numeric(5,2) NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_auto_replenishment_configs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_auto_replenishment_configs_enabled"
  ON "auto_replenishment_configs" ("enabled");

-- Backs /inventory/replenishment/rules (create + delete reorder rules).
CREATE TABLE IF NOT EXISTS "reorder_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ruleName" character varying(255) NOT NULL,
  "description" text,
  "category" character varying(100),
  "itemFilter" character varying(255),
  "method" character varying(40) NOT NULL DEFAULT 'reorder-point',
  "autoApprove" boolean NOT NULL DEFAULT false,
  "priority" character varying(20) NOT NULL DEFAULT 'medium',
  "supplier" character varying(255),
  "leadTimeDays" integer NOT NULL DEFAULT 0,
  "safetyStockDays" integer NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_reorder_rules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_reorder_rules_is_active"
  ON "reorder_rules" ("isActive");

-- Backs /inventory/replenishment/create (submit replenishment request).
CREATE TABLE IF NOT EXISTS "replenishment_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "requestNumber" character varying(50) NOT NULL,
  "itemCode" character varying(100) NOT NULL,
  "itemName" character varying(255),
  "quantity" numeric(15,4) NOT NULL,
  "uom" character varying(20),
  "priority" character varying(20) NOT NULL DEFAULT 'medium',
  "requestDate" date,
  "requiredBy" date,
  "notes" text,
  "status" character varying(20) NOT NULL DEFAULT 'pending',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_replenishment_requests" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_replenishment_requests_request_number" UNIQUE ("requestNumber")
);

CREATE INDEX IF NOT EXISTS "IDX_replenishment_requests_status"
  ON "replenishment_requests" ("status");

CREATE INDEX IF NOT EXISTS "IDX_replenishment_requests_item_code"
  ON "replenishment_requests" ("itemCode");
