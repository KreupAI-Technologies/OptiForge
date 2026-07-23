-- Additive-only tables backing supplier-facing Supplier Portal transactions:
--   invoices  -> GET/POST /api/v1/procurement/supplier-portal/invoices
--   quotes    -> GET/POST /api/v1/procurement/supplier-portal/quotes
--   catalog   -> GET/POST /api/v1/procurement/supplier-portal/catalog
-- (SupplierPortalInvoice / SupplierPortalQuote / SupplierPortalCatalogItem)
-- Column names are camelCase + quoted to match TypeORM's default naming
-- (no SnakeNamingStrategy is configured in this backend).
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "procurement_supplier_portal_invoices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NOT NULL,
  "supplierName" varchar(255) NOT NULL,
  "invoiceNumber" varchar(100) NOT NULL,
  "poNumber" varchar(100) NULL,
  "invoiceDate" date NULL,
  "dueDate" date NULL,
  "amount" numeric(15,2) NOT NULL DEFAULT 0,
  "currency" varchar(3) NOT NULL DEFAULT 'USD',
  "status" varchar(20) NOT NULL DEFAULT 'submitted',
  "notes" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_supplier_portal_invoices" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_invoices_company_status"
  ON "procurement_supplier_portal_invoices" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_invoices_supplier_created"
  ON "procurement_supplier_portal_invoices" ("supplierId", "createdAt");

CREATE TABLE IF NOT EXISTS "procurement_supplier_portal_quotes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NOT NULL,
  "supplierName" varchar(255) NOT NULL,
  "itemName" varchar(255) NOT NULL,
  "reference" varchar(100) NULL,
  "quantity" numeric(15,2) NOT NULL DEFAULT 0,
  "unitPrice" numeric(15,2) NOT NULL DEFAULT 0,
  "currency" varchar(3) NOT NULL DEFAULT 'USD',
  "leadTimeDays" integer NULL,
  "validUntil" date NULL,
  "status" varchar(20) NOT NULL DEFAULT 'submitted',
  "notes" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_supplier_portal_quotes" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_quotes_company_status"
  ON "procurement_supplier_portal_quotes" ("companyId", "status");
CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_quotes_supplier_created"
  ON "procurement_supplier_portal_quotes" ("supplierId", "createdAt");

CREATE TABLE IF NOT EXISTS "procurement_supplier_portal_catalog_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "supplierId" varchar(100) NOT NULL,
  "supplierName" varchar(255) NOT NULL,
  "sku" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "category" varchar(100) NULL,
  "uom" varchar(50) NULL,
  "unitPrice" numeric(15,2) NOT NULL DEFAULT 0,
  "currency" varchar(3) NOT NULL DEFAULT 'USD',
  "leadTimeDays" integer NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "description" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_procurement_supplier_portal_catalog_items" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_supplier_portal_catalog_company_supplier"
  ON "procurement_supplier_portal_catalog_items" ("companyId", "supplierId");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_supplier_portal_catalog_company_supplier_sku"
  ON "procurement_supplier_portal_catalog_items" ("companyId", "supplierId", "sku");
