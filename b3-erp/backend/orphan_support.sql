-- Orphan support tables (additive). Apply manually; do NOT auto-run.
-- Backs pages whose primary data list previously had no persistence.

-- /support/reports — report-template catalog
CREATE TABLE IF NOT EXISTS support_report_templates (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId"    varchar NOT NULL,
    name           varchar NOT NULL,
    category       varchar,
    description    text,
    frequency      varchar NOT NULL DEFAULT 'On-Demand',
    format         json,
    recipients     integer NOT NULL DEFAULT 0,
    scheduled      boolean NOT NULL DEFAULT false,
    popularity     integer NOT NULL DEFAULT 0,
    "lastGenerated" varchar,
    meta           json,
    "createdAt"    timestamptz NOT NULL DEFAULT now(),
    "updatedAt"    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_report_templates_company
    ON support_report_templates ("companyId");
