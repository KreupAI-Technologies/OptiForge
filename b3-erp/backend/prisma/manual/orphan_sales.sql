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
