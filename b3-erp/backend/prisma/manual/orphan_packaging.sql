-- Additive-only tables for the project-scoped packaging pages
-- (packaging/materials, packaging/operations, packaging/staging,
--  packaging/shipping-bill). Safe to run repeatedly. Never drops or alters
-- existing tables. Column names quoted to match the raw-SQL controller
-- (camelCase) in src/modules/packaging.

-- ---------------------------------------------------------------------------
-- Packing materials — backing table for packaging/materials.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "packaging_materials" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "projectId" varchar(100),
  "name" varchar(200) NOT NULL,
  "category" varchar(50) NOT NULL DEFAULT 'Protection',
  "currentStock" numeric(12,2) NOT NULL DEFAULT 0,
  "required" numeric(12,2) NOT NULL DEFAULT 0,
  "unit" varchar(30) NOT NULL DEFAULT 'pcs',
  "status" varchar(30) NOT NULL DEFAULT 'Available',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_packaging_materials" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_packaging_materials_projectId"
  ON "packaging_materials" ("projectId");

-- ---------------------------------------------------------------------------
-- Packing jobs — backing table for packaging/operations.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "packaging_jobs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "projectId" varchar(100),
  "woNumber" varchar(100),
  "productName" varchar(200),
  "quantity" integer NOT NULL DEFAULT 0,
  "status" varchar(30) NOT NULL DEFAULT 'In Queue',
  "packingTeam" varchar(150),
  "startDate" date,
  "completionDate" date,
  "materialsUsed" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_packaging_jobs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_packaging_jobs_projectId"
  ON "packaging_jobs" ("projectId");

-- ---------------------------------------------------------------------------
-- Staging items — backing table for packaging/staging.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "packaging_staging" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "projectId" varchar(100),
  "woNumber" varchar(100),
  "productName" varchar(200),
  "quantity" integer NOT NULL DEFAULT 0,
  "packingComplete" boolean NOT NULL DEFAULT false,
  "shippingBillNumber" varchar(100),
  "status" varchar(30) NOT NULL DEFAULT 'Staging',
  "stagedDate" date,
  "customerName" varchar(200),
  "deliveryAddress" text,
  "transportMethod" varchar(50) NOT NULL DEFAULT 'Own Vehicle',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_packaging_staging" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_packaging_staging_projectId"
  ON "packaging_staging" ("projectId");

-- ---------------------------------------------------------------------------
-- Shipping bills — backing table for packaging/shipping-bill.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "packaging_shipping_bills" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "projectId" varchar(100),
  "billNumber" varchar(100) NOT NULL,
  "orderNumber" varchar(100),
  "customerName" varchar(200),
  "destination" varchar(250),
  "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "totalPackages" integer NOT NULL DEFAULT 0,
  "totalWeight" varchar(50),
  "status" varchar(30) NOT NULL DEFAULT 'Draft',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_packaging_shipping_bills" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_packaging_shipping_bills_projectId"
  ON "packaging_shipping_bills" ("projectId");
