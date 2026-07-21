-- Additive-only DDL for the project-management MEP drawings endpoint.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_mep_drawings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar NOT NULL,
  "drawing_name" varchar,
  "drawing_number" varchar,
  "discipline" varchar,
  "status" varchar DEFAULT 'Draft',
  "revision" varchar DEFAULT 'R0',
  "file_url" varchar,
  "shared_with" jsonb,
  "notes" text,
  "created_by" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
