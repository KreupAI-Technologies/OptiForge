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

CREATE TABLE IF NOT EXISTS "crm_customer_segments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "criteria" text,
  "customerCount" integer NOT NULL DEFAULT 0,
  "totalRevenue" numeric(15,2) NOT NULL DEFAULT 0,
  "avgLifetimeValue" numeric(15,2) NOT NULL DEFAULT 0,
  "growthRate" numeric(8,2) NOT NULL DEFAULT 0,
  "color" varchar NOT NULL DEFAULT 'blue',
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_customer_segments" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_contact_lists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "type" varchar NOT NULL DEFAULT 'static',
  "contactCount" integer NOT NULL DEFAULT 0,
  "criteria" json,
  "tags" text,
  "owner" varchar,
  "status" varchar NOT NULL DEFAULT 'active',
  "isShared" boolean NOT NULL DEFAULT false,
  "lastUsed" varchar,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_contact_lists" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_contact_roles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "category" varchar NOT NULL DEFAULT 'buying',
  "permissions" text,
  "contactCount" integer NOT NULL DEFAULT 0,
  "influenceLevel" integer NOT NULL DEFAULT 0,
  "isDecisionMaker" boolean NOT NULL DEFAULT false,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_contact_roles" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_activity_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "type" varchar NOT NULL DEFAULT 'task',
  "subject" varchar NOT NULL,
  "description" text,
  "status" varchar NOT NULL DEFAULT 'pending',
  "priority" varchar NOT NULL DEFAULT 'medium',
  "relatedTo" varchar,
  "relatedType" varchar,
  "contactName" varchar,
  "assignedTo" varchar,
  "dueDate" TIMESTAMP,
  "scheduledAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "durationMinutes" integer,
  "outcome" varchar,
  "direction" varchar,
  "location" varchar,
  "meetingLink" varchar,
  "tags" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_activity_records" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_pipeline_stage_configs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "pipelineType" varchar NOT NULL DEFAULT 'sales',
  "orderIndex" integer NOT NULL DEFAULT 0,
  "probability" integer NOT NULL DEFAULT 0,
  "color" varchar NOT NULL DEFAULT 'blue',
  "isWon" boolean NOT NULL DEFAULT false,
  "isLost" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_pipeline_stage_configs" PRIMARY KEY ("id")
);
