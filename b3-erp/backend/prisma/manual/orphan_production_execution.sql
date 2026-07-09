-- Orphan production-execution tables (ADDITIVE ONLY).
-- Net-new tables backing production-execution [BE] work (BOM templates,
-- shop-floor material pull requests, shop-floor attendance/shift records).
-- Safe to run repeatedly: every statement is CREATE TABLE IF NOT EXISTS.
-- Do NOT drop or alter any existing table.

-- Assembly / BOM templates (backs /production/bom/add "Assembly templates")
CREATE TABLE IF NOT EXISTS "production_bom_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "category" varchar NULL,
  "description" text NULL,
  "bom_type" varchar(30) NOT NULL DEFAULT 'manufacturing',
  "uom" varchar(20) NOT NULL DEFAULT 'PCS',
  "components" jsonb NULL,
  "component_count" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_by" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Shop-floor material pull requests (backs /production/shopfloor material request)
CREATE TABLE IF NOT EXISTS "production_shopfloor_material_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_number" varchar NULL,
  "work_order_id" varchar NULL,
  "work_order_number" varchar NULL,
  "work_center_id" varchar NULL,
  "work_center_name" varchar NULL,
  "operator_id" varchar NULL,
  "operator_name" varchar NULL,
  "item_code" varchar NULL,
  "item_name" varchar NULL,
  "quantity" numeric(15,4) NOT NULL DEFAULT 0,
  "uom" varchar(20) NOT NULL DEFAULT 'PCS',
  "urgency" varchar(20) NOT NULL DEFAULT 'normal',
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "notes" text NULL,
  "requested_at" varchar NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Shop-floor attendance / shift records (backs /production/shopfloor End Shift)
CREATE TABLE IF NOT EXISTS "production_shopfloor_attendance" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "operator_id" varchar NULL,
  "operator_name" varchar NULL,
  "employee_code" varchar NULL,
  "work_center_id" varchar NULL,
  "work_center_name" varchar NULL,
  "shift" varchar NULL,
  "shift_date" varchar NULL,
  "clock_in" timestamptz NULL,
  "clock_out" timestamptz NULL,
  "total_produced" numeric(15,4) NOT NULL DEFAULT 0,
  "total_rejected" numeric(15,4) NOT NULL DEFAULT 0,
  "total_rework" numeric(15,4) NOT NULL DEFAULT 0,
  "downtime_minutes" integer NOT NULL DEFAULT 0,
  "status" varchar(20) NOT NULL DEFAULT 'open',
  "notes" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
