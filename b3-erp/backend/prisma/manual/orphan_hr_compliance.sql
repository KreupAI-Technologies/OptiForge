-- Orphan HR Compliance module tables (ADDITIVE ONLY)
-- These tables back net-new backend endpoints wired to previously
-- "coming soon" sections of the HR Compliance page:
--   * hr/compliance-certificates (Licenses > Certificates)
--   * hr/posh-complaints         (Equal Opportunity > POSH)
--   * hr/remediation-plans       (Audit > Remediation Plans)
-- Never DROP/ALTER existing tables.

-- Backs hr/compliance-certificates
CREATE TABLE IF NOT EXISTS "hr_compliance_certificates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "certificateCode" varchar,
  "certificateName" varchar,
  "certificateType" varchar,
  "issuingAuthority" varchar,
  "certificateNumber" varchar,
  "issueDate" varchar,
  "validFrom" varchar,
  "validTo" varchar,
  "scope" varchar,
  "documentUrl" varchar,
  "description" text,
  "remarks" text,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_compliance_certificates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_compliance_certificates_companyId" ON "hr_compliance_certificates" ("companyId");

-- Backs hr/posh-complaints
CREATE TABLE IF NOT EXISTS "hr_posh_complaints" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "complaintCode" varchar,
  "subject" varchar,
  "description" text,
  "isAnonymous" boolean NOT NULL DEFAULT false,
  "complainantName" varchar,
  "complainantEmployeeId" varchar,
  "complainantDepartment" varchar,
  "respondentName" varchar,
  "respondentEmployeeId" varchar,
  "respondentDepartment" varchar,
  "incidentDate" varchar,
  "filingDate" varchar,
  "severity" varchar NOT NULL DEFAULT 'normal',
  "assignedToName" varchar,
  "icMembersInvolved" varchar,
  "inquiryStartDate" varchar,
  "inquiryCompletionDate" varchar,
  "findings" text,
  "actionTaken" text,
  "remarks" text,
  "status" varchar NOT NULL DEFAULT 'registered',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_posh_complaints" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_posh_complaints_companyId" ON "hr_posh_complaints" ("companyId");

-- Backs hr/remediation-plans
CREATE TABLE IF NOT EXISTS "hr_remediation_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "planCode" varchar,
  "planTitle" varchar,
  "description" text,
  "findingId" varchar,
  "findingCode" varchar,
  "auditName" varchar,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "correctiveAction" text,
  "rootCause" text,
  "responsiblePersonName" varchar,
  "startDate" varchar,
  "targetCompletionDate" varchar,
  "actualCompletionDate" varchar,
  "progressPercent" integer NOT NULL DEFAULT 0,
  "verificationNotes" text,
  "remarks" text,
  "status" varchar NOT NULL DEFAULT 'open',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_remediation_plans" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_remediation_plans_companyId" ON "hr_remediation_plans" ("companyId");
