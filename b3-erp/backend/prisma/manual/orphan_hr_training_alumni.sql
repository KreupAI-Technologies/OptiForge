-- ============================================================================
-- orphan_hr_training_alumni.sql
-- ADDITIVE ONLY — CREATE TABLE IF NOT EXISTS, no DROPs, idempotent.
-- Backs the alumni-network comment feature (/hr/alumni-comments).
-- Style-matched to orphan_hr.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "hr_alumni_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar NOT NULL,
  "postId" varchar NOT NULL,
  "alumniId" varchar,
  "authorId" varchar,
  "authorName" varchar,
  "body" text NOT NULL,
  "status" varchar NOT NULL DEFAULT 'active',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_hr_alumni_comments" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_hr_alumni_comments_companyId" ON "hr_alumni_comments" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_hr_alumni_comments_postId" ON "hr_alumni_comments" ("postId");
