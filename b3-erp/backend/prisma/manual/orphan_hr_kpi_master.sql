-- Additive table for HR KPI Master.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_kpi_master` (model KPIMaster). Column names are
-- quoted to match the TypeORM entity column names exactly.
-- Entity: src/modules/hr/entities/kpi-master.entity.ts
-- Backs GET/POST/PUT/DELETE /hr/kpi-masters.

CREATE TABLE IF NOT EXISTS "hr_kpi_master" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "kpiCode" character varying NOT NULL,
  "kpiName" character varying NOT NULL,
  "description" character varying,
  "category" character varying NOT NULL,
  "kpiType" character varying NOT NULL,
  "measurementUnit" character varying,
  "measurementFrequency" character varying NOT NULL DEFAULT 'monthly',
  "targetType" character varying NOT NULL DEFAULT 'higher_better',
  "defaultTarget" numeric,
  "minValue" numeric,
  "maxValue" numeric,
  "dataSource" character varying,
  "calculationFormula" character varying,
  "linkedMetric" character varying,
  "applicableTo" text[] NOT NULL DEFAULT '{}',
  "applicableDepartments" text[] NOT NULL DEFAULT '{}',
  "applicableDesignations" text[] NOT NULL DEFAULT '{}',
  "companyId" character varying NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_kpi_master" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_kpi_master_companyId"
  ON "hr_kpi_master" ("companyId");
