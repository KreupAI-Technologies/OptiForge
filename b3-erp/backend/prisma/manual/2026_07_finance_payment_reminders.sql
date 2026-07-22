-- Payment reminders dispatched against receivables/payables/invoices.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/payment-reminder.entity.ts
-- Backs POST/GET @Controller('finance/reminders').

CREATE TABLE IF NOT EXISTS "finance_payment_reminder" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "target_type" character varying(30) NOT NULL DEFAULT 'receivable',
  "target_id" character varying(100),
  "channel" character varying(20) NOT NULL DEFAULT 'email',
  "message" text,
  "sent_at" timestamp without time zone,
  "status" character varying(30) NOT NULL DEFAULT 'sent',
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_payment_reminder" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_finance_payment_reminder_target"
  ON "finance_payment_reminder" ("target_type", "target_id");
