-- Additive table for HR E-Learning Course Progress.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_course_progress` (model CourseProgress).
-- Entity: src/modules/hr/entities/course-progress.entity.ts
-- Backs GET /hr/elearning-progress, POST enroll/:courseId, PUT :id/lesson/:lessonId.

CREATE TABLE IF NOT EXISTS "hr_course_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "courseId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "progressPct" numeric(5,2) NOT NULL DEFAULT 0,
  "completedLessons" integer NOT NULL DEFAULT 0,
  "totalLessons" integer NOT NULL DEFAULT 0,
  "lessonProgress" jsonb,
  "timeSpentMinutes" integer NOT NULL DEFAULT 0,
  "status" character varying NOT NULL DEFAULT 'not_started',
  "enrollmentDate" character varying,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_course_progress" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_course_progress_companyId"
  ON "hr_course_progress" ("companyId");
