-- Additive-only table for logistics notification records.
-- Safe to run repeatedly. Never drops or alters existing tables.
--
-- Column names are quoted to match the TypeORM entity property names
-- (camelCase), which is how the NotificationLog entity reads/writes this table.
--
-- This backs the site-notification and transporter-notification pages. It
-- persists the notification event only — no external SMS/email provider is
-- integrated; records are stored with status 'sent'.

-- ---------------------------------------------------------------------------
-- Logistics Notification Logs — POST /logistics/notifications/notify
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_notification_logs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "audience" varchar(30) NOT NULL,
  "channel" varchar(30) NOT NULL DEFAULT 'in_app',
  "projectId" varchar(100),
  "woNumber" varchar(50),
  "coordinationId" varchar(100),
  "subject" varchar(200),
  "message" text,
  "recipients" text,
  "recipientCount" integer NOT NULL DEFAULT 0,
  "status" varchar(30) NOT NULL DEFAULT 'sent',
  "createdBy" varchar(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_notification_logs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_logistics_notification_logs_audience"
  ON "logistics_notification_logs" ("audience");

CREATE INDEX IF NOT EXISTS "IDX_logistics_notification_logs_projectId"
  ON "logistics_notification_logs" ("projectId");
