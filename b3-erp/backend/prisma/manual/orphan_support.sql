-- Orphan support module tables (ADDITIVE ONLY)
-- These tables back net-new backend endpoints wired to previously
-- mock-only frontend pages under /support. Never DROP/ALTER existing tables.

-- Backs /support/automation/rules
CREATE TABLE IF NOT EXISTS "support_automation_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "ruleId" varchar,
  "name" varchar NOT NULL,
  "description" text,
  "trigger" json,
  "actions" json,
  "priority" integer NOT NULL DEFAULT 100,
  "active" boolean NOT NULL DEFAULT true,
  "executionCount" integer NOT NULL DEFAULT 0,
  "successRate" numeric(5,2) NOT NULL DEFAULT 0,
  "lastExecuted" timestamp,
  "createdBy" varchar,
  "category" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_automation_rules" PRIMARY KEY ("id")
);

-- Backs /support/knowledge/faqs
CREATE TABLE IF NOT EXISTS "support_faqs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "faqId" varchar,
  "question" text NOT NULL,
  "answer" text,
  "category" varchar,
  "tags" json,
  "views" integer NOT NULL DEFAULT 0,
  "helpful" integer NOT NULL DEFAULT 0,
  "notHelpful" integer NOT NULL DEFAULT 0,
  "author" varchar,
  "featured" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_faqs" PRIMARY KEY ("id")
);
