-- Additive-only DDL for net-new installation endpoints in the
-- project-management module (logistics-installation controller/service).
-- ADDITIVE ONLY: safe to run repeatedly; never DROPs or ALTERs existing tables.
--
-- Wiring notes:
--   Backs the (modules)/installation/* pages:
--     - team-assignment  -> POST /api/logistics-installation/assign-team/:projectId
--                           GET  /api/logistics-installation/team/:projectId
--     - handover         -> GET  /api/logistics-installation/handover-checklist/:projectId
--                           PATCH /api/logistics-installation/handover-checklist/step/:id
--     - progress         -> GET  /api/logistics-installation/progress-summary/:projectId  (read-only aggregate, no table)
--     - management       -> GET  /api/logistics-installation/management-summary/:projectId (read-only aggregate, no table)
--
--   Progress/management summaries aggregate over existing installation tables
--   (installation_tasks, daily_install_reports, site_readiness, tool_deployments,
--   packaging_crates) and require no schema of their own.

-- =============================================================================
-- Installation crew assigned to a project/installation job
--   Entity: InstallationTeamAssignment
--   (src/modules/project-management/entities/installation-team-assignment.entity.ts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "installation_team_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL,
  "installer_id" varchar,
  "installer_name" varchar NOT NULL,
  "role" varchar NOT NULL DEFAULT 'member',
  "skills" jsonb,
  "assigned_by" varchar,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_installation_team_assignments_project"
  ON "installation_team_assignments" ("project_id");

-- =============================================================================
-- 8-step client-handover checklist (workflow items 8.13-8.20)
--   Entity: HandoverChecklistStep
--   (src/modules/project-management/entities/handover-checklist-step.entity.ts)
--   Rows are seeded lazily by the service on first read of a project's
--   checklist, so no seed INSERTs are required here.
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handover_checklist_steps_status_enum') THEN
    CREATE TYPE "handover_checklist_steps_status_enum" AS ENUM ('pending', 'in_progress', 'completed');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "handover_checklist_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL,
  "step_no" integer NOT NULL,
  "title" varchar NOT NULL,
  "status" "handover_checklist_steps_status_enum" NOT NULL DEFAULT 'pending',
  "notes" text,
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_handover_checklist_steps_project"
  ON "handover_checklist_steps" ("project_id");
