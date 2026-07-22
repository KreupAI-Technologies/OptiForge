-- Collections touchpoints logged against receivables.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/collection-activity.entity.ts
-- Backs CRUD @Controller('finance/collection-activities').

CREATE TABLE IF NOT EXISTS "finance_collection_activity" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "receivable_id" character varying(100),
  "activity_type" character varying(30) NOT NULL DEFAULT 'note',
  "notes" text,
  "follow_up_date" date,
  "outcome" character varying(100),
  "created_by" character varying(100),
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_collection_activity" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_finance_collection_activity_receivable"
  ON "finance_collection_activity" ("receivable_id");
