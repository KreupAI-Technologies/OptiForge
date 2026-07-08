-- Orphan production-planning columns (ADDITIVE ONLY).
-- Backs the production-planning [BE] work: schedule-line publish/optimize,
-- capacity-plan optimize/overtime. Safe to run repeatedly: every clause is
-- ADD COLUMN IF NOT EXISTS. Do NOT drop or alter any existing column/table.
--
-- The bulk purchase-requisition and generate-work-order endpoints reuse the
-- existing "purchase_requisitions" and "work_orders" tables, so they need no
-- schema changes here.

-- Schedule lines: sequence + publish stamp (backs /production/scheduling optimize/publish)
ALTER TABLE "production_schedule_lines"
  ADD COLUMN IF NOT EXISTS "sequence_no" integer,
  ADD COLUMN IF NOT EXISTS "published_at" timestamptz;

-- Capacity plans: optimize + overtime planning columns (backs /production/capacity-planning)
ALTER TABLE "production_capacity_plans"
  ADD COLUMN IF NOT EXISTS "is_optimized" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "optimization_score" numeric(5,2),
  ADD COLUMN IF NOT EXISTS "optimized_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "overtime_plans" jsonb,
  ADD COLUMN IF NOT EXISTS "total_overtime_hours" numeric(12,2) NOT NULL DEFAULT 0;
