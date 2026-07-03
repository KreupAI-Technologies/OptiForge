-- Additive tables for orphaned CPQ pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs the CPQ approval-queue pages (contract/quote/discount/legal/executive
-- approvals). Page-specific fields live in the JSON "payload" column.
CREATE TABLE IF NOT EXISTS "cpq_approval_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "category" character varying NOT NULL,
  "reference" character varying,
  "title" character varying,
  "customerName" character varying,
  "value" numeric(15,2),
  "requestedBy" character varying,
  "status" character varying NOT NULL DEFAULT 'pending',
  "priority" character varying NOT NULL DEFAULT 'medium',
  "reason" text,
  "dueDate" timestamp without time zone,
  "payload" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_approval_items" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_approval_items_company_category"
  ON "cpq_approval_items" ("companyId", "category");
