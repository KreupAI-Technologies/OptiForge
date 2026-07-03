-- Additive-only tables for CRM orphan pages.
-- Safe to run repeatedly. Never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "crm_email_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "subject" varchar,
  "category" varchar NOT NULL DEFAULT 'follow-up',
  "description" text,
  "previewText" varchar,
  "content" text,
  "status" varchar NOT NULL DEFAULT 'draft',
  "tags" text,
  "usageCount" integer NOT NULL DEFAULT 0,
  "lastUsed" varchar,
  "createdBy" varchar,
  "openRate" numeric(6,2) NOT NULL DEFAULT 0,
  "clickRate" numeric(6,2) NOT NULL DEFAULT 0,
  "conversionRate" numeric(6,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_email_templates" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_social_integrations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "platform" varchar NOT NULL,
  "accountName" varchar NOT NULL,
  "accountHandle" varchar,
  "connected" boolean NOT NULL DEFAULT false,
  "followers" integer NOT NULL DEFAULT 0,
  "engagement" numeric(6,2) NOT NULL DEFAULT 0,
  "lastSync" varchar,
  "stats" json,
  "config" json,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_social_integrations" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_quote_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "category" varchar NOT NULL DEFAULT 'standard',
  "items" integer NOT NULL DEFAULT 0,
  "estimatedValue" numeric(15,2) NOT NULL DEFAULT 0,
  "validityDays" integer NOT NULL DEFAULT 30,
  "usageCount" integer NOT NULL DEFAULT 0,
  "lastUsed" varchar,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "tags" text,
  "discount" numeric(6,2) NOT NULL DEFAULT 0,
  "includesTax" boolean NOT NULL DEFAULT true,
  "termsPreview" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_quote_templates" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_contract_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "category" varchar NOT NULL DEFAULT 'service',
  "defaultDuration" integer NOT NULL DEFAULT 12,
  "defaultValue" numeric(15,2) NOT NULL DEFAULT 0,
  "billingCycle" varchar NOT NULL DEFAULT 'monthly',
  "autoRenew" boolean NOT NULL DEFAULT false,
  "renewalNoticeDays" integer NOT NULL DEFAULT 30,
  "paymentTerms" varchar,
  "clauses" text,
  "usageCount" integer NOT NULL DEFAULT 0,
  "lastUsed" varchar,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "tags" text,
  "includesSLA" boolean NOT NULL DEFAULT false,
  "includesTermination" boolean NOT NULL DEFAULT false,
  "includesIPRights" boolean NOT NULL DEFAULT false,
  "includesConfidentiality" boolean NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_contract_templates" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_campaign_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'promotional',
  "description" text,
  "subject" varchar,
  "previewText" varchar,
  "thumbnail" varchar,
  "usageCount" integer NOT NULL DEFAULT 0,
  "lastUsed" varchar,
  "isFavorite" boolean NOT NULL DEFAULT false,
  "tags" text,
  "contentPreview" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_campaign_templates" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_sales_teams" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "type" varchar NOT NULL DEFAULT 'sales',
  "manager" varchar,
  "members" integer NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'active',
  "performance" json,
  "territories" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_sales_teams" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_assignment_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "type" varchar NOT NULL DEFAULT 'round_robin',
  "active" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 1,
  "criteria" json,
  "assignees" json,
  "lastRun" varchar,
  "totalAssignments" integer NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_assignment_rules" PRIMARY KEY ("id")
);
