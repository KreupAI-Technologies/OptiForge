-- Adds internal closure rating + feedback capture to handover certificates.
-- ADDITIVE ONLY: never DROP or ALTER existing columns.
-- Entity: src/modules/project-management/entities/handover-certificate.entity.ts
-- Backs POST /api/project-closure/initiate/:projectId with optional { rating, feedback } body.

ALTER TABLE "handover_certificates"
  ADD COLUMN IF NOT EXISTS "closure_rating" integer;

ALTER TABLE "handover_certificates"
  ADD COLUMN IF NOT EXISTS "closure_feedback" text;
