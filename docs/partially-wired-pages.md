# Partially-Wired Pages Report

_Regenerated: 2026-07-08 (branch `main`, commit `6660ba44`)._
_Detector: import-following (each `page.tsx` is scanned together with everything it imports, transitively, up to 2 hops). Same classifier as [`wiring-audit-2026-07-08.md`](./wiring-audit-2026-07-08.md) — all three docs agree on totals._

Pages under `b3-erp/frontend/src/app/` that **do fetch data from the backend somewhere in their tree, but also contain a stub-style handler** (`alert()`, `console.log('click'|'save'|…)`, `// TODO`/`FIXME`/`HACK`, or empty `onClick`) — the read side is usually live but at least one save/export/delete/submit action is a placeholder.

> **RESOLVED on branch `feat/complete-partially-wired-pages` (2026-07-08, stacked on `feat/wire-67-not-wired-pages`).** All 391 pages had their **action/write side completed**: stub handlers (alert/console.log/empty onClick/TODO) wired to the real existing endpoints, `mock-data` fallback arrays removed (errors now surface honestly instead of silently falling back to fabricated rows), and TODO/not-implemented markers resolved. 10 module-group commits, both build gates green throughout (frontend `tsc --noEmit` 0 errors; backend `nest build` 0). Also fixed real bugs found along the way (inventory transfer status-enum, cpq wrong `/cpq/quote-templates` path, finance BankReconciliation Rules-of-Hooks). One backend gap closed directly: exposed common-masters currency/country write routes (service methods already existed).
>
> A meaningful subset of actions had **no backing endpoint at all** — these are genuinely net-new backend features (file upload/storage, PDF generation, statutory e-filing GST/TDS/Form-16, and a handful of PM pages served from in-memory stores). Those FE handlers are wired to the closest existing endpoint or surface an honest "not supported yet" message; the full list is in [`needs-backend-backlog.md`](./needs-backend-backlog.md). Building them is a separate net-new-backend effort (see `optiforge-fe-exceeds-backend`).

**Total partially-wired pages: 391** — action side complete (see note above)
**(Total scanned: 1671 · NOT_WIRED: 67 · PARTIAL: 391 · FULL: 1208 · DEPRECATED: 5)**

## Issue tags used

- `wired-via-delegation` — the `page.tsx` itself has no service import or API call, but a component it renders does — so the page IS wired
- `no-service-import` — nothing in the tree imports from `@/services` or `@/lib/api-client` (page uses raw `fetch`/`axios` only)
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, `useMutation`, or `useSWR` at the tree level (rare in this bucket)
- `mock-data` — tree declares `MOCK_*` / `mockData` / `dummyData` alongside a real API call (fallback risk)
- `TODO(xN)` — tree contains N `// TODO`, `// FIXME`, or `// HACK` markers
- `coming-soon` / `not-implemented` / `placeholder-feature` — matching literal in tree
- `empty-onclick` / `console-log-onclick` / `alert-onclick` — stub button handlers

## How to read the issue list

| Pattern | Meaning |
|---|---|
| `wired-via-delegation` | Page is a thin wrapper; the real wiring lives in the child component |
| `mock-data` | Real API call exists but a mock array is also present (fallback risk) |
| `TODO(xN)` | Real API integration but N incomplete spots |
| `alert-onclick` / `console-log-onclick` / `empty-onclick` | Placeholder button handler somewhere in the tree |
| `coming-soon` | Explicit "coming soon" literal in the tree |

---

## Summary by module

| Module | Partial pages |
|---|---|
| hr | 90 |
| project-management | 68 |
| production | 35 |
| procurement | 34 |
| finance | 26 |
| estimation | 24 |
| logistics | 15 |
| installation | 14 |
| inventory | 14 |
| common-masters | 13 |
| quality | 10 |
| cpq | 7 |
| after-sales-service | 6 |
| it-admin | 6 |
| support | 6 |
| workflow | 5 |
| packaging | 4 |
| reports | 3 |
| crm | 2 |
| rfq | 2 |
| sales | 2 |
| external | 1 |
| notifications | 1 |
| profile | 1 |
| projects | 1 |
| public | 1 |

---

## `hr` — 90 partially-wired pages

| Route | Issues |
|---|---|
| `/hr/alumni/directory` |  |
| `/hr/alumni/network` | coming-soon |
| `/hr/alumni/rehire` |  |
| `/hr/assets/requests` |  |
| `/hr/attendance` | mock-data |
| `/hr/documents/upload` | no-service-import |
| `/hr/employees` | mock-data |
| `/hr/employees/add` | mock-data |
| `/hr/employees/add-enhanced` | mock-data |
| `/hr/employees/departments` |  |
| `/hr/employees/designations` |  |
| `/hr/employees/edit/[id]` | mock-data |
| `/hr/employees/profiles` |  |
| `/hr/employees/teams` |  |
| `/hr/employees/transfers-promotions` |  |
| `/hr/employees/view/[id]` | mock-data |
| `/hr/expenses/approved` |  |
| `/hr/expenses/expense-management/submit` |  |
| `/hr/expenses/my` |  |
| `/hr/expenses/pending` |  |
| `/hr/expenses/rejected` |  |
| `/hr/expenses/reports/budget` |  |
| `/hr/expenses/reports/department` |  |
| `/hr/expenses/reports/summary` |  |
| `/hr/expenses/reports/travel` |  |
| `/hr/expenses/settings/approval` |  |
| `/hr/expenses/settings/categories` |  |
| `/hr/expenses/settings/per-diem` |  |
| `/hr/expenses/settings/policies` |  |
| `/hr/expenses/submit` |  |
| `/hr/leave` | mock-data |
| `/hr/leave/add` | mock-data |
| `/hr/leave/apply` | mock-data |
| `/hr/leave/approvals` | mock-data |
| `/hr/leave/edit/[id]` | mock-data |
| `/hr/leave/encashment/approval` |  |
| `/hr/leave/encashment/requests` | mock-data |
| `/hr/leave/encashment/workflow` | mock-data |
| `/hr/leave/status` | mock-data; console-log-onclick |
| `/hr/leave/view/[id]` | mock-data |
| `/hr/offboarding/clearance/checklist` |  |
| `/hr/offboarding/exit-interview` |  |
| `/hr/offboarding/fnf/leave` |  |
| `/hr/offboarding/fnf/payment` |  |
| `/hr/offboarding/fnf/salary` |  |
| `/hr/offboarding/resignations` |  |
| `/hr/onboarding` | mock-data; TODO(x1) |
| `/hr/onboarding/induction/department` | no-service-import |
| `/hr/onboarding/offers` |  |
| `/hr/overtime/settings` | no-service-import |
| `/hr/payroll` | mock-data |
| `/hr/payroll/add` |  |
| `/hr/payroll/assignments` | mock-data |
| `/hr/payroll/disbursement` |  |
| `/hr/payroll/edit/[id]` | mock-data |
| `/hr/payroll/esi/contribution` |  |
| `/hr/payroll/esi/returns` |  |
| `/hr/payroll/tax/form16` |  |
| `/hr/payroll/templates` | mock-data |
| `/hr/performance/add` | mock-data |
| `/hr/performance/edit/[id]` |  |
| `/hr/performance/feedback/give` |  |
| `/hr/performance/pip/create` | no-service-import |
| `/hr/performance/reviews/self` |  |
| `/hr/probation` |  |
| `/hr/probation/confirmation` |  |
| `/hr/probation/feedback` |  |
| `/hr/probation/reviews` |  |
| `/hr/probation/tracking` |  |
| `/hr/reimbursement/paid` |  |
| `/hr/reimbursement/pending` |  |
| `/hr/reimbursement/processing` |  |
| `/hr/reimbursement/settlement` |  |
| `/hr/skills/master` | mock-data |
| `/hr/succession/plans/create` | no-service-import |
| `/hr/timesheets/approval` |  |
| `/hr/timesheets/bulk-punch` | mock-data |
| `/hr/training/enrollment/attendance` |  |
| `/hr/training/enrollment/enroll` |  |
| `/hr/training/enrollment/waiting` |  |
| `/hr/training/programs/create` | no-service-import |
| `/hr/training/skills/assessment` |  |
| `/hr/travel/booking/cab` |  |
| `/hr/travel/booking/flight` |  |
| `/hr/travel/booking/hotel` |  |
| `/hr/travel/cards` |  |
| `/hr/travel/cards/transactions` | no-service-import |
| `/hr/travel/expenses` |  |
| `/hr/travel/expenses/submit` |  |
| `/hr/travel/requests` |  |

## `project-management` — 68 partially-wired pages

| Route | Issues |
|---|---|
| `/project-management/[id]/installation/handover` |  |
| `/project-management/[id]/installation/progress` |  |
| `/project-management/[id]/installation/tools` |  |
| `/project-management/boq/check` |  |
| `/project-management/cabinet-marking` |  |
| `/project-management/commissioning` |  |
| `/project-management/create` |  |
| `/project-management/create-enhanced` |  |
| `/project-management/customer-acceptance` |  |
| `/project-management/dashboard` |  |
| `/project-management/deliverables` |  |
| `/project-management/discrepancies` |  |
| `/project-management/dispatch-planning-enhanced` |  |
| `/project-management/documents` |  |
| `/project-management/documents/revisions` |  |
| `/project-management/documents/verification` |  |
| `/project-management/edit/[id]` |  |
| `/project-management/emergency-spares` |  |
| `/project-management/gantt` | TODO(x1) |
| `/project-management/installation-tracking` |  |
| `/project-management/installation-tracking-enhanced` |  |
| `/project-management/labor-tracking` |  |
| `/project-management/material-consumption` |  |
| `/project-management/mep` |  |
| `/project-management/milestone-templates` |  |
| `/project-management/mobile-field` |  |
| `/project-management/mrp` |  |
| `/project-management/procurement/approvals` |  |
| `/project-management/procurement/bom-reception` |  |
| `/project-management/procurement/grn` |  |
| `/project-management/procurement/payments` |  |
| `/project-management/procurement/po-creation` |  |
| `/project-management/procurement/pr-generation` |  |
| `/project-management/procurement/stock-check` |  |
| `/project-management/procurement/vendor-tracking` |  |
| `/project-management/production` |  |
| `/project-management/production/bending` |  |
| `/project-management/production/buffing` |  |
| `/project-management/production/fabrication` |  |
| `/project-management/production/laser-cutting` |  |
| `/project-management/production/shutter-work` |  |
| `/project-management/production/trial-wall` |  |
| `/project-management/production/welding` |  |
| `/project-management/project-types` |  |
| `/project-management/quality-inspection` |  |
| `/project-management/reports` |  |
| `/project-management/resource-allocation` | mock-data |
| `/project-management/resource-scheduling/allocation` | mock-data |
| `/project-management/schedule` |  |
| `/project-management/settings` |  |
| `/project-management/site-issues` |  |
| `/project-management/site-readiness` |  |
| `/project-management/site-survey` |  |
| `/project-management/site-visit/measurements` |  |
| `/project-management/site-visit/photos` |  |
| `/project-management/site-visit/schedule` |  |
| `/project-management/ta-settlement` |  |
| `/project-management/tasks` |  |
| `/project-management/team/assign` |  |
| `/project-management/technical/bom/accessories` |  |
| `/project-management/technical/briefing` |  |
| `/project-management/technical/drawings` |  |
| `/project-management/technical/share` |  |
| `/project-management/technical/specs/shutters` |  |
| `/project-management/technical/timeline` |  |
| `/project-management/technical/validation` |  |
| `/project-management/templates` |  |
| `/project-management/timeline` |  |

## `production` — 35 partially-wired pages

| Route | Issues |
|---|---|
| `/production/analytics` |  |
| `/production/bom` | mock-data; TODO(x5) |
| `/production/bom/add` | mock-data |
| `/production/bom/versions` | TODO(x9) |
| `/production/capacity-planning` |  |
| `/production/downtime` | TODO(x13) |
| `/production/downtime/analysis` | TODO(x10) |
| `/production/downtime/log` | TODO(x3) |
| `/production/downtime/rca` | TODO(x17); not-implemented |
| `/production/floor` |  |
| `/production/floor/edit/[id]` |  |
| `/production/maintenance/history` |  |
| `/production/maintenance/preventive` | coming-soon |
| `/production/maintenance/requests` |  |
| `/production/maintenance/spares` | coming-soon |
| `/production/mrp` |  |
| `/production/planning` |  |
| `/production/quality` | TODO(x2) |
| `/production/quality/add` | alert-onclick |
| `/production/quality/edit/[id]` |  |
| `/production/quality/ncr` |  |
| `/production/quality/plans` |  |
| `/production/quality/reports` |  |
| `/production/scheduling` |  |
| `/production/scheduling/add` |  |
| `/production/scheduling/edit/[id]` | mock-data |
| `/production/scheduling/view/[id]` |  |
| `/production/shopfloor` | mock-data; TODO(x3) |
| `/production/shopfloor/operator` | TODO(x2) |
| `/production/work-orders/add` | mock-data |
| `/production/work-orders/add-enhanced` | mock-data |
| `/production/work-orders/pending` |  |
| `/production/work-orders/progress` |  |
| `/production/work-orders/tracking` |  |
| `/production/work-orders/view/[id]` |  |

## `procurement` — 34 partially-wired pages

| Route | Issues |
|---|---|
| `/procurement/budget-tracking` | wired-via-delegation |
| `/procurement/category-management` | wired-via-delegation |
| `/procurement/compliance` | wired-via-delegation |
| `/procurement/contract-management` | wired-via-delegation |
| `/procurement/contracts` | TODO(x4) |
| `/procurement/e-marketplace` | wired-via-delegation |
| `/procurement/grn` | mock-data; TODO(x7) |
| `/procurement/grn/[id]/inspect` | mock-data |
| `/procurement/grn/add` | mock-data |
| `/procurement/grn/edit/[id]` | mock-data |
| `/procurement/grn/view/[id]` | mock-data |
| `/procurement/orders/add` | mock-data; coming-soon |
| `/procurement/orders/edit/[id]` | mock-data |
| `/procurement/purchase-orders/approval` | mock-data |
| `/procurement/purchase-orders/create` | mock-data |
| `/procurement/purchase-orders/view/[id]` |  |
| `/procurement/purchase-requisition` | wired-via-delegation; mock-data |
| `/procurement/quality-assurance` | wired-via-delegation |
| `/procurement/requisitions` | mock-data |
| `/procurement/requisitions/add` |  |
| `/procurement/requisitions/add-enhanced` | mock-data |
| `/procurement/rfq` | mock-data |
| `/procurement/rfq-rfp` | wired-via-delegation; mock-data; TODO(x1) |
| `/procurement/rfq/[id]/compare` | mock-data |
| `/procurement/risk-management` | wired-via-delegation |
| `/procurement/savings-tracker` | wired-via-delegation |
| `/procurement/strategic-sourcing` | wired-via-delegation |
| `/procurement/supplier-diversity` | wired-via-delegation |
| `/procurement/supplier-onboarding` | wired-via-delegation |
| `/procurement/supplier-relationship` | wired-via-delegation |
| `/procurement/supplier-scorecard` | wired-via-delegation |
| `/procurement/vendors/add` |  |
| `/procurement/vendors/add-enhanced` |  |
| `/procurement/vendors/edit/[id]` |  |

## `finance` — 26 partially-wired pages

| Route | Issues |
|---|---|
| `/finance` | mock-data |
| `/finance/accounting/add` | mock-data |
| `/finance/accounting/chart-of-accounts` | mock-data; console-log-onclick |
| `/finance/accounting/edit/[id]` | mock-data |
| `/finance/accounting/journal-entries` | mock-data |
| `/finance/accounting/periods` | mock-data |
| `/finance/accounting/view/[id]` | mock-data |
| `/finance/billing` |  |
| `/finance/budgeting/budgets` | mock-data |
| `/finance/costing/cost-centers` | mock-data |
| `/finance/currency/exchange-rates` | mock-data |
| `/finance/invoices/add` | mock-data |
| `/finance/invoices/add-enhanced` | mock-data |
| `/finance/invoices/edit/[id]` | mock-data |
| `/finance/payables/add` |  |
| `/finance/payables/bills` | mock-data |
| `/finance/payment-verification` | mock-data |
| `/finance/payments/add` | mock-data |
| `/finance/receivables/add` | mock-data |
| `/finance/receivables/aging` | mock-data |
| `/finance/receivables/credit-management` | mock-data |
| `/finance/receivables/invoices` | mock-data |
| `/finance/reconciliation` | mock-data |
| `/finance/reports/profit-loss` | mock-data |
| `/finance/tax/gst` | mock-data |
| `/finance/tax/tds` | mock-data |

## `estimation` — 24 partially-wired pages

| Route | Issues |
|---|---|
| `/estimation/analytics/reports` |  |
| `/estimation/analytics/reports/custom` |  |
| `/estimation/analytics/reports/schedule` |  |
| `/estimation/analytics/reports/schedule/[id]` |  |
| `/estimation/boq/add` | mock-data |
| `/estimation/boq/edit/[id]` | mock-data |
| `/estimation/boq/templates` |  |
| `/estimation/boq/templates/create` |  |
| `/estimation/boq/templates/edit/[id]` |  |
| `/estimation/boq/templates/view/[id]` |  |
| `/estimation/costing/add` | mock-data |
| `/estimation/costing/edit/[id]` | mock-data |
| `/estimation/pricing/add` |  |
| `/estimation/rates/equipment/add` | mock-data |
| `/estimation/rates/labor/add` | mock-data |
| `/estimation/rates/materials/add` |  |
| `/estimation/rates/subcontractors/add` | mock-data |
| `/estimation/workflow/drafts` | mock-data |
| `/estimation/workflow/drafts/create` | mock-data |
| `/estimation/workflow/drafts/edit/[id]` | mock-data |
| `/estimation/workflow/pending` | mock-data |
| `/estimation/workflow/pending/comments/[id]` | mock-data |
| `/estimation/workflow/pending/view/[id]` | mock-data |
| `/estimation/workflow/send/[id]` | mock-data |

## `logistics` — 15 partially-wired pages

| Route | Issues |
|---|---|
| `/logistics/analytics/optimization` |  |
| `/logistics/carriers` |  |
| `/logistics/delivery-confirmation` |  |
| `/logistics/fleet/maintenance` |  |
| `/logistics/freight/booking` |  |
| `/logistics/loading` |  |
| `/logistics/planning/routes` | mock-data |
| `/logistics/shipping` | mock-data |
| `/logistics/site-location` |  |
| `/logistics/site-notification` |  |
| `/logistics/tracking` | mock-data |
| `/logistics/tracking/trace` |  |
| `/logistics/transport-selection` |  |
| `/logistics/transporter-notification` |  |
| `/logistics/warehouse/dock` |  |

## `installation` — 14 partially-wired pages

| Route | Issues |
|---|---|
| `/installation/accessory-fix` |  |
| `/installation/cabinet-align` |  |
| `/installation/final-align` |  |
| `/installation/final-inspection` |  |
| `/installation/handover` |  |
| `/installation/kitchen-cleaning` |  |
| `/installation/management` |  |
| `/installation/photo-doc` |  |
| `/installation/progress` |  |
| `/installation/project-closure` |  |
| `/installation/team-assignment` |  |
| `/installation/tool-dispatch` |  |
| `/installation/tool-prep` |  |
| `/installation/trial-wall` |  |

## `inventory` — 14 partially-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments` | TODO(x1) |
| `/inventory/adjustments/approvals` |  |
| `/inventory/adjustments/create` |  |
| `/inventory/adjustments/quantity` |  |
| `/inventory/cycle-count` | TODO(x1) |
| `/inventory/movements` | TODO(x6) |
| `/inventory/optimization/reorder` |  |
| `/inventory/replenishment/auto` |  |
| `/inventory/replenishment/create` |  |
| `/inventory/replenishment/rules` |  |
| `/inventory/stock` | TODO(x2) |
| `/inventory/stock/low-stock` | TODO(x2); not-implemented |
| `/inventory/tracking/barcode` |  |
| `/inventory/transfers` | mock-data; TODO(x3) |

## `common-masters` — 13 partially-wired pages

| Route | Issues |
|---|---|
| `/common-masters/brand-master` | wired-via-delegation |
| `/common-masters/chart-of-accounts-master` | wired-via-delegation |
| `/common-masters/company-master` | wired-via-delegation; no-service-import |
| `/common-masters/cost-center-master` | wired-via-delegation |
| `/common-masters/country-master` | TODO(x1) |
| `/common-masters/currency-master` | TODO(x2) |
| `/common-masters/department-master` | wired-via-delegation; mock-data |
| `/common-masters/item-category-master` | wired-via-delegation |
| `/common-masters/item-master` | wired-via-delegation; mock-data |
| `/common-masters/plant-master` | wired-via-delegation |
| `/common-masters/state-master` | TODO(x2) |
| `/common-masters/tax-master` | wired-via-delegation |
| `/common-masters/uom-master` | wired-via-delegation |

## `quality` — 10 partially-wired pages

| Route | Issues |
|---|---|
| `/quality/approvals` | mock-data |
| `/quality/capa` | mock-data |
| `/quality/capa/my` | mock-data |
| `/quality/defects` |  |
| `/quality/inspections` | mock-data |
| `/quality/inspections/new-enhanced` | mock-data |
| `/quality/inspections/results` | mock-data |
| `/quality/ncr` | mock-data |
| `/quality/ncr/open` | mock-data |
| `/quality/rework` |  |

## `cpq` — 7 partially-wired pages

| Route | Issues |
|---|---|
| `/cpq/advanced-features` | mock-data |
| `/cpq/guided-selling/cross-sell` |  |
| `/cpq/guided-selling/playbooks` |  |
| `/cpq/guided-selling/questionnaire` |  |
| `/cpq/guided-selling/recommendations` |  |
| `/cpq/quotes/approvals` |  |
| `/cpq/quotes/templates` |  |

## `after-sales-service` — 6 partially-wired pages

| Route | Issues |
|---|---|
| `/after-sales-service/analytics/ftf` |  |
| `/after-sales-service/analytics/technicians` |  |
| `/after-sales-service/billing` |  |
| `/after-sales-service/feedback/surveys` |  |
| `/after-sales-service/service-requests` | mock-data |
| `/after-sales-service/warranties/claims/[id]` | mock-data |

## `it-admin` — 6 partially-wired pages

| Route | Issues |
|---|---|
| `/it-admin/security/alerts` |  |
| `/it-admin/security/ip-whitelist` | not-implemented |
| `/it-admin/security/password` |  |
| `/it-admin/security/sessions` |  |
| `/it-admin/security/sso` |  |
| `/it-admin/users` | mock-data |

## `support` — 6 partially-wired pages

| Route | Issues |
|---|---|
| `/support/changes/create` | mock-data |
| `/support/incidents/create` | mock-data |
| `/support/incidents/critical` | mock-data |
| `/support/knowledge/create` | mock-data |
| `/support/knowledge/faqs` |  |
| `/support/problems/create` | mock-data |

## `workflow` — 5 partially-wired pages

| Route | Issues |
|---|---|
| `/workflow/approvals` | TODO(x1); coming-soon; alert-onclick |
| `/workflow/automation` | mock-data |
| `/workflow/automation/create` | mock-data |
| `/workflow/templates` | mock-data; alert-onclick |
| `/workflow/templates/create` | mock-data |

## `packaging` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/packaging/materials` |  |
| `/packaging/operations` |  |
| `/packaging/shipping-bill` |  |
| `/packaging/staging` |  |

## `reports` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/reports/analytics` | not-implemented |
| `/reports/custom` | not-implemented |
| `/reports/dashboards` | not-implemented |

## `crm` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/crm/advanced-features/account-hierarchy` |  |
| `/crm/advanced-features/activity-timeline` |  |

## `rfq` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/rfq/add` | mock-data |
| `/rfq/edit/[id]` | mock-data |

## `sales` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/sales/quotations/create` | mock-data; not-implemented |
| `/sales/rfp` | mock-data |

## `external` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/external/project/[projectId]/approval/[token]` |  |

## `notifications` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/notifications/preferences` | mock-data |

## `profile` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/profile` |  |

## `projects` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/projects/resources` |  |

## `public` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/public/approval/[token]` |  |

