-- Orphan Advanced-Features tables (additive). Apply manually; do NOT auto-run.
-- Backs the /advanced-features/ai-insights and /advanced-features/ocr pages.
-- READ-SIDE ONLY. Column names use snake_case to match the Prisma @map()
-- annotations in schema.prisma (AiInsight -> ai_insights, OcrDocument -> ocr_documents).

-- ---------------------------------------------------------------------------
-- AI Insights
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_insights (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id   varchar NOT NULL,
    category     varchar NOT NULL,
    title        varchar NOT NULL,
    description  text,
    severity     varchar NOT NULL DEFAULT 'info',
    confidence   double precision NOT NULL DEFAULT 0,
    module       varchar,
    status       varchar NOT NULL DEFAULT 'new',
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_company_category
    ON ai_insights (company_id, category);

INSERT INTO ai_insights (id, company_id, category, title, description, severity, confidence, module, status)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'test', 'demand-forecast',
   'Q4 demand for stainless work tables projected to rise 18%',
   'Seasonal model detects an upward trend for the SS-WT range. Recommend increasing raw sheet procurement by ~15% ahead of the peak window.',
   'medium', 0.92, 'sales', 'new'),
  ('11111111-1111-1111-1111-111111111102', 'test', 'inventory-optimization',
   'Excess safety stock on 7 slow-moving SKUs',
   'Reorder points for these SKUs exceed observed consumption. Rebalancing could free up an estimated $45k in working capital.',
   'low', 0.87, 'inventory', 'new'),
  ('11111111-1111-1111-1111-111111111103', 'test', 'predictive-maintenance',
   'Hydraulic Press B2 shows abnormal vibration signature',
   'Vibration amplitude trending 2.3x baseline over the last 72 hours. Recommend bearing inspection within 48 hours to avoid unplanned downtime.',
   'high', 0.95, 'production', 'reviewed'),
  ('11111111-1111-1111-1111-111111111104', 'test', 'quality-risk',
   'Weld defect rate on Line 3 above control limit',
   'SPC chart flags 3 consecutive points beyond the upper control limit. Likely fixture drift; recommend recalibration.',
   'high', 0.89, 'quality', 'new'),
  ('11111111-1111-1111-1111-111111111105', 'test', 'workforce-efficiency',
   'Assembly cell utilisation up 1.2% after shift rebalancing',
   'Recent shift pattern change improved throughput without added headcount. Consider extending the pattern to the fabrication cell.',
   'info', 0.78, 'hr', 'actioned'),
  ('11111111-1111-1111-1111-111111111106', 'test', 'procurement-savings',
   'Consolidating fasteners across 3 vendors could cut cost 6%',
   'Overlapping SKUs sourced from multiple vendors at different price points. Consolidation and volume commitment projected to save ~6% annually.',
   'medium', 0.83, 'procurement', 'new')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- OCR Documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocr_documents (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       varchar NOT NULL,
    file_name        varchar NOT NULL,
    doc_type         varchar NOT NULL,
    status           varchar NOT NULL DEFAULT 'queued',
    extracted_fields jsonb,
    confidence       double precision NOT NULL DEFAULT 0,
    uploaded_at      timestamptz NOT NULL DEFAULT now(),
    processed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ocr_documents_company_status
    ON ocr_documents (company_id, status);

INSERT INTO ocr_documents (id, company_id, file_name, doc_type, status, extracted_fields, confidence, uploaded_at, processed_at)
VALUES
  ('22222222-2222-2222-2222-222222222201', 'test', 'invoice_oct_2025.pdf', 'invoice', 'completed',
   '{"vendor":"Acme Industrial Supplies Ltd.","invoiceNumber":"INV-2025-8892","date":"2025-10-24","total":"$4,250.00"}'::jsonb,
   0.985, now() - interval '2 minutes', now() - interval '1 minute'),
  ('22222222-2222-2222-2222-222222222202', 'test', 'po_44120.pdf', 'purchase_order', 'completed',
   '{"poNumber":"PO-44120","supplier":"Bright Steel Co.","total":"$12,800.00"}'::jsonb,
   0.971, now() - interval '20 minutes', now() - interval '19 minutes'),
  ('22222222-2222-2222-2222-222222222203', 'test', 'receipt_fuel_1024.jpg', 'receipt', 'completed',
   '{"merchant":"City Fuel Station","amount":"$88.40","date":"2025-10-24"}'::jsonb,
   0.942, now() - interval '1 hour', now() - interval '58 minutes'),
  ('22222222-2222-2222-2222-222222222204', 'test', 'delivery_challan_7781.pdf', 'delivery_challan', 'processing',
   NULL, 0, now() - interval '3 minutes', NULL),
  ('22222222-2222-2222-2222-222222222205', 'test', 'invoice_scan_blurry.png', 'invoice', 'failed',
   '{"error":"Low image quality — confidence below threshold"}'::jsonb,
   0.31, now() - interval '2 hours', now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222206', 'test', 'grn_5590.pdf', 'goods_receipt', 'queued',
   NULL, 0, now() - interval '30 seconds', NULL)
ON CONFLICT (id) DO NOTHING;
