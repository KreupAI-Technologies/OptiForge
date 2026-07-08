-- Additive table for workflow approval comments.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entity: src/modules/workflow/entities/approval-comment.entity.ts

-- Backs the workflow/approvals document-view "comments" panel
-- (GET/POST /workflow/approvals/:id/comments).
CREATE TABLE IF NOT EXISTS "workflow_approval_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "approvalId" character varying NOT NULL,
  "authorId" character varying,
  "authorName" character varying,
  "body" text NOT NULL,
  "metadata" jsonb,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_workflow_approval_comments" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_workflow_approval_comments_approval"
  ON "workflow_approval_comments" ("approvalId");
