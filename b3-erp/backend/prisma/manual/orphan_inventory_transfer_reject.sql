-- Additive columns backing the stock-transfer "reject" action (distinct from
-- cancel). Used by inventory/transfers/pending: an approver rejects a
-- submitted transfer with an optional reason, and the header records who/when.
-- Also introduces the 'Approved' status value used by the approve action.
-- ADDITIVE ONLY: never DROP or ALTER existing columns.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entity: src/modules/inventory/entities/stock-transfer.entity.ts

ALTER TABLE "stock_transfers"
  ADD COLUMN IF NOT EXISTS "rejectedBy" character varying;

ALTER TABLE "stock_transfers"
  ADD COLUMN IF NOT EXISTS "rejectedByName" character varying(100);

ALTER TABLE "stock_transfers"
  ADD COLUMN IF NOT EXISTS "rejectedAt" timestamp without time zone;

ALTER TABLE "stock_transfers"
  ADD COLUMN IF NOT EXISTS "rejectionReason" text;

-- The status column is a Postgres enum (TransferStatus). Add the 'Approved'
-- label if the type exists and the label is missing. Enum type name follows
-- TypeORM's default naming: "<table>_status_enum".
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'stock_transfers_status_enum'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'stock_transfers_status_enum'
        AND e.enumlabel = 'Approved'
    ) THEN
      ALTER TYPE "stock_transfers_status_enum" ADD VALUE 'Approved';
    END IF;
  END IF;
END
$$;
