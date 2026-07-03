-- Additive tables for orphaned Workflow pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.

-- Backs the workflow/automation page (AutomationRule list/config).
CREATE TABLE IF NOT EXISTS "workflow_automation_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "trigger" character varying,
  "triggerDetails" character varying,
  "action" character varying,
  "status" character varying NOT NULL DEFAULT 'active',
  "frequency" character varying,
  "lastRun" character varying,
  "nextRun" character varying,
  "executionCount" integer NOT NULL DEFAULT 0,
  "successRate" numeric(5,2) NOT NULL DEFAULT 0,
  "avgExecutionTime" character varying,
  "category" character varying,
  "priority" character varying,
  "createdByName" character varying,
  "conditions" json,
  "actions" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_workflow_automation_rules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_workflow_automation_rules_company"
  ON "workflow_automation_rules" ("companyId");

-- Backs the workflow/approvals/pending page (PendingApproval list).
CREATE TABLE IF NOT EXISTS "workflow_pending_approvals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "referenceNo" character varying,
  "title" character varying NOT NULL,
  "description" text,
  "module" character varying,
  "moduleUrl" character varying,
  "requestedBy" character varying,
  "requestedAt" character varying,
  "amount" numeric(15,2),
  "priority" character varying,
  "dueDate" character varying,
  "slaStatus" character varying,
  "step" character varying,
  "totalSteps" integer NOT NULL DEFAULT 1,
  "currentStep" integer NOT NULL DEFAULT 1,
  "status" character varying NOT NULL DEFAULT 'pending',
  "payload" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_workflow_pending_approvals" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_workflow_pending_approvals_company"
  ON "workflow_pending_approvals" ("companyId");

-- Backs the workflow root page (WorkflowTemplate config list).
CREATE TABLE IF NOT EXISTS "workflow_config_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "category" character varying,
  "triggerType" character varying,
  "steps" integer NOT NULL DEFAULT 0,
  "activeInstances" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'active',
  "stepDetails" json,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_workflow_config_templates" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_workflow_config_templates_company"
  ON "workflow_config_templates" ("companyId");
