-- Additive tables for orphaned After-Sales Service pages.
-- ADDITIVE ONLY: never DROP or ALTER existing tables.
--
-- Wiring notes:
--   The warranty claims list page (/after-sales-service/warranties/claims)
--   and the claims approvals page
--   (/after-sales-service/warranties/claims/approvals) are now served by the
--   new GET /api/v1/after-sales/warranties/claims endpoint. That endpoint is
--   backed by the existing in-memory WarrantiesService (WarrantyClaim model in
--   src/modules/after-sales-service/entities/warranty.entity.ts), consistent
--   with the rest of that service's warranty/claim handling, which is not yet
--   persisted to PostgreSQL.
--
--   No new database tables are required for these pages. This file is kept as a
--   placeholder so future persistence work for warranty claims lands here.

-- =============================================================================
-- Knowledge base FAQs
--   Backs GET /api/v1/after-sales-service/knowledge-faqs
--   (KnowledgeFaq entity / KnowledgeFaqService), wiring the previously
--   mock-only /after-sales-service/knowledge/faqs page.
-- =============================================================================
CREATE TABLE IF NOT EXISTS "as_knowledge_faqs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "question" character varying(500) NOT NULL,
  "answer" text NOT NULL,
  "category" character varying(100) NOT NULL DEFAULT 'General',
  "helpful" integer NOT NULL DEFAULT 0,
  "unhelpful" integer NOT NULL DEFAULT 0,
  "views" integer NOT NULL DEFAULT 0,
  "featured" boolean NOT NULL DEFAULT false,
  "status" character varying(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_as_knowledge_faqs" PRIMARY KEY ("id")
);

-- =============================================================================
-- Knowledge base product manuals
--   Backs GET /api/v1/after-sales-service/knowledge-manuals
--   (KnowledgeManual entity / KnowledgeManualService), wiring the previously
--   mock-only /after-sales-service/knowledge/manuals page.
-- =============================================================================
CREATE TABLE IF NOT EXISTS "as_knowledge_manuals" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "title" character varying(255) NOT NULL,
  "productModel" character varying(100),
  "description" text,
  "category" character varying(100) NOT NULL DEFAULT 'General',
  "author" character varying(150),
  "datePublished" date,
  "fileSize" character varying(50),
  "format" character varying(20) NOT NULL DEFAULT 'pdf',
  "downloads" integer NOT NULL DEFAULT 0,
  "rating" numeric(3,1) NOT NULL DEFAULT 0,
  "views" integer NOT NULL DEFAULT 0,
  "language" character varying(50) NOT NULL DEFAULT 'English',
  "pages" integer NOT NULL DEFAULT 0,
  "versions" integer NOT NULL DEFAULT 1,
  "featured" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_as_knowledge_manuals" PRIMARY KEY ("id")
);

-- =============================================================================
-- After-sales overview snapshot (KPI tiles + recent tickets)
--   Persistence contract for the after-sales-service landing page overview and
--   the advanced-features Live SLA tracking view. Backs
--   GET /api/v1/after-sales/overview and GET /api/v1/after-sales/overview/sla-live
--   (AfterSalesOverviewService / AfterSalesOverviewController). Rows are seeded
--   in memory in the service so the pages render without a schema migration;
--   this table is the additive, idempotent persistence contract.
-- =============================================================================
CREATE TABLE IF NOT EXISTS "as_overview_snapshot" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "snapshotDate" date NOT NULL DEFAULT CURRENT_DATE,
  "totalTickets" integer NOT NULL DEFAULT 0,
  "openTickets" integer NOT NULL DEFAULT 0,
  "resolvedTickets" integer NOT NULL DEFAULT 0,
  "avgResolutionTime" numeric(6,2) NOT NULL DEFAULT 0,
  "customerSatisfaction" numeric(3,1) NOT NULL DEFAULT 0,
  "activeServiceCalls" integer NOT NULL DEFAULT 0,
  "warrantyClaimsThisMonth" integer NOT NULL DEFAULT 0,
  "technicianUtilization" numeric(5,2) NOT NULL DEFAULT 0,
  "pendingParts" integer NOT NULL DEFAULT 0,
  "scheduledVisits" integer NOT NULL DEFAULT 0,
  "slaCompliance" numeric(5,2) NOT NULL DEFAULT 0,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_as_overview_snapshot" PRIMARY KEY ("id")
);

INSERT INTO "as_overview_snapshot" (
  "id", "snapshotDate", "totalTickets", "openTickets", "resolvedTickets",
  "avgResolutionTime", "customerSatisfaction", "activeServiceCalls",
  "warrantyClaimsThisMonth", "technicianUtilization", "pendingParts",
  "scheduledVisits", "slaCompliance"
)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 234, 45, 178,
  4.5, 4.6, 23, 12, 78.5, 8, 15, 92.5
WHERE NOT EXISTS (
  SELECT 1 FROM "as_overview_snapshot"
  WHERE "id" = '00000000-0000-0000-0000-000000000001'::uuid
);
