-- Additive-only tables backing the Supplier Portal messages/documents features.
-- Backs GET/POST /api/v1/procurement/supplier-portal/messages
--       GET/POST /api/v1/procurement/supplier-portal/documents
-- (SupplierPortalMessage  -> procurement_supplier_portal_messages)
-- (SupplierPortalDocument -> procurement_supplier_portal_documents)
-- Column names are camelCase + quoted to match TypeORM's default naming
-- (no SnakeNamingStrategy is configured in this backend).
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_supplier_portal_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NOT NULL,
  "supplierName" varchar(255) NOT NULL,
  "type" varchar(30) NOT NULL DEFAULT 'general',
  "subject" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'unread',
  "priority" varchar(10) NOT NULL DEFAULT 'medium',
  "attachments" integer NOT NULL DEFAULT 0,
  "respondedAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_supplier_portal_messages" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_messages_company_status"
  ON "procurement_supplier_portal_messages" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_messages_supplier_created"
  ON "procurement_supplier_portal_messages" ("supplierId", "createdAt");

CREATE TABLE IF NOT EXISTS "procurement_supplier_portal_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NOT NULL,
  "supplierName" varchar(255) NOT NULL,
  "documentType" varchar(255) NOT NULL,
  "fileName" varchar(255) NOT NULL,
  "fileUrl" varchar(500) NULL,
  "size" varchar(50) NULL,
  "expiryDate" date NULL,
  "status" varchar(20) NOT NULL DEFAULT 'valid',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_supplier_portal_documents" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_documents_company_status"
  ON "procurement_supplier_portal_documents" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_documents_supplier_created"
  ON "procurement_supplier_portal_documents" ("supplierId", "createdAt");
