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
