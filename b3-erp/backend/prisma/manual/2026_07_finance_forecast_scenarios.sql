-- Saved cash-flow forecast scenarios with assumptions.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
-- Entity: src/modules/finance/entities/forecast-scenario.entity.ts
-- Backs CRUD @Controller('finance/forecast-scenarios').

CREATE TABLE IF NOT EXISTS "finance_forecast_scenario" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" character varying(255) NOT NULL,
  "assumptions" jsonb,
  "horizon_months" integer NOT NULL DEFAULT 12,
  "growth_rate" numeric(8,4) NOT NULL DEFAULT 0,
  "company_id" character varying(100),
  "created_at" timestamp without time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_finance_forecast_scenario" PRIMARY KEY ("id")
);
