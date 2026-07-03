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
