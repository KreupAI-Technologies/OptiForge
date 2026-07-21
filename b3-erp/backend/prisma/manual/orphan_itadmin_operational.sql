-- Orphan / additive tables for net-new IT-Admin operational features.
-- Backs: compliance violations, database cleanup tasks, export templates,
-- monitored servers, and email test-attempt logs.
-- ADDITIVE ONLY: CREATE TABLE IF NOT EXISTS. Column names are quoted to match
-- the TypeORM entity property names (camelCase). Do NOT run automatically.

-- ---------------------------------------------------------------------------
-- Compliance violations (audit/compliance page "Violations" tab)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "it_compliance_violations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "requirementId" varchar,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "requirement" varchar(200),
  "description" text,
  "severity" varchar(50) NOT NULL DEFAULT 'Medium',
  "status" varchar(50) NOT NULL DEFAULT 'Open',
  "affectedEntity" varchar(200),
  "detectedBy" varchar(200),
  "assignedTo" varchar(200),
  "detectedAt" timestamp,
  "dueDate" timestamp,
  "resolvedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_compliance_violations" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_compliance_violations_companyId"
  ON "it_compliance_violations" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_it_compliance_violations_status"
  ON "it_compliance_violations" ("status");
CREATE INDEX IF NOT EXISTS "IDX_it_compliance_violations_severity"
  ON "it_compliance_violations" ("severity");

-- ---------------------------------------------------------------------------
-- Database cleanup tasks (database/cleanup page). Defaults are seeded by the
-- service on first read when the table is empty.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "it_cleanup_tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(50) NOT NULL DEFAULT 'logs',
  "impact" varchar(50) NOT NULL DEFAULT 'low',
  "estimatedSpace" varchar(50),
  "recordCount" bigint NOT NULL DEFAULT 0,
  "automated" boolean NOT NULL DEFAULT false,
  "enabled" boolean NOT NULL DEFAULT true,
  "lastRunAt" timestamp,
  "recordsAffected" bigint NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_cleanup_tasks" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_cleanup_tasks_companyId"
  ON "it_cleanup_tasks" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_it_cleanup_tasks_category"
  ON "it_cleanup_tasks" ("category");

-- ---------------------------------------------------------------------------
-- Export templates (database/export page). Defaults seeded on first read.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "it_export_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "dataset" varchar(100),
  "format" varchar(50) NOT NULL DEFAULT 'csv',
  "tables" jsonb,
  "columns" jsonb,
  "filters" jsonb,
  "lastUsedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_export_templates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_export_templates_companyId"
  ON "it_export_templates" ("companyId");

-- ---------------------------------------------------------------------------
-- Monitored servers (monitoring/health "Servers" tab). Defaults seeded on
-- first read when the table is empty.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "it_monitored_servers" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "host" varchar(200),
  "role" varchar(100) NOT NULL DEFAULT 'Application Server',
  "status" varchar(50) NOT NULL DEFAULT 'Healthy',
  "cpuPct" double precision NOT NULL DEFAULT 0,
  "memPct" double precision NOT NULL DEFAULT 0,
  "diskPct" double precision NOT NULL DEFAULT 0,
  "networkPct" double precision NOT NULL DEFAULT 0,
  "uptime" varchar(100),
  "location" varchar(100),
  "lastRestartAt" timestamp,
  "lastCheckAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_monitored_servers" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_monitored_servers_companyId"
  ON "it_monitored_servers" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_it_monitored_servers_status"
  ON "it_monitored_servers" ("status");

-- ---------------------------------------------------------------------------
-- Email test-attempt logs (system/email page "Send Test Email"). No real SMTP
-- send is performed; this records the attempt + simulated outcome.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "it_email_test_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "toAddress" varchar(200) NOT NULL,
  "smtpHost" varchar(200),
  "success" boolean NOT NULL DEFAULT true,
  "message" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_email_test_logs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_email_test_logs_companyId"
  ON "it_email_test_logs" ("companyId");
