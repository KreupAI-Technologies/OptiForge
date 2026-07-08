-- Orphan / additive table for the it-admin security alert-rules feature.
-- Backs the security/alerts "Alert Rules" tab (list + enable/disable toggle).
-- ADDITIVE ONLY: CREATE TABLE IF NOT EXISTS + INSERT ... ON CONFLICT DO NOTHING.
-- Column names are quoted to match the TypeORM entity property names (camelCase).
-- simple-array columns (conditions/actions/notifyVia/recipients) are stored as
-- comma-joined text, matching TypeORM's `simple-array` transport.
-- Do NOT run automatically; apply manually.

CREATE TABLE IF NOT EXISTS "it_alert_rules" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "category" varchar(100) NOT NULL DEFAULT 'General',
  "severity" varchar(50) NOT NULL DEFAULT 'Medium',
  "enabled" boolean NOT NULL DEFAULT true,
  "conditions" text,
  "actions" text,
  "notifyVia" text,
  "recipients" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_alert_rules" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_it_alert_rules_companyId" ON "it_alert_rules" ("companyId");

-- Default alert rules (companyId NULL = global defaults). The service also
-- seeds these on first read if the table is empty; this INSERT makes the data
-- available immediately after applying the migration. Fixed UUIDs keep the
-- ON CONFLICT no-op idempotent across re-runs.
INSERT INTO "it_alert_rules"
  ("id", "companyId", "name", "description", "category", "severity", "enabled", "conditions", "actions", "notifyVia", "recipients")
VALUES
  ('a1e70000-0001-4000-8000-000000000001', NULL,
   'Multiple Failed Login Attempts',
   'Alert when user has 3+ failed login attempts in 10 minutes',
   'Authentication', 'High', true,
   'Failed login count >= 3,Time window = 10 minutes',
   'Lock account for 30 minutes,Send alert to security team',
   'Email,SMS',
   'security@company.com,IT Admin'),
  ('a1e70000-0001-4000-8000-000000000002', NULL,
   'Access from New Location',
   'Alert when user logs in from a new country or city',
   'Behavior', 'Medium', true,
   'Location not in user profile,First access from location',
   'Require additional verification,Log event',
   'Email',
   'User,security@company.com'),
  ('a1e70000-0001-4000-8000-000000000003', NULL,
   'Privilege Escalation Attempt',
   'Alert when user attempts to access resources above their permission level',
   'Access Control', 'Critical', true,
   'Access denied due to insufficient permissions,Admin panel access attempt',
   'Block access,Create incident,Alert security team',
   'Email,SMS,Push',
   'Security Admin,IT Manager'),
  ('a1e70000-0001-4000-8000-000000000004', NULL,
   'Weak Password Usage',
   'Alert when user sets a password that doesn''t meet security requirements',
   'Password', 'Medium', true,
   'Password strength score < 3,Common password detected',
   'Reject password,Force password change,Send security tips',
   'Email',
   'User'),
  ('a1e70000-0001-4000-8000-000000000005', NULL,
   'Unusual Data Access Pattern',
   'Alert when user accesses unusually large amount of data',
   'Data Access', 'High', true,
   'Record access > 500 in 1 hour,Bulk download initiated',
   'Log activity,Alert supervisor,Require justification',
   'Email',
   'User Manager,DLP Admin'),
  ('a1e70000-0001-4000-8000-000000000006', NULL,
   'Session Timeout Warning',
   'Alert user before session expires due to inactivity',
   'Session', 'Low', true,
   'Idle time > 25 minutes,Session timeout = 30 minutes',
   'Display warning popup,Extend session if user responds',
   'In-App',
   'User')
ON CONFLICT ("id") DO NOTHING;
