-- Additive-only tables for the compliance module orphan pages
-- (GDPR data-subject requests + regulatory reporting).
-- Safe to run repeatedly. Never drops or alters existing tables.
--
-- Column names are quoted to match the Prisma @map models (snake_case here),
-- which is how the compliance service reads/writes these tables.

-- ---------------------------------------------------------------------------
-- GDPR / Data-Subject Requests (DSR) — backs /compliance/gdpr
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "compliance_data_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default-company-id',
  "reference" varchar NOT NULL,
  "subject_name" varchar NOT NULL,
  "subject_email" varchar,
  "request_type" varchar NOT NULL DEFAULT 'data_export',
  "status" varchar NOT NULL DEFAULT 'pending',
  "received_at" date,
  "deadline_at" date,
  "completed_at" date,
  "notes" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_compliance_data_requests" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Regulatory reports — backs /compliance/reporting
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "compliance_reg_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default-company-id',
  "name" varchar NOT NULL,
  "report_type" varchar NOT NULL DEFAULT 'Internal',
  "status" varchar NOT NULL DEFAULT 'Scheduled',
  "report_date" date,
  "file_size" varchar,
  "file_url" varchar,
  "generated_by" varchar,
  "notes" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_compliance_reg_reports" PRIMARY KEY ("id")
);
