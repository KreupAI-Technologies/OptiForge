-- Additive-only tables for common-masters orphan pages.
-- Safe to run repeatedly. Never drops or alters existing tables.
--
-- Column names are quoted to match the Prisma @map models (camelCase),
-- which is how the common-masters service reads/writes these tables.

-- ---------------------------------------------------------------------------
-- Geographic masters (Country / State / City) — backing tables for the
-- already-existing countries / states / cities endpoints and the
-- state-master / city-master pages.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "core_countries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL,
  "name" varchar NOT NULL,
  "phoneCode" varchar,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_countries" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_countries_code" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "core_states" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "countryId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_states" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "core_cities" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "stateId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_cities" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Territory master — backing table for the already-existing territories
-- endpoints and the territory-master page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "core_territories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL,
  "name" varchar NOT NULL,
  "companyId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_territories" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_territories_code_company" UNIQUE ("code", "companyId")
);

-- ---------------------------------------------------------------------------
-- Item category / group masters — backing tables for the already-existing
-- item-categories / item-groups endpoints and the item-group-master page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "core_item_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "companyId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_item_categories" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_item_categories_name_company" UNIQUE ("name", "companyId")
);

CREATE TABLE IF NOT EXISTS "core_item_groups" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar NOT NULL,
  "categoryId" uuid NOT NULL,
  "companyId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_item_groups" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_item_groups_name_company" UNIQUE ("name", "companyId")
);

-- ---------------------------------------------------------------------------
-- HR Grade master — NET-NEW table for the grade-master page (salary grades,
-- benefits, leave entitlement, etc.). Distinct from mfg_kitchen_material_grades.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "core_hr_grades" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "gradeCode" varchar NOT NULL,
  "gradeName" varchar NOT NULL,
  "level" integer NOT NULL DEFAULT 1,
  "category" varchar NOT NULL DEFAULT 'staff',
  "minSalary" double precision NOT NULL DEFAULT 0,
  "maxSalary" double precision NOT NULL DEFAULT 0,
  "currency" varchar NOT NULL DEFAULT 'INR',
  "benefits" jsonb,
  "leaveEntitlement" jsonb,
  "perks" text[] NOT NULL DEFAULT '{}',
  "probationPeriod" integer NOT NULL DEFAULT 0,
  "noticePeriod" integer NOT NULL DEFAULT 0,
  "appraisalCycle" varchar NOT NULL DEFAULT 'annual',
  "eligibleDesignations" text[] NOT NULL DEFAULT '{}',
  "description" text,
  "companyId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_hr_grades" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_hr_grades_code_company" UNIQUE ("gradeCode", "companyId")
);

-- ---------------------------------------------------------------------------
-- Location master (physical/geographic location hierarchy) — backs the
-- location-master page and /common-masters/locations endpoints.
-- JSON columns hold the nested address/coordinates/contact/operational/
-- logistics/compliance structures used by the LocationMaster component.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "core_locations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL,
  "name" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'Site',
  "parentId" uuid,
  "address" jsonb,
  "coordinates" jsonb,
  "contact" jsonb,
  "operational" jsonb,
  "logistics" jsonb,
  "compliance" jsonb,
  "facilities" text[] NOT NULL DEFAULT '{}',
  "restrictions" text[] NOT NULL DEFAULT '{}',
  "status" varchar NOT NULL DEFAULT 'Active',
  "companyId" uuid NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_core_locations" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_core_locations_code_company" UNIQUE ("code", "companyId")
);

-- Barcode master enrichment: optional type/description columns for the
-- barcode-master page. ALTER is additive and idempotent.
ALTER TABLE IF EXISTS "core_barcodes" ADD COLUMN IF NOT EXISTS "barcodeType" varchar;
ALTER TABLE IF EXISTS "core_barcodes" ADD COLUMN IF NOT EXISTS "description" varchar;
