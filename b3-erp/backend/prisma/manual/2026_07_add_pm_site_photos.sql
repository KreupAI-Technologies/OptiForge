-- Persistent store for geo-tagged site-visit photos (mobile-api).
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/project-management/entities/site-photo.entity.ts
-- Backs GET /mobile-api/photos/:projectId, POST /mobile-api/upload-photo/:projectId,
-- and DELETE /mobile-api/photo/:id.

CREATE TABLE IF NOT EXISTS "pm_site_photos" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "project_id" character varying NOT NULL,
  "photo_url" text,
  "description" character varying,
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_pm_site_photos" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_pm_site_photos_project"
  ON "pm_site_photos" ("project_id");
