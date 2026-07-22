-- Additive-only columns for the procurement savings calculator.
-- Safe to run repeatedly. Never drops or alters existing data.

ALTER TABLE "procurement_savings_initiatives"
  ADD COLUMN IF NOT EXISTS "baseline_cost" numeric(15,2) NOT NULL DEFAULT 0;

ALTER TABLE "procurement_savings_initiatives"
  ADD COLUMN IF NOT EXISTS "current_cost" numeric(15,2) NOT NULL DEFAULT 0;

ALTER TABLE "procurement_savings_initiatives"
  ADD COLUMN IF NOT EXISTS "realized_savings" numeric(15,2) NOT NULL DEFAULT 0;

ALTER TABLE "procurement_savings_initiatives"
  ADD COLUMN IF NOT EXISTS "projected_savings" numeric(15,2) NOT NULL DEFAULT 0;
