-- ============================================================================
-- Manual DDL — Notifications module orphan tables
--
-- Backs the net-new notification preferences read/write endpoints
--   GET /notifications/preferences/:userId
--   PUT /notifications/preferences/:userId
-- consumed by frontend /notifications/preferences.
--
-- The whole NotificationPreferences object (enabled, pushEnabled, soundEnabled,
-- categories, modules, quietHours) is stored as a single JSONB blob keyed by
-- userId, so the schema does not need to change as the preference shape evolves.
--
-- Additive / idempotent only (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT
-- EXISTS). Safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "notification_user_preferences" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" character varying(100) NOT NULL,
  "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_notification_user_preferences" PRIMARY KEY ("id")
);

-- One preferences row per user.
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_notification_user_preferences_user"
  ON "notification_user_preferences" ("userId");

-- Seed a couple of idempotent default rows so the read endpoint returns data
-- out of the box. ON CONFLICT keeps re-runs harmless.
INSERT INTO "notification_user_preferences" ("userId", "preferences")
VALUES
  ('user-001', '{
    "enabled": true,
    "pushEnabled": false,
    "soundEnabled": true,
    "categories": {
      "alert": { "enabled": true, "push": true, "sound": true },
      "approval": { "enabled": true, "push": true, "sound": true },
      "mention": { "enabled": true, "push": true, "sound": false },
      "update": { "enabled": true, "push": false, "sound": false },
      "reminder": { "enabled": true, "push": true, "sound": true },
      "system": { "enabled": true, "push": false, "sound": false }
    },
    "modules": {},
    "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" }
  }'::jsonb),
  ('demo-user', '{
    "enabled": true,
    "pushEnabled": false,
    "soundEnabled": true,
    "categories": {
      "alert": { "enabled": true, "push": true, "sound": true },
      "approval": { "enabled": true, "push": true, "sound": true },
      "mention": { "enabled": true, "push": true, "sound": false },
      "update": { "enabled": true, "push": false, "sound": false },
      "reminder": { "enabled": true, "push": true, "sound": true },
      "system": { "enabled": true, "push": false, "sound": false }
    },
    "modules": {},
    "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" }
  }'::jsonb)
ON CONFLICT ("userId") DO NOTHING;
