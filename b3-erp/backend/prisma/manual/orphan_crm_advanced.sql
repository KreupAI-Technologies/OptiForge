-- Additive-only DDL for CRM advanced-features endpoints.
-- Safe to run repeatedly. Never drops or alters existing tables.

-- Typed (non-hierarchy) relationships between accounts, e.g. partner / competitor.
CREATE TABLE IF NOT EXISTS "crm_account_relationships" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "sourceAccountId" varchar NOT NULL,
  "targetAccountId" varchar NOT NULL,
  "targetAccountName" varchar,
  "relationshipType" varchar NOT NULL DEFAULT 'partner',
  "bidirectional" boolean NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_account_relationships" PRIMARY KEY ("id")
);

-- Per-user "likes" on activity records (one row per activity+user; toggle = insert/delete).
CREATE TABLE IF NOT EXISTS "crm_activity_likes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "activityId" varchar NOT NULL,
  "userId" varchar NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_crm_activity_likes" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_crm_activity_like_activity_user" UNIQUE ("activityId", "userId")
);

-- Cached like counter on the activity record.
ALTER TABLE "crm_activity_records"
  ADD COLUMN IF NOT EXISTS "like_count" integer NOT NULL DEFAULT 0;
