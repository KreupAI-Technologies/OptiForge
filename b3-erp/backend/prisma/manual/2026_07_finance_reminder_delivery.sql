-- Reminder email delivery columns for finance_payment_reminder.
-- ADDITIVE + IDEMPOTENT: only ADD COLUMN IF NOT EXISTS. Never DROP or ALTER existing data.
-- Backs Bull-queue email delivery (queue 'finance-reminders') + @Cron retry sweep.
-- Entity: src/modules/finance/entities/payment-reminder.entity.ts

ALTER TABLE "finance_payment_reminder"
  ADD COLUMN IF NOT EXISTS "recipient_email" character varying(255);

ALTER TABLE "finance_payment_reminder"
  ADD COLUMN IF NOT EXISTS "subject" character varying(255);

ALTER TABLE "finance_payment_reminder"
  ADD COLUMN IF NOT EXISTS "attempts" integer NOT NULL DEFAULT 0;

-- Speeds up the retry sweep that re-enqueues stuck 'queued'/'failed' reminders.
CREATE INDEX IF NOT EXISTS "IDX_finance_payment_reminder_status"
  ON "finance_payment_reminder" ("status");
