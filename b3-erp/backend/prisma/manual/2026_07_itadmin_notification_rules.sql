-- IT-Admin notification rules (ADDITIVE + IDEMPOTENT ONLY)
-- Backs the net-new NotificationRule entity / it-admin/notification-rules CRUD.
-- Event-driven "when X happens, notify Y via channel Z" automation rules.
-- Never DROP/ALTER existing tables.

CREATE TABLE IF NOT EXISTS "it_notification_rules" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar,
  "name" varchar(200) NOT NULL,
  "description" text,
  "event_type" varchar(150) NOT NULL,
  "channel" varchar(20) NOT NULL DEFAULT 'email',
  "recipients" jsonb,
  "conditions" jsonb,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "PK_it_notification_rules" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_it_notification_rules_company"
  ON "it_notification_rules" ("companyId");
