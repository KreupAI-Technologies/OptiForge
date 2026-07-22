-- Cash-book ledger entries (receipts / payments) captured on finance/cash page.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/cash-transaction.entity.ts
-- Backs CRUD @Controller('finance/cash-transactions').

CREATE TABLE IF NOT EXISTS "finance_cash_transaction" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "date" date,
  "type" character varying(20) NOT NULL DEFAULT 'receipt',
  "category" character varying(100),
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "currency" character varying(10) NOT NULL DEFAULT 'INR',
  "description" text,
  "reference" character varying(100),
  "balance" numeric(15,2),
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_cash_transaction" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_finance_cash_transaction_date"
  ON "finance_cash_transaction" ("date");
