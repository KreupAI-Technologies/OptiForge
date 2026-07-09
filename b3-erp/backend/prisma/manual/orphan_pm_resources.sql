-- Additive-only DDL for project-management resource endpoints
-- (resource requests + resource skills).
-- Safe to run repeatedly; never drops or alters existing tables.

-- Pending resource requests (approved later into project_resources allocations).
CREATE TABLE IF NOT EXISTS "pm_resource_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "resource_type" varchar,
  "skills_required" text,
  "quantity" int NOT NULL DEFAULT 1,
  "start_date" varchar,
  "end_date" varchar,
  "allocation_percentage" int NOT NULL DEFAULT 100,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "justification" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "requested_by" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Skills recorded per resource (one row per resource; skills stored as JSON array).
CREATE TABLE IF NOT EXISTS "pm_resource_skills" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "resource_id" varchar NOT NULL,
  "resource_name" varchar,
  "skills" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_pm_resource_skills_resource" UNIQUE ("resource_id")
);
