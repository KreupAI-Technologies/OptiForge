-- Additive table for HR Training Schedules.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_training_schedules` (model TrainingSchedule).
-- Column names quoted to match the TypeORM entity exactly.
-- Entity: src/modules/hr/entities/training-schedule.entity.ts
-- Backs GET/POST/PUT/DELETE /hr/training-schedules.

CREATE TABLE IF NOT EXISTS "hr_training_schedules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "programId" character varying,
  "title" character varying,
  "trainer" character varying,
  "startDate" character varying,
  "endDate" character varying,
  "location" character varying,
  "capacity" integer,
  "enrolled" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'scheduled',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_schedules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_schedules_companyId"
  ON "hr_training_schedules" ("companyId");
