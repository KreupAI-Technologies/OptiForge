-- Additive table for HR Certification Tracking.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_certification_tracking` (model CertificationTracking).
-- Entity: src/modules/hr/entities/certification-tracking.entity.ts
-- Backs GET/POST/PUT/DELETE /hr/certifications (+ :id/renew, :id/upload).

CREATE TABLE IF NOT EXISTS "hr_certification_tracking" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "employeeId" character varying,
  "employeeName" character varying,
  "employeeCode" character varying,
  "name" character varying,
  "issuer" character varying,
  "issueDate" character varying,
  "expiryDate" character varying,
  "status" character varying NOT NULL DEFAULT 'active',
  "fileUrl" character varying,
  "renewalHistory" jsonb,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_certification_tracking" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_certification_tracking_companyId"
  ON "hr_certification_tracking" ("companyId");
