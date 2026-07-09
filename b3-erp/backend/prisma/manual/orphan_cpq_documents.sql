-- Additive tables for CPQ advanced-features "Document Generator" tab:
-- reusable document templates + generated documents (with PDF/Excel/CSV export).
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Document templates — reusable quote/proposal/contract bodies with
-- {{placeholder}} tokens substituted at generation time.
CREATE TABLE IF NOT EXISTS "cpq_document_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "documentType" character varying NOT NULL DEFAULT 'quote',
  "content" text,
  "sections" json,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_document_templates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_document_templates_company"
  ON "cpq_document_templates" ("companyId");

-- Generated documents — one row per document produced from a template; the
-- resolved content is stored so the PDF can be regenerated on demand.
CREATE TABLE IF NOT EXISTS "cpq_generated_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "templateId" uuid,
  "title" character varying NOT NULL,
  "documentType" character varying NOT NULL DEFAULT 'quote',
  "referenceId" character varying,
  "customerName" character varying,
  "content" text,
  "status" character varying NOT NULL DEFAULT 'generated',
  "generatedBy" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_generated_documents" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_generated_documents_company"
  ON "cpq_generated_documents" ("companyId");
