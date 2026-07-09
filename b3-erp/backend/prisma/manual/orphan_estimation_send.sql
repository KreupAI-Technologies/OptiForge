-- Additive table for the estimation customer-delivery ("send") records.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Records that an estimate was sent to a customer (email/whatsapp). This is a
-- delivery audit record only — no real email/WhatsApp provider is integrated.
-- Backs estimation/workflow/send.
CREATE TABLE IF NOT EXISTS "estimation_send_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "estimateId" character varying NOT NULL,
  "channel" character varying NOT NULL DEFAULT 'email',
  "recipient" character varying,
  "subject" character varying,
  "message" text,
  "includeTerms" boolean NOT NULL DEFAULT false,
  "includePaymentSchedule" boolean NOT NULL DEFAULT false,
  "validityDays" integer,
  "status" character varying NOT NULL DEFAULT 'sent',
  "sentAt" timestamp without time zone,
  "sentBy" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_estimation_send_records" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_estimation_send_records_company_estimate"
  ON "estimation_send_records" ("companyId", "estimateId");
