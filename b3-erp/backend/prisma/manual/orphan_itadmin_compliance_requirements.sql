-- Orphan / additive tables for the it-admin compliance feature.
-- Backs the audit/compliance page "requirements" catalog + generate-report.
-- ADDITIVE ONLY: CREATE TABLE IF NOT EXISTS + INSERT ... ON CONFLICT DO NOTHING,
-- plus an idempotent ADD COLUMN for the license-user renew (validUntil) feature.
-- Column names are quoted to match the TypeORM entity property names (camelCase).
-- Do NOT run automatically; apply manually.

CREATE TABLE IF NOT EXISTS "it_compliance_requirements" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "standard" varchar(100) NOT NULL DEFAULT 'General',
  "requirement" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "status" varchar(50) NOT NULL DEFAULT 'Compliant',
  "severity" varchar(50) NOT NULL DEFAULT 'Medium',
  "compliance" integer NOT NULL DEFAULT 100,
  "lastAssessed" varchar(50),
  "nextReview" varchar(50),
  "owner" varchar(200),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_compliance_requirements" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_compliance_requirements_companyId"
  ON "it_compliance_requirements" ("companyId");

-- Default compliance requirements (companyId NULL = global defaults). The
-- service also seeds these on first boot when the table is empty; this INSERT
-- makes the data available immediately. Fixed UUIDs keep re-runs idempotent.
INSERT INTO "it_compliance_requirements"
  ("id", "companyId", "standard", "requirement", "description", "category", "status", "severity", "compliance", "owner")
VALUES
  ('c0110000-0001-4000-8000-000000000001', NULL, 'GDPR', 'Data Protection',
   'Personal data must be processed lawfully and securely.', 'Data Privacy',
   'Compliant', 'High', 95, 'Data Protection Officer'),
  ('c0110000-0001-4000-8000-000000000002', NULL, 'GDPR', 'Right to Access',
   'Data subjects can request access to their personal data.', 'Data Privacy',
   'Compliant', 'Medium', 90, 'Data Protection Officer'),
  ('c0110000-0001-4000-8000-000000000003', NULL, 'ISO 27001', 'Access Control',
   'Access to information is restricted per policy.', 'Security',
   'Partially Compliant', 'High', 78, 'Security Team'),
  ('c0110000-0001-4000-8000-000000000004', NULL, 'ISO 27001', 'Encryption',
   'Sensitive data is encrypted at rest and in transit.', 'Security',
   'Compliant', 'Critical', 100, 'Security Team'),
  ('c0110000-0001-4000-8000-000000000005', NULL, 'SOC 2', 'Incident Response',
   'Documented incident response procedures are maintained.', 'Operations',
   'Partially Compliant', 'High', 82, 'IT Operations'),
  ('c0110000-0001-4000-8000-000000000006', NULL, 'PCI DSS', 'Payment Security',
   'Cardholder data is protected per PCI DSS controls.', 'Finance',
   'Compliant', 'Critical', 96, 'Finance Security')
ON CONFLICT ("id") DO NOTHING;

-- License-user renew feature: additive column for license validity expiry.
ALTER TABLE "it_license_users"
  ADD COLUMN IF NOT EXISTS "validUntil" varchar(50);
