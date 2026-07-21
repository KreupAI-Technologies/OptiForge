-- Additive table for HR Training Waitlist.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_training_waitlist` (model TrainingWaitlist).
-- Entity: src/modules/hr/entities/training-waitlist.entity.ts
-- Backs GET/POST/PUT /hr/training-waitlist (+ :id/notify).

CREATE TABLE IF NOT EXISTS "hr_training_waitlist" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "programId" character varying,
  "scheduleId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "position" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'waiting',
  "notifiedAt" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_waitlist" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_waitlist_companyId"
  ON "hr_training_waitlist" ("companyId");
