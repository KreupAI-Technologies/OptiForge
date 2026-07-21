-- Additive tables for HR Training Assessments + Attempts.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma tables `hr_training_assessments` (model TrainingAssessment)
-- and `hr_training_assessment_attempts` (model TrainingAssessmentAttempt).
-- Entities: src/modules/hr/entities/training-assessment.entity.ts,
--           src/modules/hr/entities/training-assessment-attempt.entity.ts
-- Backs /hr/training-assessments (+ :id/attempt) and
--       /hr/training-assessment-attempts/:id/submit.

CREATE TABLE IF NOT EXISTS "hr_training_assessments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "programId" character varying,
  "scheduleId" character varying,
  "title" character varying,
  "assessmentType" character varying NOT NULL DEFAULT 'quiz',
  "description" text,
  "totalMarks" integer NOT NULL DEFAULT 100,
  "passingMarks" integer NOT NULL DEFAULT 0,
  "durationMinutes" integer,
  "attemptsAllowed" integer NOT NULL DEFAULT 1,
  "questions" jsonb,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_assessments" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_assessments_companyId"
  ON "hr_training_assessments" ("companyId");

CREATE TABLE IF NOT EXISTS "hr_training_assessment_attempts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "assessmentId" character varying,
  "enrollmentId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "attemptNumber" integer NOT NULL DEFAULT 1,
  "startTime" timestamp without time zone,
  "endTime" timestamp without time zone,
  "status" character varying NOT NULL DEFAULT 'in_progress',
  "answers" jsonb,
  "totalMarks" integer NOT NULL DEFAULT 0,
  "obtainedMarks" integer NOT NULL DEFAULT 0,
  "percentage" numeric(5,2) NOT NULL DEFAULT 0,
  "isPassed" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_assessment_attempts" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_assessment_attempts_companyId"
  ON "hr_training_assessment_attempts" ("companyId");
