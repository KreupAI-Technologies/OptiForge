-- Additive-only tables for quality orphan pages.
-- Safe to run repeatedly. Never drops or alters existing tables.
--
-- Column names are quoted to match the TypeORM entity property names
-- (camelCase), which is how the quality services read/write these tables.

-- ---------------------------------------------------------------------------
-- Rework Items — backing table for the quality/rework page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "quality_rework_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "reworkCode" varchar(50),
  "defectId" varchar(50),
  "projectId" varchar(50),
  "component" varchar(200) NOT NULL,
  "defectType" varchar(150),
  "priority" varchar(20) NOT NULL DEFAULT 'Medium',
  "assignedTo" varchar(150),
  "status" varchar(30) NOT NULL DEFAULT 'Pending',
  "iterations" integer NOT NULL DEFAULT 0,
  "notes" text,
  "createdBy" varchar(100),
  "updatedBy" varchar(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_quality_rework_items" PRIMARY KEY ("id")
);
