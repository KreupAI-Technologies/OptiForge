-- Orphan / additive tables for the it-admin module.
-- ADDITIVE ONLY: every statement is CREATE TABLE IF NOT EXISTS.
-- Column names are quoted to match the TypeORM entity property names exactly (camelCase).
-- Do NOT run automatically; apply manually.

-- IP whitelist entries (security/ip-whitelist)
CREATE TABLE IF NOT EXISTS "it_ip_whitelist_entries" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "ipAddress" varchar(100) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'Single',
  "description" text,
  "category" varchar(100),
  "addedBy" varchar(150),
  "addedDate" varchar(50),
  "lastAccess" varchar(50),
  "accessCount" integer NOT NULL DEFAULT 0,
  "status" varchar(50) NOT NULL DEFAULT 'Active',
  "expiresAt" varchar(50),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_ip_whitelist_entries" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_ip_whitelist_companyId" ON "it_ip_whitelist_entries" ("companyId");

-- Document / message templates (customization/templates)
CREATE TABLE IF NOT EXISTS "it_document_templates" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "type" varchar(50) NOT NULL DEFAULT 'email',
  "category" varchar(100),
  "content" text,
  "variables" text,
  "format" varchar(50) NOT NULL DEFAULT 'html',
  "lastModified" varchar(50),
  "usageCount" integer NOT NULL DEFAULT 0,
  "isDefault" boolean NOT NULL DEFAULT false,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_document_templates" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_document_templates_companyId" ON "it_document_templates" ("companyId");

-- Custom field definitions (customization/fields)
CREATE TABLE IF NOT EXISTS "it_custom_fields" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(150) NOT NULL,
  "label" varchar(200) NOT NULL,
  "module" varchar(100),
  "fieldType" varchar(50) NOT NULL DEFAULT 'text',
  "required" boolean NOT NULL DEFAULT false,
  "defaultValue" varchar(255),
  "options" text,
  "validation" varchar(255),
  "helpText" text,
  "createdAtLabel" varchar(50),
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_custom_fields" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_custom_fields_companyId" ON "it_custom_fields" ("companyId");

-- Integration configurations (system/integrations)
CREATE TABLE IF NOT EXISTS "it_integration_configs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "category" varchar(50) NOT NULL DEFAULT 'erp',
  "description" text,
  "status" varchar(50) NOT NULL DEFAULT 'inactive',
  "icon" varchar(100),
  "config" jsonb,
  "lastSync" varchar(50),
  "syncFrequency" varchar(50),
  "features" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_integration_configs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_integration_configs_companyId" ON "it_integration_configs" ("companyId");

-- Access / security policies (roles/policies)
CREATE TABLE IF NOT EXISTS "it_access_policies" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "type" varchar(50) NOT NULL DEFAULT 'security',
  "enabled" boolean NOT NULL DEFAULT true,
  "appliedRoles" text,
  "severity" varchar(50) NOT NULL DEFAULT 'medium',
  "config" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_access_policies" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_access_policies_companyId" ON "it_access_policies" ("companyId");

-- Scheduled jobs (scheduler/jobs)
CREATE TABLE IF NOT EXISTS "it_scheduled_jobs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "type" varchar(100) NOT NULL DEFAULT 'Custom',
  "schedule" varchar(200),
  "cronExpression" varchar(100),
  "status" varchar(50) NOT NULL DEFAULT 'Active',
  "lastRun" varchar(50),
  "lastRunStatus" varchar(50),
  "nextRun" varchar(50),
  "duration" varchar(50),
  "successRate" numeric NOT NULL DEFAULT 0,
  "totalRuns" integer NOT NULL DEFAULT 0,
  "failedRuns" integer NOT NULL DEFAULT 0,
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" varchar(50) NOT NULL DEFAULT 'Medium',
  "createdBy" varchar(150),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_scheduled_jobs" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_scheduled_jobs_companyId" ON "it_scheduled_jobs" ("companyId");

-- Automation rules (scheduler/automation)
CREATE TABLE IF NOT EXISTS "it_automation_rules" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "trigger" varchar(200),
  "triggerType" varchar(100),
  "conditions" text,
  "actions" text,
  "status" varchar(50) NOT NULL DEFAULT 'Active',
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" varchar(50) NOT NULL DEFAULT 'Medium',
  "lastTriggered" varchar(50),
  "executionCount" integer NOT NULL DEFAULT 0,
  "successCount" integer NOT NULL DEFAULT 0,
  "failureCount" integer NOT NULL DEFAULT 0,
  "successRate" numeric NOT NULL DEFAULT 0,
  "createdBy" varchar(150),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_automation_rules" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_automation_rules_companyId" ON "it_automation_rules" ("companyId");

-- Security alerts (security/alerts)
CREATE TABLE IF NOT EXISTS "it_security_alerts" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "type" varchar(100) NOT NULL DEFAULT 'suspicious_activity',
  "severity" varchar(50) NOT NULL DEFAULT 'medium',
  "title" varchar(200) NOT NULL,
  "description" text,
  "timestamp" varchar(50),
  "source" varchar(150),
  "ipAddress" varchar(100),
  "userId" varchar(100),
  "userName" varchar(150),
  "status" varchar(50) NOT NULL DEFAULT 'new',
  "actionTaken" text,
  "assignedTo" varchar(150),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_security_alerts" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_security_alerts_companyId" ON "it_security_alerts" ("companyId");

-- Password policy (security/password) - one row per company
CREATE TABLE IF NOT EXISTS "it_password_policies" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "minLength" integer NOT NULL DEFAULT 8,
  "maxLength" integer NOT NULL DEFAULT 128,
  "requireUppercase" boolean NOT NULL DEFAULT true,
  "requireLowercase" boolean NOT NULL DEFAULT true,
  "requireNumbers" boolean NOT NULL DEFAULT true,
  "requireSpecialChars" boolean NOT NULL DEFAULT true,
  "expiryDays" integer NOT NULL DEFAULT 90,
  "historyCount" integer NOT NULL DEFAULT 5,
  "lockoutThreshold" integer NOT NULL DEFAULT 5,
  "lockoutDurationMinutes" integer NOT NULL DEFAULT 30,
  "mfaRequired" boolean NOT NULL DEFAULT false,
  "extra" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_password_policies" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_password_policies_companyId" ON "it_password_policies" ("companyId");

-- Notification settings (system/notifications)
CREATE TABLE IF NOT EXISTS "it_notification_settings" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "category" varchar(100) NOT NULL DEFAULT 'general',
  "name" varchar(200) NOT NULL,
  "description" text,
  "channels" jsonb,
  "priority" varchar(50) NOT NULL DEFAULT 'medium',
  "roles" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_notification_settings" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_notification_settings_companyId" ON "it_notification_settings" ("companyId");

-- ============================================================================
-- Round 2 additive tables (mock-only page wiring)
-- ============================================================================

-- User groups (users/groups)
CREATE TABLE IF NOT EXISTS "it_user_groups" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "memberCount" integer NOT NULL DEFAULT 0,
  "permissions" text,
  "members" jsonb,
  "createdDate" varchar(50),
  "status" varchar(50) NOT NULL DEFAULT 'Active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_user_groups" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_user_groups_companyId" ON "it_user_groups" ("companyId");

-- License features (license/features)
CREATE TABLE IF NOT EXISTS "it_license_features" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(100) NOT NULL DEFAULT 'Core Features',
  "enabled" boolean NOT NULL DEFAULT false,
  "included" boolean NOT NULL DEFAULT true,
  "tier" varchar(50),
  "usageLimit" integer,
  "usageCount" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_license_features" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_license_features_companyId" ON "it_license_features" ("companyId");

-- License users (license/users)
CREATE TABLE IF NOT EXISTS "it_license_users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "email" varchar(200),
  "role" varchar(100),
  "department" varchar(100),
  "licenseType" varchar(50) NOT NULL DEFAULT 'Named',
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "assignedDate" varchar(50),
  "lastActive" varchar(50),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_license_users" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_license_users_companyId" ON "it_license_users" ("companyId");

-- Security policies (roles/policies)
CREATE TABLE IF NOT EXISTS "it_security_policies" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "type" varchar(50) NOT NULL DEFAULT 'security',
  "enabled" boolean NOT NULL DEFAULT true,
  "appliedRoles" text,
  "severity" varchar(50) NOT NULL DEFAULT 'medium',
  "config" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_security_policies" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_security_policies_companyId" ON "it_security_policies" ("companyId");

-- Webhook endpoints (system/webhooks)
CREATE TABLE IF NOT EXISTS "it_webhook_endpoints" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "url" text,
  "events" text,
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "secret" varchar(200),
  "lastTriggered" varchar(50),
  "successCount" integer NOT NULL DEFAULT 0,
  "failureCount" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_webhook_endpoints" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_webhook_endpoints_companyId" ON "it_webhook_endpoints" ("companyId");

-- API endpoints (system/api)
CREATE TABLE IF NOT EXISTS "it_api_endpoints" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "method" varchar(20) NOT NULL DEFAULT 'GET',
  "path" text,
  "description" text,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "enabled" boolean NOT NULL DEFAULT true,
  "authRequired" boolean NOT NULL DEFAULT true,
  "parameters" jsonb,
  "rateLimit" integer,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_api_endpoints" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_api_endpoints_companyId" ON "it_api_endpoints" ("companyId");

-- Backup records (database/backup)
CREATE TABLE IF NOT EXISTS "it_backup_records" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'full',
  "status" varchar(50) NOT NULL DEFAULT 'completed',
  "size" varchar(50),
  "location" varchar(50),
  "startedAt" varchar(50),
  "completedAt" varchar(50),
  "duration" varchar(50),
  "automated" boolean NOT NULL DEFAULT false,
  "createdBy" varchar(150),
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_backup_records" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_backup_records_companyId" ON "it_backup_records" ("companyId");

-- Export datasets (database/export)
CREATE TABLE IF NOT EXISTS "it_export_datasets" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "recordCount" integer NOT NULL DEFAULT 0,
  "size" varchar(50),
  "exportable" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_export_datasets" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_export_datasets_companyId" ON "it_export_datasets" ("companyId");
