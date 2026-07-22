-- Intercompany transactions between group legal entities.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/intercompany-transaction.entity.ts
-- Backs CRUD @Controller('finance/intercompany-transactions').

CREATE TABLE IF NOT EXISTS "finance_intercompany_transaction" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "entity_from" character varying(255) NOT NULL,
  "entity_to" character varying(255) NOT NULL,
  "transaction_type" character varying(100),
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "currency" character varying(10) NOT NULL DEFAULT 'INR',
  "date" date,
  "status" character varying(30) NOT NULL DEFAULT 'pending',
  "description" text,
  "reference" character varying(100),
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_intercompany_transaction" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_finance_intercompany_status"
  ON "finance_intercompany_transaction" ("status");
