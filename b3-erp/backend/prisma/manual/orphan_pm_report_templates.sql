-- Additive-only DDL for the project-management report-templates endpoint.
-- Backs the "Create Template" / "Customize" actions on the PM reports page.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_report_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "template_name" varchar,
  "report_type" varchar,
  "description" text,
  "data_points" jsonb,
  "filters" jsonb,
  "charts" jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
