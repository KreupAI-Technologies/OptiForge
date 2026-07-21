-- Net-new HR Performance / Succession / Biometric backends.
-- ADDITIVE ONLY: never DROP or ALTER existing tables. All CREATE ... IF NOT EXISTS.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entities:
--   src/modules/hr/entities/recognition.entity.ts            -> hr_recognitions
--   src/modules/hr/entities/recognition-comment.entity.ts    -> hr_recognition_comments
--   src/modules/hr/entities/review-meeting.entity.ts         -> hr_review_meetings
--   src/modules/hr/entities/kpi-assignment.entity.ts         -> hr_kpi_assignments
--   src/modules/hr/entities/performance-improvement-plan.entity.ts -> hr_performance_pips
--   src/modules/hr/entities/biometric-device.entity.ts       -> hr_biometric_devices
-- Succession analytics reuses the existing hr_succession_plans table (no DDL).

-- Recognition + comments -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "hr_recognitions" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "fromEmployeeId" character varying,
  "fromEmployeeName" character varying,
  "toEmployeeId" character varying,
  "toEmployeeName" character varying,
  "recognitionType" character varying,
  "category" character varying,
  "title" character varying,
  "message" text,
  "visibility" character varying DEFAULT 'public',
  "likes" integer NOT NULL DEFAULT 0,
  "likedBy" text[] NOT NULL DEFAULT '{}',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_recognitions" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_recognitions_company"
  ON "hr_recognitions" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_recognition_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "recognitionId" character varying NOT NULL,
  "authorId" character varying,
  "authorName" character varying,
  "body" text NOT NULL,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_recognition_comments" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_recognition_comments_recognition"
  ON "hr_recognition_comments" ("recognitionId");

-- Review meetings ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "hr_review_meetings" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "reviewId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "role" character varying,
  "meetingType" character varying DEFAULT 'review_discussion',
  "type" character varying,
  "scheduledDate" character varying,
  "scheduledTime" character varying,
  "duration" character varying,
  "location" character varying,
  "meetingLink" character varying,
  "status" character varying DEFAULT 'scheduled',
  "agenda" text,
  "notes" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_review_meetings" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_review_meetings_company"
  ON "hr_review_meetings" ("companyId");

-- KPI assignments ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "hr_kpi_assignments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "kpiMasterId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "title" character varying,
  "description" text,
  "target" character varying,
  "weightage" numeric,
  "period" character varying,
  "dueDate" character varying,
  "status" character varying DEFAULT 'assigned',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_kpi_assignments" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_kpi_assignments_company"
  ON "hr_kpi_assignments" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_kpi_assignments_employee"
  ON "hr_kpi_assignments" ("employeeId");

-- Performance Improvement Plans ---------------------------------------------
CREATE TABLE IF NOT EXISTS "hr_performance_pips" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "employeeId" character varying,
  "employeeName" character varying,
  "role" character varying,
  "managerId" character varying,
  "managerName" character varying,
  "reason" text,
  "goals" text,
  "startDate" character varying,
  "endDate" character varying,
  "status" character varying DEFAULT 'active',
  "actionItems" jsonb,
  "progress" integer NOT NULL DEFAULT 0,
  "reviewNotes" text,
  "outcome" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_performance_pips" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_performance_pips_company"
  ON "hr_performance_pips" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_performance_pips_employee"
  ON "hr_performance_pips" ("employeeId");

-- Biometric device registry --------------------------------------------------
CREATE TABLE IF NOT EXISTS "hr_biometric_devices" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "deviceId" character varying,
  "name" character varying,
  "model" character varying,
  "location" character varying,
  "ipAddress" character varying,
  "port" integer DEFAULT 4370,
  "status" character varying DEFAULT 'online',
  "lastSyncAt" timestamptz,
  "enrolledUsers" integer NOT NULL DEFAULT 0,
  "batteryBackup" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_biometric_devices" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_biometric_devices_company"
  ON "hr_biometric_devices" ("companyId");
