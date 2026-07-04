-- =====================================================================
-- Additive orphan tables for after-sales-service pages
-- =====================================================================
-- These tables back frontend pages that had no fitting endpoint.
-- ADDITIVE ONLY: append new CREATE TABLE statements here; never alter or
-- drop existing tables. Not auto-run — apply manually against the domain
-- Postgres if/when persistence is required (services currently seed in
-- memory to serve the pages).
-- =====================================================================

-- Shared discriminator table for after-sales feedback flows:
-- complaints | rating | nps | survey
CREATE TABLE IF NOT EXISTS as_service_feedback (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type varchar(20) NOT NULL DEFAULT 'complaint',
  reference     varchar(100),
  customer_name varchar(200),
  subject       varchar(200),
  description    text,
  category      varchar(100),
  priority      varchar(20),
  status        varchar(30) NOT NULL DEFAULT 'open',
  score         numeric(4,2),
  service_type  varchar(30),
  region        varchar(100),
  assigned_to   varchar(200),
  meta          jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_as_service_feedback_type ON as_service_feedback (feedback_type);

-- Shared discriminator table for after-sales spare-parts movements:
-- requisition | consumption | return
CREATE TABLE IF NOT EXISTS as_parts_movement (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_type varchar(20) NOT NULL DEFAULT 'requisition',
  reference     varchar(100),
  job_number    varchar(100),
  engineer      varchar(200),
  customer_name varchar(200),
  status        varchar(30) NOT NULL DEFAULT 'pending',
  priority      varchar(20),
  total_items   int NOT NULL DEFAULT 0,
  total_value   numeric(12,2) NOT NULL DEFAULT 0,
  warehouse     varchar(100),
  reason        varchar(200),
  items         jsonb,
  meta          jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_as_parts_movement_type ON as_parts_movement (movement_type);

-- Troubleshooting guides (knowledge base variant)
CREATE TABLE IF NOT EXISTS as_troubleshooting_guides (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          varchar(300) NOT NULL,
  category       varchar(100) NOT NULL DEFAULT 'General',
  difficulty     varchar(20) NOT NULL DEFAULT 'medium',
  estimated_time varchar(100),
  symptom        text,
  steps          jsonb,
  views          int NOT NULL DEFAULT 0,
  helpful        int NOT NULL DEFAULT 0,
  success_rate   numeric(4,2) NOT NULL DEFAULT 0,
  status         varchar(20) NOT NULL DEFAULT 'published',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Shared discriminator table for after-sales analytics records:
-- technician | ftf
CREATE TABLE IF NOT EXISTS as_service_analytics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type varchar(20) NOT NULL DEFAULT 'technician',
  name        varchar(200),
  region      varchar(100),
  category    varchar(100),
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_as_service_analytics_type ON as_service_analytics (metric_type);
