-- Drawing verify/reject decisions for the documents/verification page.
-- Additive + idempotent. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS "pm_drawing_verifications" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default',
  "project_id" varchar,
  "drawing_id" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'Verified',
  "notes" text,
  "verified_by" varchar,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_drawing_verifications" PRIMARY KEY ("id")
);
