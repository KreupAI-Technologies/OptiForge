# NEEDS-BACKEND items collected during partial-completion (serial pass later)

## finance
- accounting/periods: period-close checklist modals (inventory valuation, accruals, mgmt review) — no endpoints
- accounting/chart-of-accounts: bulk import — no import endpoint
- tax/gst: Import GSTR-2A, File Return, Download Return — no GST returns/transactions endpoints
- tax/tds: Form 16A gen, File Return (TRACES), Download Return/Challan — no TDS returns/challans endpoints
- reconciliation: Match needs a GL-entry picker (endpoint exists; UI interim uses window.prompt)
- reports/profit-loss: verify /finance/profit-loss/export/pdf|excel exist server-side

## inventory
- cycle-count: create/schedule, start session, perform-count/save, complete/reconcile — read-only backend
- replenishment/auto: auto-replenishment config CRUD
- replenishment/rules: DELETE reorder-rule + "New Rule" create
- replenishment/create: replenishment-request create
- transfers: distinct "reject" transfer (currently mapped to cancel)
- tracking/barcode: bulk barcode import + label print/generation

## quality
- (none — all wired to existing endpoints)

## procurement
- PO approval: Delegate / Request Info endpoints
- orders/add: bulk import/parse endpoint
- grn/view: invoice-matching endpoint
- rfq-rfp: bid shortlist/reject, bid detail, RFQ settings/templates
- purchase-requisition: request_info action
- Read-only insight modules (compliance, e-marketplace, quality-assurance, risk-management, strategic-sourcing, supplier-diversity/onboarding/relationship): no write endpoints — need net-new if actions required
- delegated cards (contract-management/category-management/savings-tracker/supplier-scorecard): endpoints exist but need real create/edit forms (form-building pass, not backend)

## logistics
- warehouse/dock: no create/update endpoint for dock doors
- site/transporter notifications: no POST notify endpoint (real SMS/email dispatch)
- delivery-confirmation: Project→shipment linkage missing to reach shipments/:id/deliver

## installation
- team-assignment: dedicated POST assign-team/:projectId (currently daily-report manpower)
- photo-doc: file-upload endpoint (photos staged client-side)
- handover: detailed 8-step handover-checklist read model + step-update endpoint
- progress/management: purpose-built aggregate installation read endpoints

## production
- quality/add: product-master quality-specs endpoint (GET product/WO quality-specs)
- work-orders/add: BOM explosion endpoint (GET production/bom/:ref/explosion); PR itemCode→itemId resolution
- scheduling: schedule-lines /publish + /optimize routes (only production-schedules has them)
- maintenance/spares: Create PO (procurement) reachable endpoint
- shopfloor: material-request pull endpoint; End Shift/attendance endpoint
- bom/add: Excel BOM import parse; assembly templates (/bom-templates)
- mrp/planning: bulk PR creation; generate work-orders-from-plan; what-if scenario persistence
- capacity-planning: schedule optimize; overtime planning routes

## estimation
- analytics/reports + reports/custom: report file generation/download/render endpoint
- workflow/pending/view: PDF export; workflow/send: customer-delivery/email endpoint

## common-masters (routes missing though service methods exist)
- country-master: POST/PUT/DELETE /common-masters/countries not exposed
- currency-master: POST/PUT/DELETE /common-masters/currencies not exposed
- uom-master: uom-conversions read+write routes (conversions tab local-only)

## cpq
- advanced-features: 6 tabs lack entities (pricing version control, guided-selling wizard, approval matrix, document generator+PDF, e-signature, margin guardrails)
- quotes/templates: isFavorite column on QuoteTemplate

## workflow
- approvals: GET :id/attachments + :id/comments + document-view routes
- templates: POST /workflow/templates/import
- automation: POST /workflow/automation-rules/:id/run (Run Now uses update bump)

## it-admin
- security/alerts: Alert Rules tab data + toggle endpoint (hardcoded rules)
- security/password: per-user password-status list endpoint
- users: /it-admin/users/:id and :id/edit pages (endpoints exist, pages to build)

---
_Generated during the partial-wiring completion pass (branch feat/complete-partially-wired-pages, 2026-07-08)._
_These are actions on now-wired FE pages that have NO backing endpoint — net-new backend work, tracked separately from the partial-wiring completion (which is done)._
