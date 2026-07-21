-- Additive-only DDL for the project-management production jobs endpoint.
-- Backs the shop-floor pages (laser/bending/fabrication/welding/buffing/shutter).
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_production_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "project_id" varchar NOT NULL,
  "operation_type" varchar NOT NULL,
  "job_code" varchar,
  "part_name" varchar,
  "material" varchar,
  "thickness" varchar,
  "quantity" int DEFAULT 0,
  "status" varchar DEFAULT 'Pending',
  "extra" jsonb,
  "created_by" varchar,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
