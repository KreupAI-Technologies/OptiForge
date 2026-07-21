-- Additive-only DDL for the project-management project-categories endpoint.
-- Backs the "Categories" tab (create/edit category) on the PM project-types page.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_project_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "category_name" varchar,
  "category_code" varchar,
  "description" text,
  "parent_category" varchar,
  "project_types" jsonb,
  "color" varchar,
  "icon" varchar,
  "sort_order" int DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
