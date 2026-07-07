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

-- ============================================================
-- Follow-up orphan pass (maintenance + quality list features).
-- ADDITIVE ONLY — CREATE TABLE IF NOT EXISTS. Do NOT run automatically.
-- ============================================================

-- Spare parts inventory (backs /production/maintenance/spares)
CREATE TABLE IF NOT EXISTS "production_spare_parts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "part_number" varchar NULL,
  "part_name" varchar NULL,
  "category" varchar(30) NOT NULL DEFAULT 'mechanical',
  "equipment_compatibility" jsonb NULL,
  "quantity_in_stock" integer NOT NULL DEFAULT 0,
  "minimum_stock" integer NOT NULL DEFAULT 0,
  "reorder_point" integer NOT NULL DEFAULT 0,
  "unit" varchar(20) NULL,
  "unit_cost" numeric(14,2) NOT NULL DEFAULT 0,
  "location" varchar NULL,
  "supplier" varchar NULL,
  "lead_time" integer NOT NULL DEFAULT 0,
  "last_purchase_date" varchar NULL,
  "usage_rate" numeric(12,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'adequate',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Preventive maintenance schedule (backs /production/maintenance/preventive)
CREATE TABLE IF NOT EXISTS "production_preventive_maintenance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "equipment_code" varchar NULL,
  "equipment_name" varchar NULL,
  "task_type" varchar(30) NOT NULL DEFAULT 'inspection',
  "frequency" varchar(20) NOT NULL DEFAULT 'monthly',
  "last_completed" varchar NULL,
  "next_due" varchar NULL,
  "estimated_duration" numeric(8,2) NOT NULL DEFAULT 0,
  "assigned_to" varchar NULL,
  "status" varchar(20) NOT NULL DEFAULT 'scheduled',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "checklist_items" integer NOT NULL DEFAULT 0,
  "completed_items" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Maintenance requests (backs /production/maintenance/requests)
CREATE TABLE IF NOT EXISTS "production_maintenance_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_number" varchar NULL,
  "equipment_code" varchar NULL,
  "equipment_name" varchar NULL,
  "location" varchar NULL,
  "request_type" varchar(20) NOT NULL DEFAULT 'breakdown',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "requested_by" varchar NULL,
  "request_date" varchar NULL,
  "description" text NULL,
  "assigned_to" varchar NULL,
  "estimated_cost" numeric(14,2) NOT NULL DEFAULT 0,
  "actual_cost" numeric(14,2) NULL,
  "completion_date" varchar NULL,
  "downtime" numeric(8,2) NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Non-conformance reports (backs /production/quality/ncr)
CREATE TABLE IF NOT EXISTS "production_ncrs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ncr_number" varchar NULL,
  "title" varchar NULL,
  "product_code" varchar NULL,
  "product_name" varchar NULL,
  "work_order" varchar NULL,
  "lot_number" varchar NULL,
  "quantity_affected" integer NOT NULL DEFAULT 0,
  "detected_by" varchar NULL,
  "detected_date" varchar NULL,
  "detected_stage" varchar NULL,
  "severity" varchar(20) NOT NULL DEFAULT 'minor',
  "status" varchar(30) NOT NULL DEFAULT 'open',
  "nonconformance_type" varchar(20) NOT NULL DEFAULT 'visual',
  "description" text NULL,
  "root_cause" text NULL,
  "corrective_action" text NULL,
  "preventive_action" text NULL,
  "assigned_to" varchar NULL,
  "target_close_date" varchar NULL,
  "actual_close_date" varchar NULL,
  "cost_impact" numeric(14,2) NOT NULL DEFAULT 0,
  "customer_impact" boolean NOT NULL DEFAULT false,
  "attachments" jsonb NULL,
  "approved_by" varchar NULL,
  "verified_by" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Quality plans (backs /production/quality/plans)
CREATE TABLE IF NOT EXISTS "production_quality_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "plan_number" varchar NULL,
  "plan_name" varchar NULL,
  "product_code" varchar NULL,
  "product_name" varchar NULL,
  "category" varchar NULL,
  "version" varchar(20) NOT NULL DEFAULT 'v1.0',
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "created_by" varchar NULL,
  "created_date" varchar NULL,
  "last_updated" varchar NULL,
  "approved_by" varchar NULL,
  "approval_date" varchar NULL,
  "inspection_points" jsonb NULL,
  "acceptance_criteria" jsonb NULL,
  "testing_frequency" varchar NULL,
  "sampling_size" integer NOT NULL DEFAULT 0,
  "quality_standard" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Newly-built shopfloor / scheduling / bom-verification tables.
-- ADDITIVE ONLY — CREATE TABLE IF NOT EXISTS. Do NOT run automatically.
-- ============================================================

-- Floor activities (backs /production/floor)
CREATE TABLE IF NOT EXISTS "production_floor_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "activity_id" varchar NULL,
  "work_center" varchar NULL,
  "operator_name" varchar NULL,
  "employee_id" varchar NULL,
  "work_order_id" varchar NULL,
  "product_name" varchar NULL,
  "product_code" varchar NULL,
  "operation" varchar NULL,
  "start_time" varchar NULL,
  "duration_minutes" integer NOT NULL DEFAULT 0,
  "output_qty" integer NOT NULL DEFAULT 0,
  "target_qty" integer NOT NULL DEFAULT 0,
  "efficiency_percent" numeric(6,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "shift" varchar(20) NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- BOM verifications (backs /production/bom/verification)
CREATE TABLE IF NOT EXISTS "production_bom_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bom_code" varchar NULL,
  "product_name" varchar NULL,
  "verification_date" varchar NULL,
  "verified_by" varchar NULL,
  "status" varchar(30) NOT NULL DEFAULT 'Pending',
  "completeness" integer NOT NULL DEFAULT 0,
  "submitted_to_procurement" boolean NOT NULL DEFAULT false,
  "checks" jsonb NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Gantt tasks (backs /production/scheduling/enhanced-gantt)
CREATE TABLE IF NOT EXISTS "production_gantt_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar NULL,
  "start_date" varchar NULL,
  "end_date" varchar NULL,
  "progress" integer NOT NULL DEFAULT 0,
  "status" varchar(30) NOT NULL DEFAULT 'not-started',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "assignee" varchar NULL,
  "group_id" varchar NULL,
  "group_name" varchar NULL,
  "dependencies" jsonb NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Machine timelines (backs /production/shopfloor/machine-timeline)
CREATE TABLE IF NOT EXISTS "production_machine_timelines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "machine_code" varchar NULL,
  "machine_name" varchar NULL,
  "machine_type" varchar NULL,
  "status" varchar(20) NOT NULL DEFAULT 'idle',
  "current_shift" varchar(30) NULL,
  "utilization" integer NOT NULL DEFAULT 0,
  "events" jsonb NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Andon lines (backs /production/shopfloor/andon)
CREATE TABLE IF NOT EXISTS "production_andon_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "line_name" varchar NULL,
  "status" varchar(20) NOT NULL DEFAULT 'running',
  "current_product" varchar NULL,
  "work_order_number" varchar NULL,
  "target" integer NOT NULL DEFAULT 0,
  "actual" integer NOT NULL DEFAULT 0,
  "oee" numeric(6,2) NOT NULL DEFAULT 0,
  "cycle_time" integer NOT NULL DEFAULT 0,
  "operator" varchar NULL,
  "shift" varchar(40) NULL,
  "alerts" jsonb NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Schedule lines (backs /production/scheduling)
CREATE TABLE IF NOT EXISTS "production_schedule_lines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "schedule_code" varchar NULL,
  "work_order_id" varchar NULL,
  "product_name" varchar NULL,
  "product_code" varchar NULL,
  "work_center" varchar NULL,
  "planned_start" varchar NULL,
  "planned_end" varchar NULL,
  "actual_start" varchar NULL,
  "actual_end" varchar NULL,
  "quantity" integer NOT NULL DEFAULT 0,
  "unit" varchar(20) NULL,
  "status" varchar(20) NOT NULL DEFAULT 'scheduled',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "assigned_to" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Production variance analysis (backs /production/analytics/variance)
-- TypeORM entity ProductionVariance -> table "production_variances".
-- Columns are camelCase to match the TypeORM default naming (no snake strategy).
-- Additive & idempotent only.
-- ============================================================================
CREATE TABLE IF NOT EXISTS "production_variances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "category" varchar(20) NOT NULL,
  "workOrder" varchar NULL,
  "product" varchar NULL,
  "subCategory" varchar NULL,
  "plannedValue" numeric(14,2) NOT NULL DEFAULT 0,
  "actualValue" numeric(14,2) NOT NULL DEFAULT 0,
  "variance" numeric(14,2) NOT NULL DEFAULT 0,
  "variancePercent" numeric(8,2) NOT NULL DEFAULT 0,
  "impactCost" numeric(14,2) NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'unfavorable',
  "reason" text NULL,
  "action" text NULL,
  "metrics" jsonb NULL,
  "recordDate" timestamptz NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_production_variances_company_category"
  ON "production_variances" ("companyId", "category");

-- Idempotent seed rows (fixed UUIDs so re-running does not duplicate)
INSERT INTO "production_variances"
  ("id","companyId","category","workOrder","product","subCategory","plannedValue","actualValue","variance","variancePercent","impactCost","status","reason","action","recordDate")
VALUES
  ('a1000000-0000-0000-0000-000000000001','default-company-id','cost','WO-2025-1234','Premium Kitchen Sink - Double Bowl','Material Cost',8500,9200,-700,-8.24,700,'unfavorable','Stainless steel price increase','Negotiate with alternate suppliers', now()),
  ('a1000000-0000-0000-0000-000000000002','default-company-id','cost','WO-2025-1235','Kitchen Faucet - Touchless','Labor Cost',2400,2100,300,12.50,300,'favorable','Improved line efficiency','Sustain via SOP', now()),
  ('a1000000-0000-0000-0000-000000000003','default-company-id','schedule','WO-2025-1240','Modular Cabinet Set',NULL,5,8,-3,-60.00,980,'delayed','Late material delivery','Expedite critical suppliers', now()),
  ('a1000000-0000-0000-0000-000000000004','default-company-id','quantity','WO-2025-1250','Steel Worktop',NULL,1000,940,-60,-6.00,420,'unfavorable','High scrap on forming','Tune press parameters', now()),
  ('a1000000-0000-0000-0000-000000000005','default-company-id','quality','WO-2025-1260','Chimney Hood',NULL,98,95,-3,-3.06,200,'warning','Surface finish defects','Add in-line inspection', now())
ON CONFLICT ("id") DO NOTHING;
