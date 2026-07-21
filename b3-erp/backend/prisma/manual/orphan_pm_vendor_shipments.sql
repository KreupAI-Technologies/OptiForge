-- Additive-only DDL for project-management vendor shipment tracking endpoints.
-- Safe to run repeatedly; never drops or alters existing tables.

CREATE TABLE IF NOT EXISTS "pm_vendor_shipments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" varchar DEFAULT 'default',
  "project_id" varchar NOT NULL,
  "po_id" varchar,
  "vendor_name" varchar,
  "item_description" varchar,
  "status" varchar DEFAULT 'Pending',
  "carrier" varchar,
  "tracking_number" varchar,
  "expected_delivery" varchar,
  "last_location" varchar,
  "tracking_history" jsonb,
  "notes" text,
  "created_by" varchar,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
