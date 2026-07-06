-- Additive-only migration for net-new sales module tables.
-- Safe to re-run: every statement uses CREATE TABLE IF NOT EXISTS.
-- Do NOT drop or alter existing tables.

-- Sales shipping methods (settings/shipping)
CREATE TABLE IF NOT EXISTS "sales_shipping_methods" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "carrier" varchar,
  "type" varchar NOT NULL DEFAULT 'standard',
  "deliveryDays" varchar,
  "baseRate" numeric(15,2) NOT NULL DEFAULT 0,
  "perKgRate" numeric(15,2) NOT NULL DEFAULT 0,
  "minWeight" numeric(15,2) NOT NULL DEFAULT 0,
  "maxWeight" numeric(15,2) NOT NULL DEFAULT 0,
  "freeShippingThreshold" numeric(15,2),
  "zones" jsonb NOT NULL DEFAULT '[]',
  "applicableProducts" jsonb NOT NULL DEFAULT '[]',
  "insuranceIncluded" boolean NOT NULL DEFAULT false,
  "trackingAvailable" boolean NOT NULL DEFAULT true,
  "status" varchar NOT NULL DEFAULT 'active',
  "usageCount" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_shipping_methods" PRIMARY KEY ("id")
);

-- Sales tax rates (settings/tax)
CREATE TABLE IF NOT EXISTS "sales_tax_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "taxType" varchar NOT NULL DEFAULT 'GST',
  "rate" numeric(6,2) NOT NULL DEFAULT 0,
  "cgstRate" numeric(6,2),
  "sgstRate" numeric(6,2),
  "igstRate" numeric(6,2),
  "hsnCode" varchar,
  "sacCode" varchar,
  "category" varchar,
  "applicableProducts" jsonb NOT NULL DEFAULT '[]',
  "description" text,
  "status" varchar NOT NULL DEFAULT 'active',
  "effectiveDate" date,
  "usageCount" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_tax_rates" PRIMARY KEY ("id")
);

-- Sales discounts (pricing/discounts)
CREATE TABLE IF NOT EXISTS "sales_discounts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "code" varchar,
  "name" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'percentage',
  "category" varchar,
  "value" numeric(15,2) NOT NULL DEFAULT 0,
  "minQuantity" integer NOT NULL DEFAULT 0,
  "minOrderValue" numeric(15,2) NOT NULL DEFAULT 0,
  "maxDiscount" numeric(15,2),
  "applicableProducts" jsonb NOT NULL DEFAULT '[]',
  "validFrom" date,
  "validTo" date,
  "status" varchar NOT NULL DEFAULT 'active',
  "usageCount" integer NOT NULL DEFAULT 0,
  "usageLimit" integer,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_discounts" PRIMARY KEY ("id")
);

-- Sales terms & conditions templates (settings/terms)
CREATE TABLE IF NOT EXISTS "sales_terms_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'general',
  "category" varchar,
  "content" text,
  "status" varchar NOT NULL DEFAULT 'active',
  "applicableTo" jsonb NOT NULL DEFAULT '[]',
  "usageCount" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_terms_templates" PRIMARY KEY ("id")
);

-- Sales promotions (pricing/promotions)
CREATE TABLE IF NOT EXISTS "sales_promotions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "code" varchar,
  "type" varchar NOT NULL DEFAULT 'seasonal',
  "description" text,
  "category" varchar,
  "applicableProducts" jsonb NOT NULL DEFAULT '[]',
  "discountType" varchar NOT NULL DEFAULT 'percentage',
  "discountValue" numeric(15,2) NOT NULL DEFAULT 0,
  "startDate" date,
  "endDate" date,
  "status" varchar NOT NULL DEFAULT 'scheduled',
  "targetAudience" varchar,
  "minPurchase" numeric(15,2) NOT NULL DEFAULT 0,
  "maxDiscount" numeric(15,2),
  "claimedCount" integer NOT NULL DEFAULT 0,
  "targetCount" integer NOT NULL DEFAULT 0,
  "revenue" numeric(15,2) NOT NULL DEFAULT 0,
  "bannerImage" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_promotions" PRIMARY KEY ("id")
);

-- Sales special / contract prices (pricing/special)
CREATE TABLE IF NOT EXISTS "sales_special_prices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "customerName" varchar NOT NULL,
  "customerType" varchar NOT NULL DEFAULT 'dealer',
  "productCode" varchar,
  "productName" varchar,
  "category" varchar,
  "standardPrice" numeric(15,2) NOT NULL DEFAULT 0,
  "specialPrice" numeric(15,2) NOT NULL DEFAULT 0,
  "discountPercent" numeric(6,2) NOT NULL DEFAULT 0,
  "minOrderQty" integer NOT NULL DEFAULT 0,
  "validFrom" date,
  "validTo" date,
  "status" varchar NOT NULL DEFAULT 'active',
  "approvedBy" varchar,
  "contractRef" varchar,
  "orderCount" integer NOT NULL DEFAULT 0,
  "totalRevenue" numeric(15,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_special_prices" PRIMARY KEY ("id")
);

-- Sales price list items (pricing/lists)
CREATE TABLE IF NOT EXISTS "sales_price_list_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "productCode" varchar,
  "productName" varchar NOT NULL,
  "category" varchar,
  "basePrice" numeric(15,2) NOT NULL DEFAULT 0,
  "currentPrice" numeric(15,2) NOT NULL DEFAULT 0,
  "unit" varchar NOT NULL DEFAULT 'piece',
  "effectiveFrom" date,
  "priceChange" numeric(15,2) NOT NULL DEFAULT 0,
  "priceChangePercent" numeric(8,2) NOT NULL DEFAULT 0,
  "moq" integer NOT NULL DEFAULT 0,
  "stock" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_price_list_items" PRIMARY KEY ("id")
);

-- Sales targets & goals (analytics/targets)
CREATE TABLE IF NOT EXISTS "sales_targets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'team',
  "period" varchar,
  "target" numeric(18,2) NOT NULL DEFAULT 0,
  "achieved" numeric(18,2) NOT NULL DEFAULT 0,
  "progress" numeric(8,2) NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'on-track',
  "assignedTo" varchar,
  "category" varchar,
  "region" varchar,
  "startDate" date,
  "endDate" date,
  "daysRemaining" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_targets" PRIMARY KEY ("id")
);

-- Sales report library (analytics/reports)
CREATE TABLE IF NOT EXISTS "sales_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'sales',
  "description" text,
  "period" varchar,
  "generatedDate" date,
  "generatedBy" varchar,
  "fileSize" varchar,
  "format" varchar NOT NULL DEFAULT 'PDF',
  "keyMetrics" jsonb NOT NULL DEFAULT '[]',
  "status" varchar NOT NULL DEFAULT 'ready',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_reports" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Sales-to-Project Handover (sales/handover page).
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/sales/entities/handover.entity.ts
CREATE TABLE IF NOT EXISTS "sales_handovers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "handoverNumber" varchar NOT NULL,
  "projectNumber" varchar,
  "projectName" varchar NOT NULL,
  "customer" varchar,
  "salesPerson" varchar,
  "projectManager" varchar,
  "handoverDate" date,
  "status" varchar NOT NULL DEFAULT 'Pending',
  "completionPercentage" integer NOT NULL DEFAULT 0,
  "documentsAttached" integer NOT NULL DEFAULT 0,
  "requiredDocuments" integer NOT NULL DEFAULT 0,
  "clientRequestDate" date,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_handovers" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_sales_handovers_status"
  ON "sales_handovers" ("status");

-- Handover package document checklist (sales/handover/package page).
-- Entity: src/modules/sales/entities/handover-package-document.entity.ts
CREATE TABLE IF NOT EXISTS "sales_handover_package_documents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "projectId" varchar,
  "projectNumber" varchar,
  "projectName" varchar,
  "customer" varchar,
  "name" varchar NOT NULL,
  "type" varchar,
  "status" varchar NOT NULL DEFAULT 'Missing',
  "uploadDate" date,
  "uploadedBy" varchar,
  "content" text,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_handover_package_documents" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_sales_handover_package_documents_project"
  ON "sales_handover_package_documents" ("projectId");

-- ---------------------------------------------------------------------------
-- Sales order / invoice transaction tables (Prisma read-model backing).
-- Back the orders-v2 and invoices endpoints used by:
--   /sales/orders/[id], /sales/orders/create-enhanced,
--   /sales/invoices/[id], /sales/invoices/create
-- Column names quoted to match the Prisma @@map models (camelCase).
-- Additive & idempotent — never drops or alters existing tables.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "sales_orders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "orderNumber" varchar NOT NULL,
  "quotationId" varchar,
  "quotationNumber" varchar,
  "rfpId" varchar,
  "customerId" varchar,
  "customerName" varchar NOT NULL,
  "customerEmail" varchar,
  "customerPhone" varchar,
  "shippingAddress" jsonb,
  "billingAddress" jsonb,
  "orderDate" TIMESTAMP NOT NULL DEFAULT now(),
  "requestedDeliveryDate" TIMESTAMP,
  "promisedDeliveryDate" TIMESTAMP,
  "orderType" varchar NOT NULL DEFAULT 'standard',
  "priority" varchar NOT NULL DEFAULT 'normal',
  "currency" varchar NOT NULL DEFAULT 'INR',
  "exchangeRate" double precision NOT NULL DEFAULT 1,
  "subtotal" double precision NOT NULL DEFAULT 0,
  "discountType" varchar,
  "discountValue" double precision NOT NULL DEFAULT 0,
  "discountAmount" double precision NOT NULL DEFAULT 0,
  "taxAmount" double precision NOT NULL DEFAULT 0,
  "shippingAmount" double precision NOT NULL DEFAULT 0,
  "totalAmount" double precision NOT NULL DEFAULT 0,
  "paymentTerms" varchar,
  "paymentStatus" varchar NOT NULL DEFAULT 'pending',
  "paidAmount" double precision NOT NULL DEFAULT 0,
  "balanceAmount" double precision NOT NULL DEFAULT 0,
  "deliveryTerms" varchar,
  "shippingMethod" varchar,
  "carrier" varchar,
  "trackingNumber" varchar,
  "status" varchar NOT NULL DEFAULT 'draft',
  "confirmedAt" TIMESTAMP,
  "confirmedBy" varchar,
  "approvedAt" TIMESTAMP,
  "approvedBy" varchar,
  "shippedAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "cancelledAt" TIMESTAMP,
  "cancellationReason" varchar,
  "handoverStatus" varchar,
  "handoverDate" TIMESTAMP,
  "handoverPackage" jsonb,
  "notes" varchar,
  "internalNotes" varchar,
  "poNumber" varchar,
  "termsAndConditions" varchar,
  "attachments" jsonb,
  "salesPersonId" varchar,
  "salesPersonName" varchar,
  "companyId" varchar NOT NULL,
  "createdBy" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_orders" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_sales_orders_number_company" UNIQUE ("orderNumber", "companyId")
);

CREATE TABLE IF NOT EXISTS "sales_order_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "orderId" uuid NOT NULL,
  "lineNumber" integer NOT NULL,
  "itemId" varchar,
  "itemCode" varchar,
  "itemName" varchar NOT NULL,
  "description" varchar,
  "quantity" double precision NOT NULL,
  "uom" varchar,
  "deliveredQuantity" double precision NOT NULL DEFAULT 0,
  "pendingQuantity" double precision NOT NULL DEFAULT 0,
  "returnedQuantity" double precision NOT NULL DEFAULT 0,
  "unitPrice" double precision NOT NULL,
  "discountPercent" double precision NOT NULL DEFAULT 0,
  "discountAmount" double precision NOT NULL DEFAULT 0,
  "taxRate" double precision NOT NULL DEFAULT 0,
  "taxAmount" double precision NOT NULL DEFAULT 0,
  "lineTotal" double precision NOT NULL,
  "requestedDate" TIMESTAMP,
  "promisedDate" TIMESTAMP,
  "productionStatus" varchar,
  "productionOrderId" varchar,
  "warehouseId" varchar,
  "locationId" varchar,
  "notes" varchar,
  "specifications" jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_order_items" PRIMARY KEY ("id"),
  CONSTRAINT "FK_sales_order_items_order" FOREIGN KEY ("orderId")
    REFERENCES "sales_orders" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_sales_order_items_order"
  ON "sales_order_items" ("orderId");

CREATE TABLE IF NOT EXISTS "sales_invoices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "invoiceNumber" varchar NOT NULL,
  "invoiceType" varchar NOT NULL DEFAULT 'sales',
  "orderId" uuid,
  "orderNumber" varchar,
  "deliveryNoteId" varchar,
  "deliveryNoteNumber" varchar,
  "customerId" varchar,
  "customerName" varchar NOT NULL,
  "customerEmail" varchar,
  "customerAddress" varchar,
  "vendorId" varchar,
  "vendorName" varchar,
  "invoiceDate" TIMESTAMP NOT NULL DEFAULT now(),
  "dueDate" TIMESTAMP NOT NULL,
  "paymentTerms" varchar NOT NULL DEFAULT 'NET_30',
  "currency" varchar NOT NULL DEFAULT 'INR',
  "exchangeRate" double precision NOT NULL DEFAULT 1,
  "subtotal" double precision NOT NULL DEFAULT 0,
  "totalDiscount" double precision NOT NULL DEFAULT 0,
  "totalTax" double precision NOT NULL DEFAULT 0,
  "shippingAmount" double precision NOT NULL DEFAULT 0,
  "totalAmount" double precision NOT NULL,
  "amountPaid" double precision NOT NULL DEFAULT 0,
  "amountDue" double precision NOT NULL,
  "status" varchar NOT NULL DEFAULT 'draft',
  "submittedAt" TIMESTAMP,
  "submittedBy" varchar,
  "approvedAt" TIMESTAMP,
  "approvedBy" varchar,
  "postedAt" TIMESTAMP,
  "postedBy" varchar,
  "paidAt" TIMESTAMP,
  "voidedAt" TIMESTAMP,
  "voidReason" varchar,
  "notes" varchar,
  "terms" varchar,
  "reference" varchar,
  "poNumber" varchar,
  "glPosted" boolean NOT NULL DEFAULT false,
  "glPostingDate" TIMESTAMP,
  "journalEntryId" varchar,
  "companyId" varchar NOT NULL,
  "createdBy" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_invoices" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_sales_invoices_number_company" UNIQUE ("invoiceNumber", "companyId")
);

CREATE INDEX IF NOT EXISTS "IDX_sales_invoices_order"
  ON "sales_invoices" ("orderId");

CREATE TABLE IF NOT EXISTS "sales_invoice_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "invoiceId" uuid NOT NULL,
  "lineNumber" integer NOT NULL,
  "productId" varchar,
  "productCode" varchar,
  "productName" varchar NOT NULL,
  "description" varchar,
  "quantity" double precision NOT NULL,
  "uom" varchar,
  "unitPrice" double precision NOT NULL,
  "discountPercent" double precision NOT NULL DEFAULT 0,
  "discountAmount" double precision NOT NULL DEFAULT 0,
  "taxRate" double precision NOT NULL DEFAULT 0,
  "taxAmount" double precision NOT NULL DEFAULT 0,
  "lineTotal" double precision NOT NULL,
  "accountId" varchar,
  "costCenterId" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_sales_invoice_items" PRIMARY KEY ("id"),
  CONSTRAINT "FK_sales_invoice_items_invoice" FOREIGN KEY ("invoiceId")
    REFERENCES "sales_invoices" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_sales_invoice_items_invoice"
  ON "sales_invoice_items" ("invoiceId");

CREATE TABLE IF NOT EXISTS "invoice_payments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "paymentNumber" varchar NOT NULL,
  "invoiceId" uuid NOT NULL,
  "paymentDate" TIMESTAMP NOT NULL DEFAULT now(),
  "amount" double precision NOT NULL,
  "paymentMethod" varchar NOT NULL,
  "referenceNumber" varchar,
  "chequeNumber" varchar,
  "bankName" varchar,
  "transactionId" varchar,
  "status" varchar NOT NULL DEFAULT 'completed',
  "notes" varchar,
  "companyId" varchar NOT NULL,
  "createdBy" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_invoice_payments" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_invoice_payments_number_company" UNIQUE ("paymentNumber", "companyId"),
  CONSTRAINT "FK_invoice_payments_invoice" FOREIGN KEY ("invoiceId")
    REFERENCES "sales_invoices" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_invoice_payments_invoice"
  ON "invoice_payments" ("invoiceId");
