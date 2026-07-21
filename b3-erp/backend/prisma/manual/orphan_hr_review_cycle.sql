-- Additive table for HR Performance Review Cycle.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Reuses the prisma table `hr_performance_review_cycles`
-- (model PerformanceReviewCycle). Column names are quoted to match the TypeORM
-- entity column names exactly.
-- Entity: src/modules/hr/entities/review-cycle.entity.ts
-- Backs GET/POST/PUT/DELETE /hr/review-cycles.

CREATE TABLE IF NOT EXISTS "hr_performance_review_cycles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "cycleCode" character varying NOT NULL,
  "cycleName" character varying NOT NULL,
  "description" character varying,
  "cycleType" character varying NOT NULL,
  "fiscalYear" character varying NOT NULL,
  "startDate" timestamp without time zone NOT NULL DEFAULT now(),
  "endDate" timestamp without time zone NOT NULL DEFAULT now(),
  "goalSettingStart" timestamp without time zone,
  "goalSettingEnd" timestamp without time zone,
  "selfAppraisalStart" timestamp without time zone,
  "selfAppraisalEnd" timestamp without time zone,
  "managerReviewStart" timestamp without time zone,
  "managerReviewEnd" timestamp without time zone,
  "peerReviewStart" timestamp without time zone,
  "peerReviewEnd" timestamp without time zone,
  "calibrationStart" timestamp without time zone,
  "calibrationEnd" timestamp without time zone,
  "feedbackStart" timestamp without time zone,
  "feedbackEnd" timestamp without time zone,
  "includeSelfAppraisal" boolean NOT NULL DEFAULT true,
  "includeManagerReview" boolean NOT NULL DEFAULT true,
  "includePeerReview" boolean NOT NULL DEFAULT false,
  "include360Review" boolean NOT NULL DEFAULT false,
  "includeGoals" boolean NOT NULL DEFAULT true,
  "includeCompetencies" boolean NOT NULL DEFAULT true,
  "goalsWeightage" numeric DEFAULT 60,
  "competenciesWeightage" numeric DEFAULT 40,
  "selfAppraisalWeightage" numeric DEFAULT 20,
  "managerReviewWeightage" numeric DEFAULT 60,
  "peerReviewWeightage" numeric DEFAULT 20,
  "ratingScale" character varying NOT NULL DEFAULT '5_point',
  "ratingLabels" jsonb,
  "status" character varying NOT NULL DEFAULT 'draft',
  "companyId" character varying NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_performance_review_cycles" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_hr_performance_review_cycles_companyId"
  ON "hr_performance_review_cycles" ("companyId");
