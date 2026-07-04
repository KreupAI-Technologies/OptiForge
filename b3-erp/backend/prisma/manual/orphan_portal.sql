-- Additive-only table for the customer-portal documents orphan page.
-- Safe to run repeatedly. Never drops or alters existing tables. Column names
-- are quoted to match the TypeORM entity property names (camelCase), which is
-- how the portal-document service reads this table.
-- NOTE: this file is NOT run automatically — apply manually when ready.

-- ---------------------------------------------------------------------------
-- Portal Documents — backing table for portal/documents page (folders + files).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "portal_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "docType" varchar(50) NOT NULL DEFAULT 'file',
  "customerId" varchar(100),
  "parentId" varchar(100),
  "category" varchar(50),
  "sizeBytes" bigint NOT NULL DEFAULT 0,
  "itemCount" integer NOT NULL DEFAULT 0,
  "downloadUrl" text,
  "meta" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_portal_documents" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_portal_documents_companyId" ON "portal_documents" ("companyId");
