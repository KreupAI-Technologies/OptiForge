-- Additive-only table for the in-app documentation / help-center pages.
-- Backs /documentation and /help. Safe to run repeatedly; never drops or
-- alters existing tables. Column names are snake_case to match the Prisma
-- @map("doc_articles") read-side model consumed by the documentation service.

CREATE TABLE IF NOT EXISTS "doc_articles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "company_id" varchar NOT NULL DEFAULT 'default-company-id',
  "category" varchar NOT NULL DEFAULT 'General',
  "title" varchar NOT NULL,
  "slug" varchar NOT NULL,
  "body" text NOT NULL,
  "tags" varchar,
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_doc_articles" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_doc_articles_company_slug" UNIQUE ("company_id", "slug")
);

CREATE INDEX IF NOT EXISTS "IDX_doc_articles_company" ON "doc_articles" ("company_id");
CREATE INDEX IF NOT EXISTS "IDX_doc_articles_category" ON "doc_articles" ("category");

-- Seed ~8 realistic ERP help articles for the default company.
INSERT INTO "doc_articles" ("company_id", "category", "title", "slug", "body", "tags") VALUES
  ('default-company-id', 'Getting Started', 'System Overview', 'system-overview',
   'OptiForge ERP unifies CRM, Sales, Estimation, Production, Inventory, Finance and HR into a single manufacturing platform. This overview walks through the main navigation, the module hub layout, and how records flow from a sales enquiry through to production and invoicing.',
   'overview,navigation,basics'),
  ('default-company-id', 'Getting Started', 'Quick Start Guide', 'quick-start',
   'Log in with your company credentials, then complete the onboarding checklist under Support. Set up your company profile, add users and roles, import master data, and create your first sales order. Most teams are productive within a day.',
   'onboarding,setup'),
  ('default-company-id', 'CRM', 'Managing Customer Interactions', 'customer-interactions',
   'Every call, email and meeting can be logged against a customer. Open a customer record, use the Interactions tab to add a note, set a follow-up date, and link the interaction to an opportunity so your pipeline stays accurate.',
   'crm,customers,interactions'),
  ('default-company-id', 'Sales & Estimation', 'Setting Up BOQ Templates', 'boq-templates',
   'Bill of Quantity templates speed up estimation for repeatable kitchen-equipment projects. Create a template under Estimation > Templates, add standard line items and rates, then apply it to a new estimate and adjust quantities.',
   'estimation,boq,templates'),
  ('default-company-id', 'Production', 'How to Create a Work Order', 'create-work-order',
   'From a confirmed sales order, open Production > Work Orders and click New. Select the product, quantity and target completion date. The system reserves inventory, generates operation steps from the routing, and schedules the order against available capacity.',
   'production,work-order,scheduling'),
  ('default-company-id', 'Inventory', 'Stock and Warehouse Management', 'inventory-basics',
   'Track stock by item, location and lot. Use Inventory > Stock to view on-hand quantities, set reorder points, and trigger replenishment. Goods receipts and issues update balances in real time and post to the general ledger.',
   'inventory,warehouse,stock'),
  ('default-company-id', 'Finance', 'Generating Financial Reports', 'financial-reports',
   'Finance > Reports provides P&L, balance sheet, cash flow and aged receivables. Choose a period and cost centre, run the report, and export to Excel or PDF. Reports can be scheduled to email stakeholders automatically.',
   'finance,reports,accounting'),
  ('default-company-id', 'Administration', 'Security & Permissions', 'security-permissions',
   'Access is controlled by role. Under IT Admin > Roles, define which modules and actions each role can perform, then assign roles to users. Follow least-privilege: grant only the permissions a role needs to do its job.',
   'security,roles,permissions')
ON CONFLICT ("company_id", "slug") DO NOTHING;
