-- Evaluation tracking column for procurement_automation_rules.
-- ADDITIVE + IDEMPOTENT: only ADD COLUMN IF NOT EXISTS. Never DROP or ALTER existing data.
-- Backs the @Cron scheduled automation-rule evaluator (procurement.module).
-- Entity: src/modules/procurement/entities/procurement-automation-rule.entity.ts

ALTER TABLE "procurement_automation_rules"
  ADD COLUMN IF NOT EXISTS "last_evaluated_at" timestamp;
