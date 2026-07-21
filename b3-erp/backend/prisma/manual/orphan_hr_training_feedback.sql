-- Additive table for HR Training Feedback.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_training_feedback` (model TrainingFeedback).
-- Entity: src/modules/hr/entities/training-feedback.entity.ts
-- Backs GET/POST /hr/training-feedback.

CREATE TABLE IF NOT EXISTS "hr_training_feedback" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" character varying NOT NULL,
  "scheduleId" character varying,
  "programId" character varying,
  "enrollmentId" character varying,
  "employeeId" character varying,
  "employeeName" character varying,
  "rating" integer,
  "contentRating" integer,
  "instructorRating" integer,
  "relevanceRating" integer,
  "paceRating" integer,
  "comments" text,
  "strengths" text,
  "improvements" text,
  "isAnonymous" boolean NOT NULL DEFAULT false,
  "wouldRecommend" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_training_feedback" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_training_feedback_companyId"
  ON "hr_training_feedback" ("companyId");
