# Pending Backend Work — Page by Page

_Generated: 2026-07-08 · branch `main` · HEAD `1db4e41a`._

This is the **open work only** — pages whose UI actions are **not fully covered by a backend endpoint**. Everything in the earlier not-wired (67) and partially-wired (391) audits is already merged into `main`; those pages fetch and render live data. What remains below are specific **actions** on otherwise-wired pages that have **no backing endpoint** (net-new backend), plus a few UI-polish and page-to-build items.

## How this list was built (so nothing is missed)

1. **Evidence scan** — grepped every `.tsx`/`.ts` under `b3-erp/frontend/src` for pending markers: `not yet available`, `no backend endpoint`, `coming soon`, `not implemented`, `window.prompt`, `window.alert`, `TODO/FIXME/HACK`, `NEEDS BACKEND`. Each item below cites the exact `file:line`.
2. **Backlog cross-reference** — reconciled against [`needs-backend-backlog.md`](./needs-backend-backlog.md).
3. **Tree enumeration** — for backlog items naming whole page-trees with no literal marker (procurement read-only insight modules, it-admin security, installation), enumerated every `page.tsx` in the tree.

All paths are under `b3-erp/frontend/src/app/`. The `(modules)` route group is omitted from headers but kept in paths.

## Legend

| Tag | Meaning |
|---|---|
| **[BE]** | **Backend-pending** — no endpoint exists; real net-new backend work |
| **[UI]** | Endpoint exists — action works but uses an interim `window.prompt`/`alert`; replace with a proper modal (frontend-only) |
| **[RD]** | Read-only display gap — a shown field/section has no backend source |
| **[PG]** | Page to build — the route does not exist yet (endpoints may exist) |

## Cross-cutting capability clusters

Most **[BE]** items collapse into four net-new backend capabilities. Building these unblocks many pages at once:

1. **File upload / storage** — installation photos, Excel/CSV bulk imports, document attachments
2. **PDF / report generation & rendering** — estimation reports, P&L export, quote documents, Form-16A, custom reports
3. **Statutory e-filing (India)** — GST returns (GSTR-2A / filing / download), TDS returns + challans
4. **Read-only / in-memory modules needing write endpoints** — procurement insight modules, cycle-count, dock doors, workflow automation/approvals

---

## finance

- [ ] **[BE]** `finance/tax/gst/page.tsx` — Import GSTR-2A, File Return, Download Return; no GST-portal endpoints _(L234, L374, L379, L405)_
- [ ] **[BE]** `finance/tax/tds/page.tsx` — Form-16A generation, File Return (TRACES), Download Return/Challan; no TDS returns/challans endpoints _(L180, L230)_
- [ ] **[BE]** `finance/accounting/periods/page.tsx` — period-close checklist modals (inventory valuation, accruals, mgmt review); no endpoints
- [ ] **[BE]** `finance/accounting/chart-of-accounts/page.tsx` — bulk import; no import endpoint
- [ ] **[BE]** `finance/reports/profit-loss/page.tsx` — verify `/finance/profit-loss/export/pdf|excel` exist server-side (part of PDF cluster)
- [ ] **[UI]** `finance/reconciliation/page.tsx` — Match uses `window.prompt` for GL-entry id; endpoint exists, needs a picker modal _(L113)_
- [ ] **[UI]** `finance/payment-verification/page.tsx` — reject reason via `window.prompt`; endpoint exists _(L119)_
- [ ] **[RD]** `finance/assets/page.tsx` — recent-activity list has no backend source (left empty, not mocked) _(L81)_
- [ ] **[RD]** `finance/cash/page.tsx` — bankBalance split / cashInHand / overdraftLimit have no backend source _(L84)_

## inventory

- [ ] **[BE]** `inventory/cycle-count/page.tsx` — create/schedule, start session, perform-count/save, complete/reconcile; backend is read-only _(L305, L310, L315, L371, L397, L406)_
- [ ] **[BE]** `inventory/replenishment/auto/page.tsx` — auto-replenishment config CRUD + toggle _(L253, L330, L342)_
- [ ] **[BE]** `inventory/replenishment/rules/page.tsx` — DELETE reorder-rule + "New Rule" create _(L182, L398)_
- [ ] **[BE]** `inventory/replenishment/create/page.tsx` — submit replenishment-request; no create endpoint _(L344, L353)_
- [ ] **[BE]** `inventory/tracking/barcode/page.tsx` — bulk barcode import + label print/generation _(L166, L174)_
- [ ] **[UI]** `inventory/settings/uom/page.tsx` — create/edit UOM via `window.prompt`; endpoint exists _(L131, L133, L262)_
- [ ] **[UI]** `inventory/settings/categories/page.tsx` — create/edit category via `window.prompt`; endpoint exists _(L119, L236)_
- [ ] **[UI]** `inventory/adjustments/approvals/page.tsx` — reject reason via `window.prompt`; endpoint exists _(L170)_
- [ ] **[UI]** `inventory/movements/page.tsx` — update remarks via `window.prompt`; endpoint exists _(L387)_

## production

- [ ] **[BE]** `production/bom/add/page.tsx` — Excel BOM import parse + assembly templates (`/bom-templates`) _(L917, L1123)_
- [ ] **[BE]** `production/work-orders/add/page.tsx` — BOM explosion endpoint (`GET production/bom/:ref/explosion`); PR itemCode→itemId resolution
- [ ] **[BE]** `production/quality/add/page.tsx` — product-master quality-specs endpoint (GET product/WO quality-specs) _(L720, L722)_
- [ ] **[BE]** `production/scheduling/page.tsx` — schedule-lines `/publish` + `/optimize` (only production-schedules has them)
- [ ] **[BE]** `production/capacity-planning/page.tsx` — schedule optimize + overtime planning routes _(L604, L610)_
- [ ] **[BE]** `production/mrp/page.tsx` — bulk purchase-requisition creation _(L724)_
- [ ] **[BE]** `production/planning/page.tsx` — generate production/work-orders from plan; what-if scenario persistence _(L359)_
- [ ] **[BE]** `production/maintenance/spares/page.tsx` — Create PO (procurement) reachable endpoint _(L159)_
- [ ] **[BE]** `production/shopfloor/page.tsx` — material-request pull endpoint; End Shift / attendance endpoint _(L143)_

## procurement

- [ ] **[BE]** `procurement/purchase-orders/approval/page.tsx` — Delegate / Request-Info endpoints
- [ ] **[BE]** `procurement/grn/view/[id]/page.tsx` — invoice-matching endpoint _(L497)_
- [ ] **[BE]** `procurement/orders/add/page.tsx` — bulk import/parse endpoint (PR/RFQ load is interim `window.prompt`) _(L338, L369, L400)_
- [ ] **[BE]** `procurement/rfq-rfp/page.tsx` — bid shortlist/reject, bid detail, RFQ settings/templates
- [ ] **[BE]** `procurement/purchase-requisition/page.tsx` — `request_info` action
- [ ] **[BE]** `procurement/advanced-features/page.tsx` — "Coming Soon" feature tabs _(L380)_
- [ ] **[UI]** `procurement/requisitions/page.tsx` — reject reason via `window.prompt`; endpoint exists _(L196)_
- [ ] **[UI]** `procurement/purchase-orders/view/[id]/page.tsx` — cancel reason via `window.prompt`; endpoint exists _(L71)_

**Read-only insight modules** — no write endpoints; need net-new backend only *if* write actions are required:

- [ ] **[BE]** `procurement/compliance/page.tsx`
- [ ] **[BE]** `procurement/e-marketplace/page.tsx`
- [ ] **[BE]** `procurement/quality-assurance/page.tsx`
- [ ] **[BE]** `procurement/risk-management/page.tsx`
- [ ] **[BE]** `procurement/strategic-sourcing/page.tsx`
- [ ] **[BE]** `procurement/supplier-diversity/page.tsx`
- [ ] **[BE]** `procurement/supplier-onboarding/page.tsx`
- [ ] **[BE]** `procurement/supplier-relationship/page.tsx`

**Delegated cards** — endpoints exist; need real create/edit forms (form-building pass, not backend):

- [ ] **[UI]** `procurement/contract-management/page.tsx`
- [ ] **[UI]** `procurement/category-management/page.tsx`
- [ ] **[UI]** `procurement/savings-tracker/page.tsx`
- [ ] **[UI]** `procurement/supplier-scorecard/page.tsx`

## installation

- [ ] **[BE]** `installation/team-assignment/page.tsx` — dedicated POST assign-team/:projectId (currently daily-report manpower)
- [ ] **[BE]** `installation/photo-doc/page.tsx` — file-upload endpoint (photos staged client-side) — *file-upload cluster*
- [ ] **[BE]** `installation/handover/page.tsx` — 8-step handover-checklist read model + step-update endpoint
- [ ] **[BE]** `installation/progress/page.tsx` — purpose-built aggregate installation read endpoints
- [ ] **[BE]** `installation/management/page.tsx` — purpose-built aggregate installation read endpoints

## logistics

- [ ] **[BE]** `logistics/warehouse/dock/page.tsx` — dock-door create/update endpoint (currently read-only) _(L284)_
- [ ] **[BE]** `logistics/site-notification/page.tsx` — POST notify (real SMS/email dispatch)
- [ ] **[BE]** `logistics/transporter-notification/page.tsx` — POST notify (real SMS/email dispatch)
- [ ] **[BE]** `logistics/delivery-confirmation/page.tsx` — Project→shipment linkage to reach `shipments/:id/deliver`
- [ ] **[BE]** `logistics/analytics/optimization/page.tsx` — route optimization (routes have no backend identifier) _(L200)_

## estimation

- [ ] **[BE]** `estimation/analytics/reports/page.tsx` — report file generation/download _(L125, L132, L155)_
- [ ] **[BE]** `estimation/analytics/reports/custom/page.tsx` — ad-hoc custom report generation/render _(L136, L141)_
- [ ] **[BE]** `estimation/workflow/pending/view/[id]/page.tsx` — PDF export
- [ ] **[BE]** `estimation/workflow/send/[id]/page.tsx` — customer-delivery/email endpoint
- [ ] **[UI]** `estimation/advanced-features/page.tsx` — risk description via `window.prompt` _(L408)_

## cpq

- [ ] **[BE]** `cpq/advanced-features/page.tsx` — 6 tabs lack entities: pricing version control, guided-selling wizard, approval matrix, document generator + PDF, e-signature, margin guardrails _(L36)_
- [ ] **[BE]** `cpq/quotes/templates/page.tsx` — `isFavorite` column on QuoteTemplate (currently presentation-only) _(L176)_
- [ ] **[BE]** `cpq/integration/cad/page.tsx` — View-quote action ("Feature coming soon") _(L368)_
- [ ] **[BE]** `cpq/integration/ecommerce/page.tsx` — View-quote-details action ("Feature coming soon") _(L446)_

## workflow

- [ ] **[BE]** `workflow/approvals/page.tsx` — GET `:id/attachments` + `:id/comments` + document-view routes _(L728)_
- [ ] **[BE]** `workflow/templates/page.tsx` — POST `/workflow/templates/import`
- [ ] **[BE]** `workflow/automation/page.tsx` — POST `/workflow/automation-rules/:id/run` (Run Now currently bumps update)

## it-admin

- [ ] **[BE]** `it-admin/security/alerts/page.tsx` — Alert Rules tab data + toggle endpoint (currently hardcoded rules)
- [ ] **[BE]** `it-admin/security/password/page.tsx` — per-user password-status list endpoint
- [ ] **[PG]** `it-admin/users/[id]/page.tsx` + `it-admin/users/[id]/edit/page.tsx` — detail/edit pages to build (endpoints exist)

## crm

- [ ] **[BE]** `crm/advanced-features/account-hierarchy/page.tsx` — non-default relationship types not supported by backend _(L192)_
- [ ] **[BE]** `crm/advanced-features/activity-timeline/page.tsx` — Like activities (no backend field/endpoint) _(L108, L110)_
- [ ] **[UI]** `crm/leads/assignment/page.tsx` — assignment rule name via `window.prompt` _(L238, L302)_

## common-masters

- [ ] **[BE]** `common-masters/uom-conversion-master/page.tsx` — uom-conversions read + write routes (conversions tab local-only)
- [x] ~~country-master / currency-master write routes~~ — **DONE** in commit `f77df7a6`

## rfq

- [ ] **[BE]** `rfq/view/[id]/page.tsx` — View linked PR ("Feature coming soon") _(L632)_

## reports

- [ ] **[BE]** `reports/custom/page.tsx` — report rendering/execution endpoint _(L350, L357)_
- [ ] **[BE]** `reports/financial/page.tsx` — report generation _(L63)_

## project-management / projects

- [ ] **[BE]** `projects/resources/page.tsx` — 5 actions with no backend: resource transfer, workload balancing, resource requests, save skills, log time _(L234, L243, L252, L261, L270)_
- [ ] **[BE]** `project-management/settings/page.tsx` — reset-to-defaults endpoint _(L290)_
- [ ] **[RD]** `project-management/capacity/page.tsx` — timeline allocation view ("coming soon") _(L493)_
- [ ] **[RD]** `project-management/view/[id]/page.tsx` — team members + recent activities (no endpoint; showcase defaults) _(L149, L158)_

## hr

Several HR pages have large tab shells with `coming soon` sub-sections. These are **[BE]** where the sub-feature has no endpoint, and per-section:

- [ ] **[BE]** `hr/hr-compliance/page.tsx` — certificates, policy-ack, POSH complaints, EEO reports, remediation plans, statutory reports (6 sections) _(L664, L701, L1033, L1051, L1238, L1362)_
- [ ] **[BE]** `hr/training-development/page.tsx` — skill matrix, skill-gap analysis, e-learning, budget, effectiveness, reports sections _(L543, L565, L718, L816, L1019, L1025)_
- [ ] **[BE]** `hr/asset-management/page.tsx` — asset transfer, return, preventive maintenance, repair history, stock mgmt/requests/allocation, reports (8 sections) _(L620–L659)_
- [ ] **[BE]** `hr/documents/page.tsx` — Upload Documents section — *file-upload cluster* _(L734)_
- [ ] **[BE]** `hr/performance-management/page.tsx` — Reports sub-tab ("coming soon") _(L1130)_
- [ ] **[BE]** `hr/timesheets/bulk-punch/page.tsx` — Excel/CSV bulk import — *file-upload cluster* _(L195, L198)_
- [ ] **[BE]** `hr/training/elearning/library/page.tsx` — course content / "coming soon" courses _(L265, L327)_
- [ ] **[BE]** `hr/alumni/network/page.tsx` — comment feature ("coming soon") _(L213)_
- [ ] **[UI]** `hr/onboarding/page.tsx` — checklist item add via `window.prompt`; endpoint exists _(L610, L612, L613)_

---

## Summary counts

| Tag | Count |
|---|---|
| **[BE]** backend-pending (no endpoint) | ~63 |
| **[UI]** interim prompt/alert (endpoint exists) | ~11 |
| **[RD]** read-only display gap | ~4 |
| **[PG]** page to build | ~1 (2 routes) |

> **[BE]** is the true "not covered by backend" work and where net-new backend effort should go. **[UI]** items already function — they are frontend-polish (swap `window.prompt`/`alert` for a modal) and can be batched separately. **[RD]** items are cosmetic display gaps. Sequence the four cross-cutting clusters first (file-upload, PDF/report-gen, GST/TDS e-filing, insight-module writes) to clear the largest share of **[BE]** pages.
</content>
</invoke>
