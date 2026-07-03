-- Additive tables for orphaned CPQ pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs the CPQ approval-queue pages (contract/quote/discount/legal/executive
-- approvals). Page-specific fields live in the JSON "payload" column.
CREATE TABLE IF NOT EXISTS "cpq_approval_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "category" character varying NOT NULL,
  "reference" character varying,
  "title" character varying,
  "customerName" character varying,
  "value" numeric(15,2),
  "requestedBy" character varying,
  "status" character varying NOT NULL DEFAULT 'pending',
  "priority" character varying NOT NULL DEFAULT 'medium',
  "reason" text,
  "dueDate" timestamp without time zone,
  "payload" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_approval_items" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_cpq_approval_items_company_category"
  ON "cpq_approval_items" ("companyId", "category");

-- Product configuration rules — backs cpq/products/rules.
CREATE TABLE IF NOT EXISTS "cpq_config_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "type" character varying NOT NULL DEFAULT 'compatibility',
  "condition" text,
  "action" text,
  "priority" integer NOT NULL DEFAULT 1,
  "status" character varying NOT NULL DEFAULT 'active',
  "affectedProducts" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_config_rules" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_config_rules_company_type"
  ON "cpq_config_rules" ("companyId", "type");

-- Product compatibility matrix — backs cpq/products/compatibility.
CREATE TABLE IF NOT EXISTS "cpq_compatibility_entries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "product1" character varying NOT NULL,
  "product2" character varying NOT NULL,
  "compatible" boolean NOT NULL DEFAULT true,
  "reason" text,
  "severity" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_compatibility_entries" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_compatibility_entries_company"
  ON "cpq_compatibility_entries" ("companyId");

-- Cross-sell opportunity rules — backs cpq/guided-selling/cross-sell.
CREATE TABLE IF NOT EXISTS "cpq_cross_sell_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "primaryProduct" json,
  "suggestedProduct" json,
  "relationship" character varying NOT NULL DEFAULT 'complement',
  "coOccurrenceRate" numeric(6,2) NOT NULL DEFAULT 0,
  "avgAdditionalRevenue" numeric(15,2) NOT NULL DEFAULT 0,
  "conversionRate" numeric(6,2) NOT NULL DEFAULT 0,
  "customersCount" integer NOT NULL DEFAULT 0,
  "totalOpportunityValue" numeric(15,2) NOT NULL DEFAULT 0,
  "recommendationStrength" character varying NOT NULL DEFAULT 'medium',
  "activeCampaigns" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_cross_sell_rules" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_cross_sell_rules_company"
  ON "cpq_cross_sell_rules" ("companyId");

-- AI / rule-based recommendations — backs cpq/guided-selling/recommendations.
CREATE TABLE IF NOT EXISTS "cpq_recommendations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "customerId" character varying,
  "customerName" character varying,
  "segment" character varying,
  "productCode" character varying,
  "productName" character varying,
  "category" character varying,
  "recommendationType" character varying NOT NULL DEFAULT 'best-match',
  "confidenceScore" numeric(6,2) NOT NULL DEFAULT 0,
  "estimatedValue" numeric(15,2) NOT NULL DEFAULT 0,
  "reason" text,
  "basedOn" text,
  "priority" character varying NOT NULL DEFAULT 'medium',
  "aiGenerated" boolean NOT NULL DEFAULT false,
  "acceptanceRate" numeric(6,2) NOT NULL DEFAULT 0,
  "expiresDate" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_recommendations" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_recommendations_company_customer"
  ON "cpq_recommendations" ("companyId", "customerId");

-- Reference code lists (branch/category codes) — backs cpq/settings/numbering.
CREATE TABLE IF NOT EXISTS "cpq_code_lists" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "listType" character varying NOT NULL DEFAULT 'branch',
  "name" character varying NOT NULL,
  "code" character varying NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_code_lists" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_code_lists_company_type"
  ON "cpq_code_lists" ("companyId", "listType");

-- Integration sync logs — backs cpq/integration/crm.
CREATE TABLE IF NOT EXISTS "cpq_integration_sync_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "system" character varying NOT NULL DEFAULT 'crm',
  "operation" character varying,
  "records" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'success',
  "duration" character varying,
  "message" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_integration_sync_logs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_integration_sync_logs_company_system"
  ON "cpq_integration_sync_logs" ("companyId", "system");

-- =====================================================================
-- Second-pass orphan-page tables (additive, CREATE TABLE IF NOT EXISTS).
-- =====================================================================

-- Workflow approval requests — backs cpq/workflow/legal and cpq/workflow/executive.
CREATE TABLE IF NOT EXISTS "cpq_workflow_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "requestType" character varying NOT NULL DEFAULT 'legal',
  "reference" character varying,
  "documentNumber" character varying,
  "customerName" character varying,
  "value" numeric(15,2) NOT NULL DEFAULT 0,
  "requestedBy" character varying,
  "assignedTo" character varying,
  "priority" character varying,
  "status" character varying,
  "requestDate" character varying,
  "dueDate" character varying,
  "payload" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_workflow_requests" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_workflow_requests_company_type"
  ON "cpq_workflow_requests" ("companyId", "requestType");

-- Quote version history — backs cpq/quotes/versions.
CREATE TABLE IF NOT EXISTS "cpq_quote_versions_list" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "quoteNumber" character varying,
  "version" character varying,
  "customerName" character varying,
  "value" numeric(15,2) NOT NULL DEFAULT 0,
  "changes" json,
  "changeType" character varying NOT NULL DEFAULT 'items-added',
  "createdBy" character varying,
  "createdDate" character varying,
  "status" character varying NOT NULL DEFAULT 'draft',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_quote_versions_list" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_quote_versions_list_company_quote"
  ON "cpq_quote_versions_list" ("companyId", "quoteNumber");

-- Notification settings — backs cpq/settings/notifications.
CREATE TABLE IF NOT EXISTS "cpq_notification_prefs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "settingType" character varying NOT NULL DEFAULT 'email-template',
  "name" character varying,
  "subject" character varying,
  "enabled" boolean NOT NULL DEFAULT true,
  "config" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_notification_prefs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_notification_prefs_company_type"
  ON "cpq_notification_prefs" ("companyId", "settingType");

-- Permission roles — backs cpq/settings/permissions.
CREATE TABLE IF NOT EXISTS "cpq_permission_roles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying,
  "description" text,
  "usersCount" integer NOT NULL DEFAULT 0,
  "permissions" json,
  "approvalLimit" numeric(15,2),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_permission_roles" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_permission_roles_company"
  ON "cpq_permission_roles" ("companyId");

-- Integration endpoints — backs cpq/integration/cad, /ecommerce, /erp.
CREATE TABLE IF NOT EXISTS "cpq_integration_endpoints" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "system" character varying NOT NULL DEFAULT 'cad',
  "name" character varying,
  "type" character varying,
  "status" character varying NOT NULL DEFAULT 'connected',
  "version" character varying,
  "lastSync" character varying,
  "recordCount" integer NOT NULL DEFAULT 0,
  "metadata" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_integration_endpoints" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_integration_endpoints_company_system"
  ON "cpq_integration_endpoints" ("companyId", "system");

-- Product-configurator steps — backs cpq/products/configurator.
CREATE TABLE IF NOT EXISTS "cpq_config_steps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "title" character varying,
  "stepOrder" integer NOT NULL DEFAULT 0,
  "completed" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT false,
  "options" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_cpq_config_steps" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_cpq_config_steps_company"
  ON "cpq_config_steps" ("companyId");
