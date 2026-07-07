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

-- Backs GET /api/v1/support/tickets (Prisma model SupportTicket -> support_tickets).
-- ADDITIVE ONLY. Column names mirror the Prisma model field names.
CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ticketCode" varchar NOT NULL,
  "ticketNumber" varchar NOT NULL,
  "channel" varchar NOT NULL,
  "source" varchar,
  "customerId" varchar,
  "customerName" varchar NOT NULL,
  "customerEmail" varchar,
  "customerPhone" varchar,
  "companyName" varchar,
  "subject" varchar NOT NULL,
  "description" text NOT NULL,
  "categoryId" varchar,
  "subCategory" varchar,
  "priority" varchar NOT NULL DEFAULT 'medium',
  "ticketType" varchar NOT NULL,
  "assignedAgentId" varchar,
  "assignedTeam" varchar,
  "escalatedTo" varchar,
  "escalationLevel" integer NOT NULL DEFAULT 0,
  "slaId" varchar,
  "firstResponseDue" timestamp,
  "resolutionDue" timestamp,
  "firstResponseAt" timestamp,
  "firstResponseBreached" boolean NOT NULL DEFAULT false,
  "resolutionBreached" boolean NOT NULL DEFAULT false,
  "resolution" text,
  "resolutionNotes" text,
  "resolvedAt" timestamp,
  "resolvedBy" varchar,
  "closedAt" timestamp,
  "closedBy" varchar,
  "closureReason" varchar,
  "status" varchar NOT NULL DEFAULT 'open',
  "csatScore" integer,
  "csatFeedback" text,
  "csatSubmittedAt" timestamp,
  "tags" text[] NOT NULL DEFAULT '{}',
  "relatedTickets" text[] NOT NULL DEFAULT '{}',
  "attachments" json,
  "reopenCount" integer NOT NULL DEFAULT 0,
  "responseCount" integer NOT NULL DEFAULT 0,
  "incidentId" varchar,
  "problemId" varchar,
  "changeRequestId" varchar,
  "remarks" text,
  "companyId" varchar NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_tickets" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_support_tickets_code_company" UNIQUE ("ticketCode", "companyId"),
  CONSTRAINT "UQ_support_tickets_number_company" UNIQUE ("ticketNumber", "companyId")
);

CREATE INDEX IF NOT EXISTS "IDX_support_tickets_company"
  ON "support_tickets" ("companyId");


-- ============================================================
-- support/reports — report-template catalog (appended)
-- ============================================================
-- Orphan support tables (additive). Apply manually; do NOT auto-run.
-- Backs pages whose primary data list previously had no persistence.

-- /support/reports — report-template catalog
CREATE TABLE IF NOT EXISTS support_report_templates (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId"    varchar NOT NULL,
    name           varchar NOT NULL,
    category       varchar,
    description    text,
    frequency      varchar NOT NULL DEFAULT 'On-Demand',
    "format"       json,
    recipients     integer NOT NULL DEFAULT 0,
    scheduled      boolean NOT NULL DEFAULT false,
    popularity     integer NOT NULL DEFAULT 0,
    "lastGenerated" varchar,
    meta           json,
    "createdAt"    timestamptz NOT NULL DEFAULT now(),
    "updatedAt"    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_report_templates_company
    ON support_report_templates ("companyId");


-- ============================================================
-- ITIL: incidents / problems / changes (appended)
-- ============================================================
-- Backs the ITILController (support/itil/*) exposing the existing
-- ITILService. Column names mirror the Prisma models ITILIncident /
-- ITILProblem / ITILChange / ITILChangeApproval. ADDITIVE ONLY.

-- Backs /support/incidents/* (create, tracking, critical, major)
CREATE TABLE IF NOT EXISTS "itil_incidents" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "incidentNumber" varchar NOT NULL,
  "title" varchar NOT NULL,
  "description" text NOT NULL,
  "impact" varchar NOT NULL DEFAULT 'medium',
  "urgency" varchar NOT NULL DEFAULT 'medium',
  "priority" varchar NOT NULL DEFAULT 'P3',
  "category" varchar,
  "subcategory" varchar,
  "affectedService" varchar,
  "affectedCI" varchar,
  "status" varchar NOT NULL DEFAULT 'new',
  "assignedGroup" varchar,
  "assignedTo" varchar,
  "reportedAt" timestamp NOT NULL DEFAULT now(),
  "reportedBy" varchar,
  "acknowledgedAt" timestamp,
  "resolvedAt" timestamp,
  "closedAt" timestamp,
  "resolutionCode" varchar,
  "resolutionNotes" text,
  "rootCause" text,
  "relatedProblemId" varchar,
  "relatedChangeId" varchar,
  "relatedTicketId" varchar,
  "isMajorIncident" boolean NOT NULL DEFAULT false,
  "majorIncidentManager" varchar,
  "companyId" varchar NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_itil_incidents" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_itil_incidents_number_company" UNIQUE ("incidentNumber", "companyId")
);
CREATE INDEX IF NOT EXISTS "IDX_itil_incidents_company" ON "itil_incidents" ("companyId");

-- Backs /support/problems/* (list, create, rca)
CREATE TABLE IF NOT EXISTS "itil_problems" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "problemNumber" varchar NOT NULL,
  "title" varchar NOT NULL,
  "description" text NOT NULL,
  "impact" varchar NOT NULL DEFAULT 'medium',
  "urgency" varchar NOT NULL DEFAULT 'medium',
  "priority" varchar NOT NULL DEFAULT 'P3',
  "category" varchar,
  "affectedService" varchar,
  "affectedCIs" text[] NOT NULL DEFAULT '{}',
  "status" varchar NOT NULL DEFAULT 'logged',
  "assignedGroup" varchar,
  "assignedTo" varchar,
  "rootCause" text,
  "workaround" text,
  "knownErrorId" varchar,
  "loggedAt" timestamp NOT NULL DEFAULT now(),
  "loggedBy" varchar,
  "investigationStarted" timestamp,
  "resolvedAt" timestamp,
  "closedAt" timestamp,
  "relatedIncidents" text[] NOT NULL DEFAULT '{}',
  "incidentCount" integer NOT NULL DEFAULT 0,
  "companyId" varchar NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_itil_problems" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_itil_problems_number_company" UNIQUE ("problemNumber", "companyId")
);
CREATE INDEX IF NOT EXISTS "IDX_itil_problems_company" ON "itil_problems" ("companyId");

-- Backs /support/changes/* (create + change management)
CREATE TABLE IF NOT EXISTS "itil_changes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "changeNumber" varchar NOT NULL,
  "title" varchar NOT NULL,
  "description" text NOT NULL,
  "justification" text,
  "changeType" varchar NOT NULL DEFAULT 'normal',
  "category" varchar,
  "riskLevel" varchar NOT NULL DEFAULT 'medium',
  "impact" varchar NOT NULL DEFAULT 'medium',
  "status" varchar NOT NULL DEFAULT 'draft',
  "plannedStartDate" timestamp,
  "plannedEndDate" timestamp,
  "actualStartDate" timestamp,
  "actualEndDate" timestamp,
  "requestedBy" varchar,
  "assignedGroup" varchar,
  "assignedTo" varchar,
  "changeManager" varchar,
  "implementationPlan" text,
  "backoutPlan" text,
  "testPlan" text,
  "reviewNotes" text,
  "reviewedBy" varchar,
  "reviewedAt" timestamp,
  "relatedProblemId" varchar,
  "relatedIncidents" text[] NOT NULL DEFAULT '{}',
  "affectedCIs" text[] NOT NULL DEFAULT '{}',
  "companyId" varchar NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_itil_changes" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_itil_changes_number_company" UNIQUE ("changeNumber", "companyId")
);
CREATE INDEX IF NOT EXISTS "IDX_itil_changes_company" ON "itil_changes" ("companyId");

CREATE TABLE IF NOT EXISTS "itil_change_approvals" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "changeId" uuid NOT NULL,
  "approverId" varchar NOT NULL,
  "approverName" varchar,
  "approverRole" varchar,
  "decision" varchar NOT NULL DEFAULT 'pending',
  "comments" text,
  "requestedAt" timestamp NOT NULL DEFAULT now(),
  "decidedAt" timestamp,
  "companyId" varchar NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_itil_change_approvals" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_itil_change_approvals_change" ON "itil_change_approvals" ("changeId");


-- ============================================================
-- support/advanced-features (SLA tab) — SLA policies + seed
-- ============================================================
-- Backs GET /api/v1/support/sla/policies and /support/sla/dashboard
-- (Prisma model SLAPolicy -> support_sla_policies). ADDITIVE ONLY.
-- Column names mirror the Prisma model field names.
CREATE TABLE IF NOT EXISTS "support_sla_policies" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "slaCode" varchar NOT NULL,
  "slaName" varchar NOT NULL,
  "description" text,
  "priority" varchar,
  "ticketType" varchar,
  "category" varchar,
  "customerTier" varchar,
  "firstResponseMinutes" integer NOT NULL,
  "responseBusinessHours" boolean NOT NULL DEFAULT true,
  "resolutionMinutes" integer NOT NULL,
  "resolutionBusinessHours" boolean NOT NULL DEFAULT true,
  "businessHoursStart" varchar,
  "businessHoursEnd" varchar,
  "businessDays" text[] NOT NULL DEFAULT '{}',
  "timezone" varchar,
  "holidayCalendarId" varchar,
  "escalationEnabled" boolean NOT NULL DEFAULT true,
  "escalationRules" json,
  "penaltyEnabled" boolean NOT NULL DEFAULT false,
  "responsePenalty" numeric(10,2),
  "resolutionPenalty" numeric(10,2),
  "isDefault" boolean NOT NULL DEFAULT false,
  "isActive" boolean NOT NULL DEFAULT true,
  "companyId" varchar NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_support_sla_policies" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_support_sla_policies_code_company" UNIQUE ("slaCode", "companyId")
);

CREATE INDEX IF NOT EXISTS "IDX_support_sla_policies_company"
  ON "support_sla_policies" ("companyId");

-- Idempotent seed policies (upsert on slaCode+companyId)
INSERT INTO "support_sla_policies"
  ("slaCode","slaName","description","priority","firstResponseMinutes","resolutionMinutes","isDefault","isActive","companyId")
VALUES
  ('SLA-CRIT','Critical Issues','SLA for critical priority tickets','critical',15,240,false,true,'company-1'),
  ('SLA-HIGH','High Priority','SLA for high priority tickets','high',60,480,false,true,'company-1'),
  ('SLA-MED','Medium Priority','SLA for medium priority tickets','medium',240,1440,true,true,'company-1'),
  ('SLA-LOW','Low Priority','SLA for low priority tickets','low',480,2880,false,true,'company-1')
ON CONFLICT ("slaCode","companyId") DO NOTHING;

-- Idempotent seed tickets so the SLA dashboard computes a real compliance rate.
INSERT INTO "support_tickets"
  ("ticketCode","ticketNumber","channel","customerName","subject","description","priority","ticketType","status","firstResponseBreached","resolutionBreached","companyId")
VALUES
  ('TKT-SLA-001','TKT-SLA-001','email','ACME Corp','Production server down','Critical outage affecting production line','critical','incident','in_progress',false,false,'company-1'),
  ('TKT-SLA-002','TKT-SLA-002','chat','ACME Corp','Database connection errors','Intermittent DB connection failures','high','incident','open',false,false,'company-1'),
  ('TKT-SLA-003','TKT-SLA-003','portal','Beta Kitchens','Feature request','Requesting new export format','low','request','open',false,false,'company-1'),
  ('TKT-SLA-004','TKT-SLA-004','phone','Gamma Foods','Login issue','User cannot authenticate','high','incident','resolved',true,false,'company-1'),
  ('TKT-SLA-005','TKT-SLA-005','email','Delta Diner','Report not generating','Monthly report stuck','medium','incident','open',false,true,'company-1')
ON CONFLICT ("ticketNumber","companyId") DO NOTHING;
