# Pending Backend Work — Page by Page

> ## ✅ Core `[BE]` clusters RESOLVED & LIVE — branch `feat/readiness-fixes`
> Implemented full-stack across 4 backend waves + applied to the database.
> - **Endpoints:** 16 new NestJS controllers wired to real UI (loading/error states, no fabricated success). `nest build` exit 0; backend + frontend `tsc` both 0.
> - **Database: APPLIED.** All **12 additive `orphan_*.sql`** migrations (`CREATE TABLE / ADD COLUMN IF NOT EXISTS`, no DROPs) were applied to the live Neon DB via `npm run db:manual` — ledger clean (`db:manual:status` = up to date), tables/columns verified present.
> - **Infra built:** file-upload/storage (`attachments` module → `./uploads`), PDF/Excel generation (pdfkit/exceljs). GST/TDS persist filings + generate documents **locally** (no live GSTN/TRACES portal — needs credentials/certification).
>
> **Not everything on this list was done** — see the [Still Open](#still-open-not-done-this-round) section. Cosmetic `[UI]`/`[RD]` items, several read-only insight modules, and various HR/CRM "coming-soon" sub-sections were intentionally out of scope for this round. Items below are marked `[x]` (done + live) or `[ ]` (open).
>
> _Verification gap: endpoints compile, register, and back real tables, but were not exercised end-to-end against the live DB (no integration tests added). Seed-on-first-read features (period-close checklist, handover steps, alert-rule defaults) populate on first GET._
>
> ---

_Originally generated: 2026-07-08 · updated after backend waves A–B3 + DB apply._

This tracks **actions on wired pages that had no backing endpoint** (net-new backend), plus UI-polish and page-to-build items.

## Legend

| Tag | Meaning |
|---|---|
| **[BE]** | Backend-pending — no endpoint existed; net-new backend work |
| **[UI]** | Endpoint exists — action works but uses an interim `window.prompt`/`alert` (frontend-only polish) |
| **[RD]** | Read-only display gap — a shown field/section has no backend source |
| **[PG]** | Page to build — the route did not exist yet |

Checkbox: `[x]` = implemented full-stack + DB live · `[ ]` = still open.

## Cross-cutting capability clusters

1. ✅ **File upload / storage** — `attachments` module (multer → `./uploads`, `attachments` table). Wired: installation photos, HR documents, HR bulk-punch Excel import.
2. ✅ **PDF / report generation** — shared `report-render.util.ts` (pdfkit/exceljs). Wired: estimation reports, custom reports, financial reports, P&L export, Form-16A.
3. ⚠️ **Statutory (India)** — GST/TDS returns + challans persisted and documents generated **locally**; **live GSTN/TRACES e-filing NOT integrated** (needs govt credentials/certification).
4. ✅ **Read-only → write endpoints** — cycle-count, dock doors, workflow approvals/automation, replenishment, alert-rules now have write endpoints. (Procurement *insight* modules below remain read-only by design.)

---

## finance

- [x] **[BE]** `finance/tax/gst/page.tsx` — Import GSTR-2A / File Return / Download Return → `finance/gst/*` (`gst_returns`), pdf/excel. *(local, no live GSTN)*
- [x] **[BE]** `finance/tax/tds/page.tsx` — TDS returns + challans + Form-16A → `finance/tds/*` (`tds_returns`, `tds_challans`). *(local, no live TRACES)*
- [x] **[BE]** `finance/accounting/periods/page.tsx` — period-close checklist → `finance/period-close/*` (`period_close_steps`)
- [x] **[BE]** `finance/accounting/chart-of-accounts/page.tsx` — bulk import → `POST finance/chart-of-accounts/bulk-import`
- [x] **[BE]** `finance/reports/profit-loss/page.tsx` — `GET finance/profit-loss/export?format=pdf|excel`
- [ ] **[UI]** `finance/reconciliation/page.tsx` — Match uses `window.prompt` (endpoint exists; needs picker modal)
- [ ] **[UI]** `finance/payment-verification/page.tsx` — reject reason via `window.prompt`
- [ ] **[RD]** `finance/assets/page.tsx` — recent-activity list has no backend source
- [ ] **[RD]** `finance/cash/page.tsx` — bankBalance split / cashInHand / overdraftLimit no source

## inventory

- [x] **[BE]** `inventory/cycle-count/page.tsx` — create/start/save/complete → `inventory/cycle-counts/*` (endpoints exposed; table pre-existed)
- [x] **[BE]** `inventory/replenishment/auto/page.tsx` — config CRUD + toggle (`auto_replenishment_configs`)
- [x] **[BE]** `inventory/replenishment/rules/page.tsx` — rule create + delete (`reorder_rules`)
- [x] **[BE]** `inventory/replenishment/create/page.tsx` — submit request (`replenishment_requests`)
- [ ] **[BE]** `inventory/tracking/barcode/page.tsx` — bulk barcode import + label print/generation *(not done — label-gen)*
- [ ] **[UI]** `inventory/settings/uom/page.tsx` · `settings/categories` · `adjustments/approvals` · `movements` — `window.prompt` interim (endpoints exist)

## production

- [x] **[BE]** `production/bom/add/page.tsx` — JSON BOM import + assembly templates (`production_bom_templates`)
- [x] **[BE]** `production/work-orders/add/page.tsx` — BOM explosion (`GET production/bom/:ref/explosion`) + item resolution
- [x] **[BE]** `production/quality/add/page.tsx` — quality-specs (`GET production/quality-specs`)
- [x] **[BE]** `production/scheduling/page.tsx` — schedule-lines `/publish` + `/optimize`
- [x] **[BE]** `production/capacity-planning/page.tsx` — optimize + overtime planning
- [x] **[BE]** `production/mrp/page.tsx` — bulk PR creation (`POST production/mrp/bulk-requisitions`)
- [x] **[BE]** `production/planning/page.tsx` — generate work-orders from plan *(what-if scenario persistence still open)*
- [x] **[BE]** `production/maintenance/spares/page.tsx` — Create PO → procurement PR (`POST production/spare-parts/:id/create-po`)
- [x] **[BE]** `production/shopfloor/page.tsx` — material-request pull + shift attendance (`production_shopfloor_*`)

## procurement

- [x] **[BE]** `procurement/purchase-orders/approval/page.tsx` — Delegate + Request-Info (PO columns added)
- [x] **[BE]** `procurement/grn/view/[id]/page.tsx` — invoice-matching (`POST procurement/goods-receipts/:id/match-invoice`)
- [x] **[BE]** `procurement/orders/add/page.tsx` — bulk import (JSON rows → `POST purchase-orders/bulk-import`)
- [x] **[BE]** `procurement/purchase-requisition/page.tsx` — `request_info` action
- [ ] **[BE]** `procurement/rfq-rfp/page.tsx` — bid shortlist/reject, bid detail, RFQ settings/templates *(not done)*
- [ ] **[BE]** `procurement/advanced-features/page.tsx` — "Coming Soon" feature tabs *(not done)*
- [ ] **[UI]** `procurement/requisitions/page.tsx` · `purchase-orders/view/[id]` — `window.prompt` interim
- [ ] **[BE]** Read-only insight modules (`compliance`, `e-marketplace`, `quality-assurance`, `risk-management`, `strategic-sourcing`, `supplier-diversity`, `supplier-onboarding`, `supplier-relationship`) — no write endpoints *(read-only by design; open only if write actions needed)*
- [ ] **[UI]** Delegated cards (`contract-management`, `category-management`, `savings-tracker`, `supplier-scorecard`) — form-building pass

## installation

- [x] **[BE]** `installation/team-assignment/page.tsx` — `POST assign-team/:projectId` (`installation_team_assignments`)
- [x] **[BE]** `installation/photo-doc/page.tsx` — real file upload (attachments module)
- [x] **[BE]** `installation/handover/page.tsx` — 8-step checklist + step-update (`handover_checklist_steps`)
- [x] **[BE]** `installation/progress/page.tsx` · `management/page.tsx` — aggregate read endpoints

## logistics

- [x] **[BE]** `logistics/warehouse/dock/page.tsx` — dock-door create/update
- [x] **[BE]** `logistics/site-notification/page.tsx` · `transporter-notification/page.tsx` — POST notify (records to `logistics_notification_logs`; no real SMS/email provider)
- [x] **[BE]** `logistics/delivery-confirmation/page.tsx` — deliver-by-project linkage → `shipments/:id/deliver`
- [ ] **[BE]** `logistics/analytics/optimization/page.tsx` — route optimization (routes have no backend id) *(not done)*

## estimation

- [x] **[BE]** `estimation/analytics/reports/page.tsx` — report generation/download (pdf/excel/csv)
- [x] **[BE]** `estimation/analytics/reports/custom/page.tsx` — ad-hoc custom report generation
- [x] **[BE]** `estimation/workflow/send/[id]/page.tsx` — customer-delivery record (`estimation_send_records`)
- [ ] **[BE]** `estimation/workflow/pending/view/[id]/page.tsx` — PDF export *(not explicitly done)*
- [ ] **[UI]** `estimation/advanced-features/page.tsx` — risk description via `window.prompt`

## cpq

- [~] **[BE]** `cpq/advanced-features/page.tsx` — ✅ pricing-version-control + approval-matrix (`cpq_pricing_versions`, `cpq_approval_matrix`); ⬜ guided-selling, document-gen, e-signature, margin-guardrails **left in honest "not available" state**
- [x] **[BE]** `cpq/quotes/templates/page.tsx` — `isFavorite` column + toggle endpoint
- [ ] **[BE]** `cpq/integration/cad/page.tsx` · `integration/ecommerce/page.tsx` — View-quote "coming soon" *(not done)*

## workflow

- [x] **[BE]** `workflow/approvals/page.tsx` — `:id/attachments` + `:id/comments` (`workflow_approval_comments`) + document view
- [x] **[BE]** `workflow/templates/page.tsx` — `POST /workflow/templates/import`
- [x] **[BE]** `workflow/automation/page.tsx` — `POST /workflow/automation-rules/:id/run`

## it-admin

- [x] **[BE]** `it-admin/security/alerts/page.tsx` — alert-rules CRUD + toggle (`it_alert_rules`, seeded)
- [x] **[BE]** `it-admin/security/password/page.tsx` — per-user password-status (read-only aggregation)
- [ ] **[PG]** `it-admin/users/[id]/page.tsx` + `[id]/edit/page.tsx` — detail/edit pages to build (endpoints exist) *(not done)*

## common-masters

- [x] **[BE]** `common-masters/uom-conversion-master/page.tsx` — uom-conversions CRUD routes exposed
- [x] ~~country-master / currency-master write routes~~ — done earlier (`f77df7a6`)

## reports

- [x] **[BE]** `reports/custom/page.tsx` — run/render + export (reuses `ReportSavedItem`/`ReportDataset`)
- [x] **[BE]** `reports/financial/page.tsx` — report generation/download

## Still open (not done this round)

The following were **intentionally out of scope** and remain open. Grouped by type:

**[BE] net-new (open):**
- `procurement/rfq-rfp` (bid shortlist/reject, settings/templates), `procurement/advanced-features` tabs
- procurement read-only insight modules ×8 (write endpoints only if actions required)
- `cpq/advanced-features` remaining 4 tabs (guided-selling, doc-gen, e-signature, margin-guardrails), `cpq/integration/{cad,ecommerce}` view-quote
- `crm/advanced-features/{account-hierarchy, activity-timeline}`
- `projects/resources` (transfer/balance/request/skills/log-time), `project-management/settings` reset
- `logistics/analytics/optimization` route-optimization
- `estimation/workflow/pending/view/[id]` PDF export; `production/planning` what-if persistence
- `inventory/tracking/barcode` bulk import + label print
- `rfq/view/[id]` linked-PR view
- HR "coming-soon" sub-sections: `hr-compliance` (6), `training-development` (6), `asset-management` (8), `performance-management` reports, `training/elearning/library`, `alumni/network` comments

**[PG] pages to build (open):** `it-admin/users/[id]` + `[id]/edit`

**[UI] cosmetic (endpoint exists, open):** finance reconciliation/payment-verification, inventory uom/categories/adjustments/movements, procurement requisitions/PO-view + delegated cards, estimation advanced-features, crm leads/assignment, hr onboarding

**[RD] display gaps (open):** finance assets/cash, project-management capacity/view

## Summary

| Tag | Done + live | Still open |
|---|---|---|
| **[BE]** core clusters | ~40 pages across 13 modules | ~25 (insight modules, HR sub-sections, misc net-new) |
| **[UI]** cosmetic | 0 | ~13 (all functional; polish only) |
| **[RD]** display gaps | 0 | ~4 |
| **[PG]** pages to build | 0 | 1 (2 routes) |

**Bottom line:** the four cross-cutting capabilities (file-upload, PDF/report-gen, statutory-doc-gen, read-only→write) and the highest-value module actions are **implemented and DB-live**. The remaining open items are lower-value long-tail (insight dashboards, HR coming-soon shells, cosmetic prompt→modal swaps) and one external-integration gap (live GSTN/TRACES e-filing).
</content>
