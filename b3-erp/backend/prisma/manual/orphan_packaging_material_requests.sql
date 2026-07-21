-- Additive-only DDL for the packaging material requests endpoint.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "packaging_material_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "project_id" varchar,
  "material_id" varchar,
  "material_name" varchar,
  "quantity" numeric(15,2) DEFAULT 0,
  "unit" varchar,
  "required_by" varchar,
  "priority" varchar DEFAULT 'Medium',
  "status" varchar DEFAULT 'Requested',
  "requested_by" varchar,
  "notes" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
