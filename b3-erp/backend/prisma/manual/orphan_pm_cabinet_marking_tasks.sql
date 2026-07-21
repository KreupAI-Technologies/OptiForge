-- Additive-only DDL for the Cabinet Marking Tasks persistence vertical.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_cabinet_marking_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "project_id" varchar NOT NULL,
  "project_name" varchar,
  "task_number" varchar,
  "cabinet_type" varchar,
  "zone" varchar,
  "marking_type" varchar,
  "quantity" integer DEFAULT 0,
  "assigned_team" varchar,
  "assigned_to" varchar,
  "status" varchar DEFAULT 'Pending',
  "scheduled_date" varchar,
  "completed_date" varchar,
  "completion_percentage" integer DEFAULT 0,
  "marked_items" integer DEFAULT 0,
  "total_items" integer DEFAULT 0,
  "photos_uploaded" integer DEFAULT 0,
  "report_generated" boolean DEFAULT false,
  "checklist" jsonb,
  "notes" text,
  "created_by" varchar,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_pm_cabinet_marking_tasks_project"
  ON "pm_cabinet_marking_tasks" ("project_id");
