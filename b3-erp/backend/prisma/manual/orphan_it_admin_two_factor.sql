-- Additive tables for IT-Admin Two-Factor Authentication (2FA) admin subsystem.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entities:
--   src/modules/it-admin/entities/two-factor-setting.entity.ts
--   src/modules/it-admin/entities/two-factor-enrollment.entity.ts
--
-- Backs security/2fa page:
--   GET/PUT  /it-admin/two-factor/settings
--   GET      /it-admin/two-factor/enrollments
--   POST     /it-admin/two-factor/enrollments/:userId/reminder
--   POST     /it-admin/two-factor/enrollments/:userId/reset
--   POST     /it-admin/two-factor/enrollments/:userId/backup-codes

CREATE TABLE IF NOT EXISTS "it_two_factor_settings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying,
  "enabled" boolean NOT NULL DEFAULT true,
  "required" boolean NOT NULL DEFAULT false,
  "allowedMethods" jsonb,
  "gracePeriodDays" integer NOT NULL DEFAULT 30,
  "config" jsonb,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_two_factor_settings" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_it_two_factor_settings_company"
  ON "it_two_factor_settings" ("companyId");

CREATE TABLE IF NOT EXISTS "it_two_factor_enrollments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying,
  "userId" character varying NOT NULL,
  "userName" character varying,
  "userEmail" character varying,
  "department" character varying,
  "role" character varying,
  "method" character varying NOT NULL DEFAULT 'Not Set',
  "enrolled" boolean NOT NULL DEFAULT false,
  "backupCodes" jsonb,
  "lastVerifiedAt" timestamp without time zone,
  "lastReminderAt" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_two_factor_enrollments" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_it_two_factor_enrollments_company"
  ON "it_two_factor_enrollments" ("companyId");

CREATE INDEX IF NOT EXISTS "IDX_it_two_factor_enrollments_user"
  ON "it_two_factor_enrollments" ("userId");
