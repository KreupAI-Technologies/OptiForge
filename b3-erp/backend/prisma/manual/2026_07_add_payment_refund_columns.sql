-- Net-new columns + enum values for Payment refund / mark-failed / receipt.
-- ADDITIVE ONLY: never DROP or ALTER existing columns.
-- Backs POST /finance/payments/:id/refund, POST /finance/payments/:id/mark-failed,
-- GET /finance/payments/:id/receipt.
-- Entity: src/modules/finance/entities/payment.entity.ts
-- Column names quoted to match the TypeORM entity column names exactly.

-- New PaymentStatus enum values (TypeORM names the type "payments_status_enum").
ALTER TYPE "payments_status_enum" ADD VALUE IF NOT EXISTS 'Refunded';
ALTER TYPE "payments_status_enum" ADD VALUE IF NOT EXISTS 'Failed';

-- Refund tracking columns.
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "refundAmount" numeric(15,2);

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "refundDate" date;

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "refundReason" character varying;

-- Failure tracking column.
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "failureReason" character varying;
