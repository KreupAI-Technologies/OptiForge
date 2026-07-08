-- Additive-only DDL for the generic file-attachment store (attachments module).
-- ADDITIVE ONLY: safe to run repeatedly; never DROPs or ALTERs existing tables.
--
-- Wiring notes:
--   Backs the shared attachments capability (AttachmentsModule):
--     - POST   /api/v1/attachments                  (multipart upload)
--     - POST   /api/v1/attachments/parse-spreadsheet (xlsx/csv -> JSON, no persist)
--     - GET    /api/v1/attachments?entityType=&entityId=
--     - GET    /api/v1/attachments/:id/download      (streams the file)
--     - DELETE /api/v1/attachments/:id
--
--   Files live on local disk under ./uploads keyed by a uuid filename; this
--   table holds the metadata + storage key. Rows are linked to any owning
--   record by the (entity_type, entity_id) pair (e.g. 'project'/<projectId>
--   for installation photos, 'employee'/<employeeId> for HR documents).

-- =============================================================================
-- Generic file attachments
--   Entity: Attachment
--   (src/modules/attachments/entities/attachment.entity.ts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "entityType" varchar NOT NULL,
  "entityId" varchar NOT NULL,
  "fileName" varchar NOT NULL,
  "mimeType" varchar NOT NULL,
  "size" integer NOT NULL DEFAULT 0,
  "storageKey" varchar NOT NULL,
  "uploadedBy" varchar,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_attachments_entity"
  ON "attachments" ("entityType", "entityId");
