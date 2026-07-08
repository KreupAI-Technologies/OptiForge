-- Additive-only columns for procurement approval workflow endpoints.
-- Safe to run repeatedly. Never drops or alters existing data.
-- Adds delegation + info-request fields to purchase_orders / purchase_requisitions,
-- and invoice-matching fields to goods_receipts.

-- ---------------------------------------------------------------------------
-- Purchase Orders: approval delegation + info request
-- ---------------------------------------------------------------------------
ALTER TABLE "purchase_orders"
  ADD COLUMN IF NOT EXISTS "delegatedTo" varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS "delegatedBy" varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS "delegatedAt" timestamp NULL,
  ADD COLUMN IF NOT EXISTS "delegationNotes" text NULL,
  ADD COLUMN IF NOT EXISTS "infoRequested" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "infoRequestedBy" varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS "infoRequestMessage" text NULL,
  ADD COLUMN IF NOT EXISTS "infoRequestedAt" timestamp NULL;

-- ---------------------------------------------------------------------------
-- Purchase Requisitions: info request
-- ---------------------------------------------------------------------------
ALTER TABLE "purchase_requisitions"
  ADD COLUMN IF NOT EXISTS "infoRequested" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "infoRequestedBy" varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS "infoRequestMessage" text NULL,
  ADD COLUMN IF NOT EXISTS "infoRequestedAt" timestamp NULL;

-- ---------------------------------------------------------------------------
-- Goods Receipts: invoice matching
-- ---------------------------------------------------------------------------
ALTER TABLE "goods_receipts"
  ADD COLUMN IF NOT EXISTS "isInvoiceMatched" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "matchedInvoiceId" varchar NULL,
  ADD COLUMN IF NOT EXISTS "matchedInvoiceNumber" varchar(50) NULL,
  ADD COLUMN IF NOT EXISTS "invoiceMatchedAt" timestamp NULL,
  ADD COLUMN IF NOT EXISTS "invoiceMatchedBy" varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS "invoiceMatchNotes" text NULL;
