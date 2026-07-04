-- Orphan IoT tables (additive). Apply manually; do NOT auto-run.
-- Backs the /advanced-features/iot device telemetry dashboard.

CREATE TABLE IF NOT EXISTS iot_devices (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId"   varchar NOT NULL,
    code          varchar,
    name          varchar NOT NULL,
    type          varchar,
    status        varchar NOT NULL DEFAULT 'offline',
    temperature   varchar,
    vibration     varchar,
    power         varchar,
    uptime        varchar,
    "lastPing"    varchar,
    meta          json,
    "createdAt"   timestamptz NOT NULL DEFAULT now(),
    "updatedAt"   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iot_devices_company
    ON iot_devices ("companyId");
