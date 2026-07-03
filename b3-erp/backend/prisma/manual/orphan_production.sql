-- Orphan production tables (ADDITIVE ONLY).
-- Net-new settings/list tables backing previously-mocked production pages.
-- Safe to run repeatedly: every statement is CREATE TABLE IF NOT EXISTS.
-- Do NOT drop or alter any existing table.

-- Routing templates (backs /production/settings/routing)
CREATE TABLE IF NOT EXISTS "production_routing_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "product_code" varchar NULL,
  "product_name" varchar NULL,
  "version" varchar(20) NOT NULL DEFAULT 'v1.0',
  "department" varchar NULL,
  "total_operations" integer NOT NULL DEFAULT 0,
  "total_setup_time" numeric(12,2) NOT NULL DEFAULT 0,
  "total_cycle_time" numeric(12,2) NOT NULL DEFAULT 0,
  "total_cost" numeric(14,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "effective_from" varchar NULL,
  "effective_to" varchar NULL,
  "operations" jsonb NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Production line configs (backs /production/settings/lines)
CREATE TABLE IF NOT EXISTS "production_line_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "department" varchar NULL,
  "location" varchar NULL,
  "line_type" varchar NULL,
  "work_centers" integer NOT NULL DEFAULT 0,
  "operators" integer NOT NULL DEFAULT 0,
  "capacity" numeric(12,2) NOT NULL DEFAULT 0,
  "efficiency" numeric(6,2) NOT NULL DEFAULT 0,
  "utilization" numeric(6,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'operational',
  "shift_schedule" varchar NULL,
  "supervisor" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Shift definitions (backs /production/settings/shifts)
CREATE TABLE IF NOT EXISTS "production_shift_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "shift_type" varchar(20) NOT NULL DEFAULT 'day',
  "start_time" varchar(10) NULL,
  "end_time" varchar(10) NULL,
  "duration" numeric(6,2) NOT NULL DEFAULT 8,
  "break_time" integer NOT NULL DEFAULT 0,
  "working_days" jsonb NULL,
  "effective_from" varchar NULL,
  "effective_to" varchar NULL,
  "assigned_workers" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "allow_overtime_after" numeric(6,2) NOT NULL DEFAULT 8,
  "shift_premium" numeric(8,2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Dies & tools assets (backs /production/dies-tools)
CREATE TABLE IF NOT EXISTS "production_die_tool_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "asset_code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "type" varchar(20) NOT NULL DEFAULT 'Tool',
  "status" varchar(20) NOT NULL DEFAULT 'Available',
  "life_used" integer NOT NULL DEFAULT 0,
  "max_life" integer NOT NULL DEFAULT 0,
  "location" varchar NULL,
  "current_work_order" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Shutter production orders (backs /production/shutters)
CREATE TABLE IF NOT EXISTS "production_shutter_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "wo_number" varchar NULL,
  "product_name" varchar NULL,
  "shutter_type" varchar(20) NOT NULL DEFAULT 'Glass',
  "quantity" integer NOT NULL DEFAULT 0,
  "completed_quantity" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'Pending',
  "assigned_to" varchar NULL,
  "start_date" varchar NULL,
  "target_date" varchar NULL,
  "dimensions" varchar NULL,
  "finish" varchar NULL,
  "notes" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Trial installations (backs /production/trial)
CREATE TABLE IF NOT EXISTS "production_trial_installations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "wo_number" varchar NULL,
  "product_name" varchar NULL,
  "installation_type" varchar(30) NOT NULL DEFAULT 'Other',
  "status" varchar(20) NOT NULL DEFAULT 'Scheduled',
  "scheduled_date" varchar NULL,
  "completion_date" varchar NULL,
  "supervisor" varchar NULL,
  "location" varchar NULL,
  "checklist" jsonb NULL,
  "issues_found" integer NOT NULL DEFAULT 0,
  "approved" boolean NOT NULL DEFAULT false,
  "notes" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Operation tasks (backs /production/operations)
CREATE TABLE IF NOT EXISTS "production_operation_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "wo_number" varchar NULL,
  "product_name" varchar NULL,
  "operation_type" varchar NULL,
  "operator" varchar NULL,
  "machine" varchar NULL,
  "status" varchar(20) NOT NULL DEFAULT 'Queued',
  "start_time" varchar NULL,
  "end_time" varchar NULL,
  "target_quantity" integer NOT NULL DEFAULT 0,
  "completed_quantity" integer NOT NULL DEFAULT 0,
  "notes" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
