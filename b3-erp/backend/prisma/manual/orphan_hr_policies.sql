-- Net-new HR Policies table.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Backs GET/POST/PUT/DELETE + POST/:id/publish under /hr/policies.
-- Entity: src/modules/hr/entities/hr-policy.entity.ts
-- Column names quoted to match the TypeORM entity column names exactly.

CREATE TABLE IF NOT EXISTS "hr_policies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "title" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'other',
  "version" varchar NOT NULL DEFAULT '1.0',
  "content" text,
  "fileUrl" varchar,
  "fileName" varchar,
  "summary" text,
  "status" varchar NOT NULL DEFAULT 'draft',
  "effectiveDate" varchar,
  "publishedAt" timestamp without time zone,
  "publishedBy" varchar,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_policies" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_policies_companyId"
  ON "hr_policies" ("companyId");
