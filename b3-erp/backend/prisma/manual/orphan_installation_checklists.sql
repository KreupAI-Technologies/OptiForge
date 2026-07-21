-- Additive table for the per-check Installation Checklist subsystem.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Column names are quoted to match the TypeORM entity column names exactly.
-- Entity: src/modules/project-management/entities/installation-checklist-item.entity.ts
--
-- Fixes genuine QA data-loss: the six (modules)/installation/* checklist pages
-- previously held HARDCODED item arrays whose per-item Pass/Fail clicks were
-- UI-only (never persisted) and only saved a summary string on Complete. Each
-- per-item result (status, deviation, notes) is now persisted individually.
--
-- Rows are seeded lazily by the service from INSTALLATION_CHECKLIST_TEMPLATES
-- on first read of a (project_id, checklist_type), so no content migration is
-- needed here — only the table DDL.

-- Enum type for checklist_type (idempotent create).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'installation_checklist_items_checklist_type_enum') THEN
    CREATE TYPE "installation_checklist_items_checklist_type_enum" AS ENUM (
      'cabinet-align',
      'trial-wall',
      'accessory-fix',
      'final-align',
      'final-inspection',
      'kitchen-cleaning'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "installation_checklist_items" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" character varying,
  "project_id" character varying NOT NULL,
  "checklist_type" "installation_checklist_items_checklist_type_enum" NOT NULL,
  "item_key" character varying NOT NULL,
  "label" character varying NOT NULL,
  "category" character varying,
  "sub_label" character varying,
  "status" character varying NOT NULL DEFAULT 'Pending',
  "deviation" numeric,
  "notes" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_installation_checklist_items" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_installation_checklist_items_project_type"
  ON "installation_checklist_items" ("project_id", "checklist_type");
