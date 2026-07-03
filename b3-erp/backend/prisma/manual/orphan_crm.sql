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
