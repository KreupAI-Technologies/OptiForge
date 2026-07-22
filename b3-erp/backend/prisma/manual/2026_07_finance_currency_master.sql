-- Currency master records (distinct from exchange rates).
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/currency-master.entity.ts
-- Backs CRUD @Controller('finance/currency-master').

CREATE TABLE IF NOT EXISTS "finance_currency_master" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" character varying(10) NOT NULL,
  "name" character varying(100) NOT NULL,
  "symbol" character varying(10),
  "is_base_currency" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "decimal_places" integer NOT NULL DEFAULT 2,
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_currency_master" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_finance_currency_master_code"
  ON "finance_currency_master" ("code");
