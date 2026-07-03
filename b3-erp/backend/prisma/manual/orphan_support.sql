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

-- Backs /support/tickets/categories
CREATE TABLE IF NOT EXISTS "support_ticket_categories" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "description" text,
  "color" varchar,
  "ticketCount" integer NOT NULL DEFAULT 0,
  "avgResolutionTime" varchar,
  "slaTarget" varchar,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_ticket_categories" PRIMARY KEY ("id")
);

-- Backs /support/automation/responses
CREATE TABLE IF NOT EXISTS "support_response_templates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "category" varchar,
  "subject" text,
  "body" text,
  "trigger" json,
  "language" varchar NOT NULL DEFAULT 'English',
  "active" boolean NOT NULL DEFAULT true,
  "usageCount" integer NOT NULL DEFAULT 0,
  "effectivenessRate" numeric(5,2) NOT NULL DEFAULT 0,
  "avgResponseTime" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_response_templates" PRIMARY KEY ("id")
);

-- Backs /support/sla/settings
CREATE TABLE IF NOT EXISTS "support_sla_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "slaConfigs" json,
  "businessHours" json,
  "escalationRules" json,
  "notifications" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_sla_settings" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_support_sla_settings_companyId" UNIQUE ("companyId")
);

-- Backs /support/team/agents
CREATE TABLE IF NOT EXISTS "support_agents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "email" varchar,
  "phone" varchar,
  "role" varchar,
  "team" varchar,
  "status" varchar NOT NULL DEFAULT 'Offline',
  "avatar" varchar,
  "joinDate" varchar,
  "location" varchar,
  "shift" varchar,
  "activeTickets" integer NOT NULL DEFAULT 0,
  "resolvedToday" integer NOT NULL DEFAULT 0,
  "resolvedThisMonth" integer NOT NULL DEFAULT 0,
  "avgResolutionTime" varchar,
  "satisfaction" numeric(4,2) NOT NULL DEFAULT 0,
  "responseTime" varchar,
  "slaCompliance" numeric(5,2) NOT NULL DEFAULT 0,
  "skills" json,
  "specializations" json,
  "certifications" json,
  "performance" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_agents" PRIMARY KEY ("id")
);

-- Backs /support/team/skills
CREATE TABLE IF NOT EXISTS "support_agent_skills" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "agentId" varchar,
  "agentName" varchar NOT NULL,
  "team" varchar,
  "avatar" varchar,
  "skills" json,
  "totalSkills" integer NOT NULL DEFAULT 0,
  "expertLevel" integer NOT NULL DEFAULT 0,
  "certifications" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_agent_skills" PRIMARY KEY ("id")
);

-- Backs /support/automation/escalation
CREATE TABLE IF NOT EXISTS "support_escalation_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "description" text,
  "level" integer NOT NULL DEFAULT 1,
  "trigger" json,
  "escalateTo" varchar,
  "notificationChannels" json,
  "active" boolean NOT NULL DEFAULT true,
  "executionCount" integer NOT NULL DEFAULT 0,
  "avgResponseTime" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_escalation_rules" PRIMARY KEY ("id")
);

-- Backs /support/automation/assignment
CREATE TABLE IF NOT EXISTS "support_assignment_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "description" text,
  "priority" integer NOT NULL DEFAULT 100,
  "conditions" json,
  "assignmentLogic" varchar NOT NULL DEFAULT 'Round Robin',
  "assignTo" varchar,
  "active" boolean NOT NULL DEFAULT true,
  "matchedTickets" integer NOT NULL DEFAULT 0,
  "avgAssignmentTime" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_assignment_rules" PRIMARY KEY ("id")
);

-- Backs /support/knowledge/guides
CREATE TABLE IF NOT EXISTS "support_guides" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "guideId" varchar,
  "title" varchar NOT NULL,
  "description" text,
  "category" varchar,
  "difficulty" varchar NOT NULL DEFAULT 'Beginner',
  "readTime" varchar,
  "views" integer NOT NULL DEFAULT 0,
  "helpful" integer NOT NULL DEFAULT 0,
  "lastUpdated" varchar,
  "author" varchar,
  "tags" json,
  "sections" integer NOT NULL DEFAULT 0,
  "featured" boolean NOT NULL DEFAULT false,
  "format" varchar NOT NULL DEFAULT 'Article',
  "thumbnail" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_guides" PRIMARY KEY ("id")
);

-- Backs /support/knowledge/troubleshooting
CREATE TABLE IF NOT EXISTS "support_troubleshooting_articles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "articleId" varchar,
  "title" varchar NOT NULL,
  "problem" text,
  "solution" text,
  "category" varchar,
  "severity" varchar NOT NULL DEFAULT 'medium',
  "steps" json,
  "causes" json,
  "prevention" json,
  "tags" json,
  "views" integer NOT NULL DEFAULT 0,
  "helpful" integer NOT NULL DEFAULT 0,
  "lastUpdated" varchar,
  "author" varchar,
  "relatedArticles" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_troubleshooting_articles" PRIMARY KEY ("id")
);

-- Backs /support/problems/known-errors
CREATE TABLE IF NOT EXISTS "support_known_errors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "errorId" varchar,
  "title" varchar NOT NULL,
  "description" text,
  "workaround" text,
  "status" varchar NOT NULL DEFAULT 'Active',
  "category" varchar,
  "affectedSystems" json,
  "relatedProblems" json,
  "documentedBy" varchar,
  "documentedDate" varchar,
  "lastUpdated" varchar,
  "affectedUsers" integer NOT NULL DEFAULT 0,
  "severity" varchar NOT NULL DEFAULT 'medium',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_known_errors" PRIMARY KEY ("id")
);

-- Backs /support/assets/hardware
CREATE TABLE IF NOT EXISTS "support_hardware_assets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "assetTag" varchar,
  "name" varchar NOT NULL,
  "category" varchar NOT NULL DEFAULT 'Other',
  "manufacturer" varchar,
  "model" varchar,
  "serialNumber" varchar,
  "status" varchar NOT NULL DEFAULT 'Active',
  "condition" varchar NOT NULL DEFAULT 'Good',
  "location" json,
  "assignedTo" json,
  "purchase" json,
  "specifications" json,
  "maintenance" json,
  "lifecycle" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_hardware_assets" PRIMARY KEY ("id")
);

-- Backs /support/assets/software
CREATE TABLE IF NOT EXISTS "support_software_assets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "name" varchar NOT NULL,
  "vendor" varchar,
  "category" varchar NOT NULL DEFAULT 'Other',
  "version" varchar,
  "licenseType" varchar NOT NULL DEFAULT 'Subscription',
  "licenses" json,
  "cost" json,
  "deployment" json,
  "contract" json,
  "compliance" json,
  "support" json,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_software_assets" PRIMARY KEY ("id")
);

-- Backs /support/changes/scheduled
CREATE TABLE IF NOT EXISTS "support_scheduled_changes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "ticketNumber" varchar,
  "title" varchar NOT NULL,
  "type" varchar NOT NULL DEFAULT 'Normal',
  "category" varchar,
  "priority" varchar NOT NULL DEFAULT 'P3',
  "implementer" varchar,
  "implementationDate" varchar,
  "implementationTime" varchar,
  "duration" varchar,
  "status" varchar NOT NULL DEFAULT 'Scheduled',
  "affectedSystems" json,
  "downtime" boolean NOT NULL DEFAULT false,
  "backupCompleted" boolean NOT NULL DEFAULT false,
  "stakeholdersNotified" boolean NOT NULL DEFAULT false,
  "changeWindow" varchar,
  "approvedBy" varchar,
  "approvalDate" varchar,
  "rollbackPlan" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_scheduled_changes" PRIMARY KEY ("id")
);

-- Backs /support/omnichannel (unified inbox). Each row is a support
-- conversation/interaction across a channel (email/chat/phone/social/whatsapp).
-- Entity: src/modules/support/entities/omnichannel-interaction.entity.ts
CREATE TABLE IF NOT EXISTS "support_omnichannel_interactions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "ticketId" varchar NOT NULL,
  "subject" varchar NOT NULL,
  "customerName" varchar NOT NULL,
  "customerEmail" varchar,
  "customerAvatar" varchar,
  "channel" varchar NOT NULL DEFAULT 'email',
  "lastMessage" text,
  "lastMessageTime" varchar,
  "unreadCount" integer NOT NULL DEFAULT 0,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "status" varchar NOT NULL DEFAULT 'open',
  "assignedToName" varchar,
  "assignedToAvatar" varchar,
  "tags" json,
  "starred" boolean NOT NULL DEFAULT false,
  "hasAttachments" boolean NOT NULL DEFAULT false,
  "slaDeadline" varchar,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_omnichannel_interactions" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_omnichannel_interactions_company"
  ON "support_omnichannel_interactions" ("companyId");
