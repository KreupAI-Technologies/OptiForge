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

-- Entity: src/modules/inventory/entities/cycle-count-plan.entity.ts
CREATE TABLE IF NOT EXISTS "cycle_count_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "planNumber" character varying(50) NOT NULL,
  "title" character varying(255) NOT NULL,
  "status" character varying NOT NULL DEFAULT 'Scheduled',
  "scheduledDate" date NOT NULL,
  "warehouseId" character varying,
  "warehouseName" character varying(255),
  "locationId" character varying,
  "abcClass" character varying(10),
  "itemGroups" json,
  "remarks" text,
  "assignedTo" character varying,
  "adjustmentId" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cycle_count_plans" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_cycle_count_plans_plan_number" UNIQUE ("planNumber")
);

CREATE INDEX IF NOT EXISTS "IDX_cycle_count_plans_status"
  ON "cycle_count_plans" ("status");

CREATE INDEX IF NOT EXISTS "IDX_cycle_count_plans_scheduled_date"
  ON "cycle_count_plans" ("scheduledDate");

-- Entity: src/modules/inventory/entities/cycle-count-plan.entity.ts (CycleCountItem)
CREATE TABLE IF NOT EXISTS "cycle_count_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "planId" uuid NOT NULL,
  "itemId" character varying NOT NULL,
  "itemCode" character varying(100) NOT NULL,
  "itemName" character varying(255) NOT NULL,
  "systemQuantity" numeric(15,4) NOT NULL DEFAULT 0,
  "actualQuantity" numeric(15,4),
  "countedAt" timestamp without time zone,
  "isCounted" boolean NOT NULL DEFAULT false,
  "remarks" text,
  CONSTRAINT "PK_cycle_count_items" PRIMARY KEY ("id"),
  CONSTRAINT "FK_cycle_count_items_plan" FOREIGN KEY ("planId")
    REFERENCES "cycle_count_plans" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_cycle_count_items_plan_id"
  ON "cycle_count_items" ("planId");

-- ---------------------------------------------------------------------------
-- Inventory policy master (settings/policies page). Additive-only.
-- Column names quoted to match the Prisma @map model (camelCase).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "inv_inventory_policies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "policyCode" character varying(100) NOT NULL,
  "policyName" character varying(255) NOT NULL,
  "policyType" character varying(50) NOT NULL,
  "category" character varying(255),
  "description" text,
  "parameters" jsonb,
  "appliesTo" character varying(255),
  "status" character varying(30) NOT NULL DEFAULT 'active',
  "companyId" character varying NOT NULL DEFAULT 'default-company-id',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_inv_inventory_policies" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_inv_inventory_policies_company"
  ON "inv_inventory_policies" ("companyId");

-- ---------------------------------------------------------------------------
-- Kitting: kit master + kitting orders (assembly/disassembly). Additive-only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "inv_kits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "kitNumber" character varying(100) NOT NULL,
  "kitName" character varying(255) NOT NULL,
  "category" character varying(255),
  "components" jsonb,
  "componentCount" integer NOT NULL DEFAULT 0,
  "outputQuantity" double precision NOT NULL DEFAULT 1,
  "outputUOM" character varying(50),
  "status" character varying(30) NOT NULL DEFAULT 'active',
  "assemblyCount" integer NOT NULL DEFAULT 0,
  "lastAssembled" timestamp without time zone,
  "createdBy" character varying(255),
  "companyId" character varying NOT NULL DEFAULT 'default-company-id',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_inv_kits" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_inv_kits_company" ON "inv_kits" ("companyId");

CREATE TABLE IF NOT EXISTS "inv_kitting_orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "orderNumber" character varying(100) NOT NULL,
  "orderType" character varying(30) NOT NULL DEFAULT 'assembly',
  "orderDate" timestamp without time zone NOT NULL DEFAULT now(),
  "kitNumber" character varying(100),
  "kitName" character varying(255),
  "quantityOrdered" double precision NOT NULL DEFAULT 0,
  "quantityDone" double precision NOT NULL DEFAULT 0,
  "handledBy" character varying(255),
  "warehouse" character varying(255),
  "reason" text,
  "status" character varying(30) NOT NULL DEFAULT 'pending',
  "priority" character varying(30) NOT NULL DEFAULT 'normal',
  "startDate" timestamp without time zone,
  "completionDate" timestamp without time zone,
  "expectedDate" timestamp without time zone,
  "companyId" character varying NOT NULL DEFAULT 'default-company-id',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_inv_kitting_orders" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_inv_kitting_orders_type"
  ON "inv_kitting_orders" ("orderType");
