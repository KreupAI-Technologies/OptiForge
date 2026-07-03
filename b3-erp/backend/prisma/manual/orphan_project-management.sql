-- Additive-only DDL for net-new project-management endpoints.
-- Safe to run repeatedly; never drops or alters existing tables.

-- Project Management module settings (one row per company, upsert semantics)
CREATE TABLE IF NOT EXISTS "pm_project_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "default_currency" varchar NOT NULL DEFAULT 'INR',
  "fiscal_year_start" varchar NOT NULL DEFAULT '04-01',
  "default_project_prefix" varchar NOT NULL DEFAULT 'PRJ',
  "auto_numbering" boolean NOT NULL DEFAULT true,
  "document_retention" varchar NOT NULL DEFAULT '7',
  "project_approval_required" boolean NOT NULL DEFAULT true,
  "milestone_approval_required" boolean NOT NULL DEFAULT true,
  "document_approval_required" boolean NOT NULL DEFAULT true,
  "budget_approval_threshold" varchar NOT NULL DEFAULT '5000000',
  "change_order_approval_levels" varchar NOT NULL DEFAULT '2',
  "project_start_notification" boolean NOT NULL DEFAULT true,
  "milestone_complete_notification" boolean NOT NULL DEFAULT true,
  "budget_exceeded_notification" boolean NOT NULL DEFAULT true,
  "schedule_delay_notification" boolean NOT NULL DEFAULT true,
  "email_notifications" boolean NOT NULL DEFAULT true,
  "sms_notifications" boolean NOT NULL DEFAULT false,
  "project_manager_approval" boolean NOT NULL DEFAULT true,
  "department_head_approval" boolean NOT NULL DEFAULT true,
  "finance_approval" boolean NOT NULL DEFAULT true,
  "ceo_approval_threshold" varchar NOT NULL DEFAULT '10000000',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "uq_pm_project_settings_company" UNIQUE ("company_id")
);

-- Reusable project templates
CREATE TABLE IF NOT EXISTS "pm_project_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "template_name" varchar NOT NULL,
  "project_type" varchar,
  "description" text,
  "category" varchar NOT NULL DEFAULT 'Standard',
  "complexity" varchar NOT NULL DEFAULT 'Medium',
  "estimated_duration" varchar,
  "estimated_budget" varchar,
  "phases" jsonb,
  "milestones" integer NOT NULL DEFAULT 0,
  "tasks" integer NOT NULL DEFAULT 0,
  "resources" jsonb,
  "deliverables" jsonb,
  "default_settings" jsonb,
  "tags" jsonb,
  "usage_count" integer NOT NULL DEFAULT 0,
  "last_used" varchar,
  "created_by" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "is_favorite" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Reusable milestone templates
CREATE TABLE IF NOT EXISTS "pm_milestone_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "template_name" varchar NOT NULL,
  "project_type" varchar,
  "description" text,
  "total_milestones" integer NOT NULL DEFAULT 0,
  "estimated_duration" varchar,
  "milestones" jsonb,
  "usage_count" integer NOT NULL DEFAULT 0,
  "last_used" varchar,
  "created_by" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
