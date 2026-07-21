-- Additive table for HR Training Attendance.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_training_attendance` (model TrainingAttendance).
-- Entity: src/modules/hr/entities/training-attendance.entity.ts
-- Backs GET/POST/PUT /hr/training-attendance (+ :id/note).

CREATE TABLE IF NOT EXISTS "hr_training_attendance" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "scheduleId" character varying,
  "enrollmentId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "status" character varying NOT NULL DEFAULT 'present',
  "note" text,
  "date" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_attendance" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_attendance_companyId"
  ON "hr_training_attendance" ("companyId");
