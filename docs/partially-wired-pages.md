# Partially-Wired Pages Report

> ## ✅ COMPLETED — 2026-07-06 (branch `feat/wire-pages-full-stack`, merged to `main`)
>
> This report has been actioned end-to-end. **All 452 pages call real backend APIs.**
> - **Mock fallbacks removed from ~90 pages** — mock-data literals still rendered dropped from **108 → 24** (−6,000+ lines of fabricated data), so the real API is the sole data source with graceful empty states.
> - Form pickers/dropdowns wired to existing master endpoints (items, vendors, customers, employees); net-new read/aggregation endpoints built for data widgets (procurement insights, finance payment-verification, logistics loading-jobs, PM budget trend, CRM SLA performance).
> - The remaining ~24 hardcoded arrays are **legitimate client-side previews/simulations** (estimation & scheduling what-if, bulk-upload file-read sim, CPQ/report builders), a few no-backing-entity widgets, and **3 `_finance_deprecated`** pages. ~19 TODOs left are **genuine future features** with no backend (Excel import, PIN-auth, approval delegation).
> - **Database:** additive tables applied to Neon via `npm run db:manual` (ledger up to date).
> - **Verified:** backend `nest build` exit 0 · frontend `tsc --noEmit` 0 errors.
>
> _The route inventory below is the original pre-work snapshot, retained for reference._

Pages under `b3-erp/frontend/src/app/` that are **half-wired** — they either import a service without calling it, call an API but still ship mock data, or contain TODO/placeholder markers alongside real API usage.

**Total partially-wired pages: 452**

## Issue tags used

- `no-service-import` — file does not import from `@/services` or `@/lib/api-client` (but does have some API-shape call like fetch/axios)
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, or `useMutation` at page level (service imported but never invoked, or logic delegated to child component)
- `mock-data` — file declares `MOCK_*` / `mockData` / `dummyData` constants alongside real API calls (mock fallback)
- `TODO(xN)` — file contains N TODO/FIXME markers
- `coming-soon` — file contains 'coming soon' literal
- `not-implemented` — file contains 'not implemented' literal
- `placeholder-feature` — file contains placeholder feature markers
- `empty-onclick` — button handler is `() => {}`
- `console-log-onclick` — button handler is just `console.log`
- `alert-onclick` — button handler is just `alert()`

## How to read the issue list

A partial page will always show at least one of these patterns:

| Pattern | Meaning |
|---|---|
| `no-api-call` alone | Service imported for types but never called — likely delegates to a child component, or a stub |
| `no-api-call; mock-data` | Service imported but page still renders hardcoded arrays — swap needed |
| `mock-data` | Real API call exists but a mock array is also present (fallback risk) |
| `TODO(xN)` | Real API integration but N incomplete spots |
| `no-service-import` (rare here) | Uses raw fetch/axios without going through the service layer — inconsistent with the app's pattern |

---

## Summary by module

| Module | Partial pages |
|---|---|
| hr | 145 |
| reports | 74 |
| project-management | 43 |
| crm | 40 |
| finance | 21 |
| production | 18 |
| cpq | 18 |
| inventory | 16 |
| procurement | 13 |
| support | 13 |
| projects | 13 |
| estimation | 5 |
| quality | 4 |
| packaging | 4 |
| logistics | 4 |
| after-sales-service | 3 |
| rfq | 3 |
| sales | 3 |
| workflow | 3 |
| common-masters | 3 |
| it-admin | 2 |
| login | 1 |
| advanced-features | 1 |
| collaboration | 1 |
| (dashboard) | 1 |

---

## `hr` — 145 partially-wired pages

| Route | Issues |
|---|---|
| `/hr` | no-api-call |
| `/hr/alumni/directory` | mock-data |
| `/hr/alumni/network` | mock-data; coming-soon |
| `/hr/alumni/rehire` | mock-data |
| `/hr/asset-management` | coming-soon |
| `/hr/assets/reports/allocation` | mock-data |
| `/hr/assets/reports/costs` | mock-data |
| `/hr/assets/reports/department` | mock-data |
| `/hr/assets/reports/employee` | mock-data |
| `/hr/assets/reports/register` | mock-data |
| `/hr/attendance` | mock-data |
| `/hr/attendance/biometric` | mock-data |
| `/hr/attendance/calendar` | mock-data |
| `/hr/attendance/monthly` | mock-data |
| `/hr/attendance/policies` | no-service-import; TODO(x1) |
| `/hr/attendance/reports` | mock-data |
| `/hr/cards/management` | mock-data |
| `/hr/cards/reconciliation` | mock-data |
| `/hr/cards/transactions` | mock-data |
| `/hr/compliance/audit/audits` | mock-data |
| `/hr/compliance/diversity/grievance` | mock-data |
| `/hr/compliance/diversity/posh` | mock-data |
| `/hr/compliance/labor/registers` | mock-data |
| `/hr/compliance/labor/tracker` | mock-data |
| `/hr/compliance/licenses/certificates` | mock-data |
| `/hr/compliance/licenses/master` | mock-data |
| `/hr/compliance/licenses/renewals` | mock-data |
| `/hr/compliance/policy/acknowledgment` | mock-data |
| `/hr/compliance/policy/disciplinary` | mock-data |
| `/hr/compliance/policy/violations` | mock-data |
| `/hr/compliance/returns/esi` | mock-data |
| `/hr/compliance/returns/lwf` | mock-data |
| `/hr/compliance/returns/pf` | mock-data |
| `/hr/compliance/returns/pt` | mock-data |
| `/hr/compliance/returns/tds` | mock-data |
| `/hr/documents` | coming-soon |
| `/hr/documents/education` | mock-data |
| `/hr/documents/employment` | mock-data |
| `/hr/documents/insurance` | mock-data |
| `/hr/documents/personal` | mock-data |
| `/hr/documents/upload` | no-service-import |
| `/hr/employees/departments` | mock-data |
| `/hr/employees/designations` | mock-data |
| `/hr/employees/directory/active` | mock-data |
| `/hr/employees/directory/contract` | mock-data |
| `/hr/employees/directory/inactive` | mock-data |
| `/hr/employees/directory/probation` | mock-data |
| `/hr/employees/org-chart` | mock-data |
| `/hr/employees/profiles` | mock-data |
| `/hr/employees/separations` | no-service-import |
| `/hr/employees/teams` | mock-data |
| `/hr/employees/transfers-promotions` | no-api-call |
| `/hr/employees/view/[id]` | no-api-call |
| `/hr/expenses/my` | mock-data |
| `/hr/expenses/reports/budget` | mock-data |
| `/hr/expenses/settings/per-diem` | mock-data |
| `/hr/hr-compliance` | coming-soon |
| `/hr/leave/apply` | no-api-call |
| `/hr/leave/balance/my` | no-api-call; console-log-onclick |
| `/hr/leave/history` | mock-data |
| `/hr/leave/view/[id]` | no-service-import |
| `/hr/onboarding/documents` | no-service-import |
| `/hr/onboarding/induction/hr` | no-api-call |
| `/hr/overtime/approval` | mock-data |
| `/hr/overtime/requests` | mock-data; TODO(x1) |
| `/hr/payroll` | no-api-call |
| `/hr/payroll/add` | no-api-call |
| `/hr/payroll/advances/requests` | mock-data |
| `/hr/payroll/bonus/annual` | mock-data |
| `/hr/payroll/bonus/performance` | mock-data |
| `/hr/payroll/disbursement` | mock-data |
| `/hr/payroll/esi/contribution` | mock-data |
| `/hr/payroll/esi/returns` | mock-data |
| `/hr/payroll/increment/annual` | mock-data |
| `/hr/payroll/increment/arrears` | mock-data |
| `/hr/payroll/increment/letters` | mock-data |
| `/hr/payroll/increment/performance` | mock-data |
| `/hr/payroll/loans/approval` | mock-data |
| `/hr/payroll/loans/requests` | mock-data |
| `/hr/payroll/pf/contribution` | mock-data |
| `/hr/payroll/pf/returns` | mock-data |
| `/hr/payroll/pf/uan` | mock-data |
| `/hr/payroll/pt` | mock-data |
| `/hr/payroll/reports/bank` | mock-data |
| `/hr/payroll/reports/dept-cost` | mock-data |
| `/hr/payroll/reports/esi` | mock-data |
| `/hr/payroll/reports/payslips` | mock-data |
| `/hr/payroll/reports/pf` | mock-data |
| `/hr/payroll/reports/register` | mock-data |
| `/hr/payroll/reports/tds` | mock-data |
| `/hr/payroll/revisions` | mock-data |
| `/hr/payroll/run` | mock-data |
| `/hr/payroll/tax/declarations` | mock-data |
| `/hr/payroll/tax/form16` | mock-data |
| `/hr/payroll/tax/tds` | mock-data |
| `/hr/payroll/verification` | mock-data |
| `/hr/performance/feedback/give` | mock-data |
| `/hr/performance/goals/department` | mock-data |
| `/hr/performance/goals/my` | mock-data |
| `/hr/performance/goals/team` | mock-data |
| `/hr/performance/kpi/master` | mock-data |
| `/hr/performance/reviews/cycles` | no-service-import |
| `/hr/performance/reviews/manager` | mock-data |
| `/hr/performance/view/[id]` | no-service-import |
| `/hr/performance-management` | coming-soon |
| `/hr/probation` | mock-data |
| `/hr/probation/confirmation` | mock-data |
| `/hr/probation/feedback` | mock-data |
| `/hr/probation/reviews` | mock-data |
| `/hr/probation/tracking` | mock-data |
| `/hr/reimbursement/paid` | mock-data |
| `/hr/reimbursement/pending` | mock-data |
| `/hr/reimbursement/processing` | mock-data |
| `/hr/reimbursement/settlement` | mock-data |
| `/hr/safety/incidents/tracking` | mock-data |
| `/hr/self-service` | no-api-call |
| `/hr/shifts/master` | mock-data; TODO(x1) |
| `/hr/succession/development/leadership` | mock-data |
| `/hr/succession/development/mentoring` | mock-data |
| `/hr/succession/development/rotation` | mock-data |
| `/hr/succession/plans/matrix` | mock-data |
| `/hr/succession/plans/tracking` | mock-data |
| `/hr/succession/positions/identify` | mock-data |
| `/hr/succession/positions/profiles` | mock-data |
| `/hr/succession/positions/risk` | mock-data |
| `/hr/succession/reports/bench-strength` | mock-data |
| `/hr/succession/reports/coverage` | mock-data |
| `/hr/succession/talent/development` | mock-data |
| `/hr/succession/talent/identify` | mock-data |
| `/hr/succession/talent/profiles` | mock-data |
| `/hr/succession/talent/readiness` | mock-data |
| `/hr/timesheets/bulk-punch` | TODO(x2); coming-soon |
| `/hr/timesheets/daily-punch` | no-service-import |
| `/hr/timesheets/project-hours` | no-service-import |
| `/hr/timesheets/reports` | no-service-import |
| `/hr/training/elearning/library` | coming-soon |
| `/hr/training/programs/catalog` | mock-data |
| `/hr/training/skills/matrix` | no-api-call |
| `/hr/training-development` | coming-soon |
| `/hr/travel/advances` | mock-data |
| `/hr/travel/cards` | mock-data |
| `/hr/travel/expenses` | mock-data |
| `/hr/travel/history` | mock-data |
| `/hr/travel/reports` | no-api-call |
| `/hr/travel/requests` | mock-data |

## `reports` — 74 partially-wired pages

| Route | Issues |
|---|---|
| `/reports` | no-api-call |
| `/reports/accounts/expense-claims/status` | no-api-call |
| `/reports/accounts/petty-cash/transactions` | no-api-call |
| `/reports/accounts/reconciliation/status` | no-api-call |
| `/reports/after-sales/satisfaction/region` | no-api-call |
| `/reports/after-sales/service-calls/status` | no-api-call |
| `/reports/after-sales/warranty/product` | no-api-call |
| `/reports/crm/customers/acquisition` | no-api-call |
| `/reports/crm/leads/source` | no-api-call |
| `/reports/crm/leads/status` | no-api-call |
| `/reports/crm/pipeline/owner` | no-api-call |
| `/reports/crm/pipeline/stage` | no-api-call |
| `/reports/custom` | no-api-call |
| `/reports/finance/ap-aging/bucket` | no-api-call |
| `/reports/finance/ar-aging` | no-api-call |
| `/reports/finance/ar-aging/bucket` | no-api-call |
| `/reports/finance/balance-sheet/assets` | no-api-call |
| `/reports/finance/balance-sheet/equity` | no-api-call |
| `/reports/finance/balance-sheet/liabilities` | no-api-call |
| `/reports/finance/budget-vs-actual` | no-api-call |
| `/reports/finance/budget-vs-actual/variance` | no-api-call |
| `/reports/finance/cash-flow/financing` | no-api-call; console-log-onclick |
| `/reports/finance/cash-flow/investing` | no-api-call; console-log-onclick |
| `/reports/finance/cash-flow/operating` | no-api-call; console-log-onclick |
| `/reports/finance/cost-center` | no-api-call |
| `/reports/finance/cost-center/details` | no-api-call |
| `/reports/finance/expense-analysis` | no-api-call |
| `/reports/finance/expense-analysis/details` | no-api-call |
| `/reports/finance/general-ledger` | no-api-call |
| `/reports/finance/general-ledger/journal` | no-api-call |
| `/reports/finance/pl/cogs` | no-api-call |
| `/reports/finance/pl/expenses` | no-api-call |
| `/reports/finance/pl/revenue` | no-api-call |
| `/reports/finance/revenue-analysis` | no-api-call |
| `/reports/finance/revenue-analysis/details` | no-api-call |
| `/reports/finance/tax-summary` | no-api-call |
| `/reports/finance/tax-summary/details` | no-api-call |
| `/reports/finance/trial-balance` | no-api-call |
| `/reports/finance/trial-balance/ledger` | no-api-call |
| `/reports/financial` | no-api-call |
| `/reports/hr` | no-api-call |
| `/reports/hr/attendance/department` | no-api-call |
| `/reports/hr/payroll/department` | no-api-call |
| `/reports/hr/performance/department` | no-api-call |
| `/reports/inventory` | no-api-call |
| `/reports/inventory/aging/bucket` | no-api-call |
| `/reports/inventory/movement/history` | no-api-call |
| `/reports/inventory/movement/type` | no-api-call |
| `/reports/inventory/stock/category` | no-api-call |
| `/reports/inventory/stock/location` | no-api-call |
| `/reports/inventory/valuation/category` | no-api-call |
| `/reports/logistics/fleet/status` | no-api-call |
| `/reports/logistics/shipping/carrier` | no-api-call |
| `/reports/procurement` | no-api-call |
| `/reports/procurement/po/status` | no-api-call |
| `/reports/procurement/spend-analysis/category` | no-api-call |
| `/reports/procurement/vendor-performance/vendor` | no-api-call |
| `/reports/procurement/vendor-performance/vendor/orders` | no-api-call |
| `/reports/production` | no-api-call |
| `/reports/production/material-consumption/material` | no-api-call |
| `/reports/production/material-consumption/wo` | no-api-call |
| `/reports/production/performance/product` | no-api-call |
| `/reports/production/performance/workcenter` | no-api-call |
| `/reports/production/work-orders/status` | no-api-call |
| `/reports/project-management/performance/status` | no-api-call |
| `/reports/project-management/resources/role` | no-api-call |
| `/reports/quality/inspections/type` | no-api-call |
| `/reports/quality/ncr-capa/severity` | no-api-call |
| `/reports/quality/ncr-capa/status` | no-api-call |
| `/reports/sales` | no-api-call |
| `/reports/sales/orders/status` | no-api-call |
| `/reports/sales/performance/product` | no-api-call |
| `/reports/sales/performance/salesperson` | no-api-call |
| `/reports/sales/quotations/status` | no-api-call |

## `project-management` — 43 partially-wired pages

| Route | Issues |
|---|---|
| `/project-management` | mock-data |
| `/project-management/[id]/design-assets` | mock-data |
| `/project-management/[id]/installation/progress` | mock-data |
| `/project-management/[id]/packaging` | mock-data |
| `/project-management/[id]/procurement` | mock-data |
| `/project-management/[id]/production` | mock-data |
| `/project-management/[id]/technical/bom` | mock-data |
| `/project-management/[id]/verification/comparison` | mock-data |
| `/project-management/analytics` | no-api-call |
| `/project-management/briefings` | no-api-call |
| `/project-management/budget` | mock-data |
| `/project-management/change-orders` | mock-data |
| `/project-management/commissioning` | no-api-call |
| `/project-management/customer-acceptance` | no-api-call |
| `/project-management/dashboard` | no-api-call |
| `/project-management/deliverables` | mock-data |
| `/project-management/dispatch-planning-enhanced` | mock-data |
| `/project-management/documents/approvals` | mock-data |
| `/project-management/documents/upload/boq-enhanced` | mock-data |
| `/project-management/edit/[id]` | mock-data |
| `/project-management/gantt` | TODO(x4) |
| `/project-management/gantt/[id]` | no-api-call |
| `/project-management/installation-tracking` | no-api-call |
| `/project-management/installation-tracking-enhanced` | mock-data |
| `/project-management/issues` | mock-data |
| `/project-management/mrp` | no-api-call |
| `/project-management/procurement/po-creation-enhanced` | mock-data |
| `/project-management/profitability` | no-api-call |
| `/project-management/progress` | no-api-call |
| `/project-management/project-costing` | no-api-call |
| `/project-management/project-types` | mock-data |
| `/project-management/quality-inspection` | no-api-call |
| `/project-management/resource-allocation` | mock-data |
| `/project-management/resource-scheduling` | no-api-call |
| `/project-management/resource-scheduling/allocation` | mock-data |
| `/project-management/resource-utilization` | no-api-call |
| `/project-management/schedule` | no-api-call |
| `/project-management/settings` | TODO(x14) |
| `/project-management/site-issues` | no-api-call |
| `/project-management/site-survey` | no-api-call |
| `/project-management/technical/workload` | mock-data |
| `/project-management/view/[id]` | no-api-call |
| `/project-management/wbs` | no-api-call |

## `crm` — 40 partially-wired pages

| Route | Issues |
|---|---|
| `/crm` | no-api-call |
| `/crm/activities` | mock-data |
| `/crm/analytics/revenue` | no-api-call |
| `/crm/campaigns/edit/[id]` | mock-data |
| `/crm/campaigns/email` | mock-data |
| `/crm/campaigns/performance` | mock-data |
| `/crm/campaigns/view/[id]` | mock-data |
| `/crm/contacts` | mock-data; coming-soon |
| `/crm/contacts/lists` | mock-data |
| `/crm/contacts/roles` | mock-data |
| `/crm/contacts/view/[id]` | mock-data |
| `/crm/contracts/amendments` | mock-data |
| `/crm/contracts/renewals` | mock-data |
| `/crm/customers` | mock-data |
| `/crm/customers/hierarchy` | mock-data |
| `/crm/customers/portal/view` | mock-data |
| `/crm/customers/segments/[id]` | mock-data |
| `/crm/customers/segments/edit/[id]` | mock-data |
| `/crm/customers/view/[id]` | mock-data |
| `/crm/interactions/view/[id]` | mock-data |
| `/crm/leads` | mock-data |
| `/crm/leads/add` | no-api-call |
| `/crm/leads/assignment` | mock-data |
| `/crm/leads/sources` | mock-data |
| `/crm/leads/view/[id]` | mock-data |
| `/crm/marketing/campaigns` | mock-data |
| `/crm/marketing/email-templates` | mock-data |
| `/crm/opportunities/lost` | mock-data |
| `/crm/opportunities/pipeline` | no-api-call; mock-data |
| `/crm/opportunities/view/[id]` | mock-data |
| `/crm/opportunities/won` | mock-data |
| `/crm/proposals` | mock-data |
| `/crm/proposals/edit/[id]` | no-api-call; mock-data |
| `/crm/proposals/view/[id]` | mock-data |
| `/crm/quotes/create` | no-api-call; mock-data |
| `/crm/quotes/edit/[id]` | no-api-call; mock-data |
| `/crm/quotes/pricing` | mock-data |
| `/crm/quotes/view/[id]` | mock-data |
| `/crm/settings/approval-workflows` | no-api-call |
| `/crm/support/sla` | mock-data |

## `finance` — 21 partially-wired pages

| Route | Issues |
|---|---|
| `/finance/accounting/add` | mock-data |
| `/finance/accounting/edit/[id]` | mock-data |
| `/finance/accounting/view/[id]` | mock-data |
| `/finance/advanced-features` | mock-data |
| `/finance/banks` | no-service-import |
| `/finance/cash/bank-reconciliation` | no-api-call |
| `/finance/expense-claims` | no-service-import |
| `/finance/invoices/edit/[id]` | no-api-call |
| `/finance/invoices/view/[id]` | mock-data |
| `/finance/ledger/[id]` | no-api-call |
| `/finance/payables/add` | no-api-call |
| `/finance/payables/edit/[id]` | mock-data |
| `/finance/payables/view/[id]` | mock-data |
| `/finance/payments/add` | mock-data |
| `/finance/payments/edit/[id]` | mock-data |
| `/finance/payments/view/[id]` | mock-data |
| `/finance/payment-verification` | mock-data |
| `/finance/petty-cash` | no-service-import |
| `/finance/receivables/edit/[id]` | mock-data |
| `/finance/receivables/view/[id]` | mock-data |
| `/finance/reconciliation` | no-service-import |

## `production` — 18 partially-wired pages

| Route | Issues |
|---|---|
| `/production/bom` | TODO(x3) |
| `/production/bom/costing` | TODO(x1) |
| `/production/bom/edit/[id]` | no-api-call; mock-data |
| `/production/bom/versions` | TODO(x2) |
| `/production/bom/view/[id]` | no-api-call; mock-data |
| `/production/downtime` | TODO(x4) |
| `/production/downtime/analysis` | TODO(x7) |
| `/production/downtime/rca` | TODO(x6); not-implemented |
| `/production/maintenance/preventive` | coming-soon |
| `/production/maintenance/spares` | coming-soon |
| `/production/mrp/planned-orders` | TODO(x2) |
| `/production/mrp/shortage` | TODO(x2) |
| `/production/quality` | no-service-import; mock-data; TODO(x1) |
| `/production/quality/ncr` | TODO(x3) |
| `/production/quality/plans` | TODO(x3) |
| `/production/shopfloor` | TODO(x3) |
| `/production/work-orders/edit/[id]` | no-api-call; mock-data |
| `/production/work-orders/view/[id]` | no-api-call; mock-data |

## `cpq` — 18 partially-wired pages

| Route | Issues |
|---|---|
| `/cpq/analytics/quotes` | no-api-call |
| `/cpq/analytics/win-rate` | no-api-call |
| `/cpq/guided-selling/cross-sell` | no-api-call |
| `/cpq/integration/cad` | no-api-call; coming-soon; alert-onclick |
| `/cpq/integration/crm` | no-api-call |
| `/cpq/integration/ecommerce` | no-api-call; coming-soon; alert-onclick |
| `/cpq/integration/erp` | no-api-call |
| `/cpq/products/compatibility` | no-api-call |
| `/cpq/products/configurator` | no-api-call |
| `/cpq/products/rules` | no-api-call |
| `/cpq/quotes/versions` | no-api-call |
| `/cpq/settings/notifications` | no-api-call |
| `/cpq/settings/numbering` | no-api-call |
| `/cpq/settings/permissions` | no-api-call |
| `/cpq/workflow/approvals` | TODO(x1) |
| `/cpq/workflow/discounts` | TODO(x1) |
| `/cpq/workflow/executive` | TODO(x1) |
| `/cpq/workflow/legal` | TODO(x1) |

## `inventory` — 16 partially-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments` | TODO(x3) |
| `/inventory/analytics/reports` | no-service-import; TODO(x5) |
| `/inventory/analytics/turnover` | no-service-import; TODO(x2) |
| `/inventory/cycle-count` | mock-data; TODO(x4) |
| `/inventory/movements` | TODO(x5) |
| `/inventory/movements/receipt` | no-api-call |
| `/inventory/optimization/reorder` | no-service-import; TODO(x1) |
| `/inventory/stock` | not-implemented |
| `/inventory/stock/aging` | no-service-import; TODO(x1) |
| `/inventory/stock/valuation` | no-service-import; TODO(x1) |
| `/inventory/stock/view/[id]` | no-api-call |
| `/inventory/transfers` | TODO(x2) |
| `/inventory/warehouse` | TODO(x2) |
| `/inventory/warehouse/locations` | TODO(x1) |
| `/inventory/warehouse/view/[id]` | no-api-call |
| `/inventory/warehouse/zones` | TODO(x2) |

## `procurement` — 13 partially-wired pages

| Route | Issues |
|---|---|
| `/procurement` | no-api-call |
| `/procurement/orders/add` | no-api-call; coming-soon |
| `/procurement/orders/edit/[id]` | no-api-call |
| `/procurement/orders/view/[id]` | mock-data |
| `/procurement/purchase-orders` | TODO(x1) |
| `/procurement/purchase-orders/create` | mock-data |
| `/procurement/requisitions/add` | no-api-call |
| `/procurement/requisitions/edit/[id]` | no-api-call |
| `/procurement/requisitions/view/[id]` | mock-data; coming-soon; alert-onclick |
| `/procurement/supplier-portal` | no-api-call |
| `/procurement/vendor-management` | mock-data |
| `/procurement/vendors/edit/[id]` | mock-data |
| `/procurement/vendors/view/[id]` | mock-data |

## `support` — 13 partially-wired pages

| Route | Issues |
|---|---|
| `/support/assets/hardware` | no-api-call |
| `/support/assets/software` | no-api-call |
| `/support/automation/assignment` | no-api-call |
| `/support/automation/escalation` | no-api-call |
| `/support/changes/scheduled` | no-api-call |
| `/support/knowledge/guides` | no-api-call |
| `/support/knowledge/troubleshooting` | no-api-call |
| `/support/omnichannel` | mock-data |
| `/support/problems/known-errors` | no-api-call |
| `/support/reports` | no-api-call |
| `/support/team/agents` | no-api-call |
| `/support/team/skills` | no-api-call |
| `/support/tickets` | no-api-call |

## `projects` — 13 partially-wired pages

| Route | Issues |
|---|---|
| `/projects/commissioning` | mock-data |
| `/projects/dashboard` | mock-data |
| `/projects/execution/changes` | mock-data |
| `/projects/execution/issues` | mock-data |
| `/projects/execution/kanban` | mock-data |
| `/projects/execution/tasks` | mock-data |
| `/projects/finance/budget` | mock-data |
| `/projects/planning` | mock-data |
| `/projects/planning/charter` | mock-data |
| `/projects/planning/schedule` | mock-data |
| `/projects/planning/scope` | mock-data |
| `/projects/planning/wbs` | mock-data |
| `/projects/tracking/earned-value` | mock-data |

## `estimation` — 5 partially-wired pages

| Route | Issues |
|---|---|
| `/estimation/advanced-features` | mock-data |
| `/estimation/boq/add` | no-service-import |
| `/estimation/boq/view/[id]` | mock-data |
| `/estimation/costing/view/[id]` | mock-data |
| `/estimation/pricing/view/[id]` | mock-data |

## `quality` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/quality` | no-api-call |
| `/quality/capa/new` | no-service-import |
| `/quality/inspections/new` | no-service-import |
| `/quality/ncr/new` | no-service-import |

## `packaging` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/packaging/materials` | mock-data |
| `/packaging/operations` | mock-data |
| `/packaging/shipping-bill` | mock-data |
| `/packaging/staging` | mock-data |

## `logistics` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/logistics/fleet/tracking` | no-api-call |
| `/logistics/loading` | mock-data |
| `/logistics/planning/routes` | no-api-call |
| `/logistics/shipping/add` | no-api-call; mock-data |

## `after-sales-service` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/after-sales-service/billing/create` | no-api-call |
| `/after-sales-service/dashboard` | no-api-call |
| `/after-sales-service/service-contracts/add` | no-api-call; mock-data |

## `rfq` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/rfq/add` | no-api-call; mock-data |
| `/rfq/edit/[id]` | no-api-call; mock-data |
| `/rfq/view/[id]` | coming-soon; alert-onclick |

## `sales` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/sales` | no-api-call |
| `/sales/orders/create` | no-api-call |
| `/sales/rfp/create` | no-api-call |

## `workflow` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/workflow/approvals` | TODO(x4); coming-soon; alert-onclick |
| `/workflow/inbox` | no-api-call |
| `/workflow/templates/edit/[id]` | no-service-import |

## `common-masters` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/common-masters/country-master` | TODO(x1) |
| `/common-masters/currency-master` | TODO(x2) |
| `/common-masters/state-master` | TODO(x2) |

## `it-admin` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/it-admin/database/export` | no-api-call |
| `/it-admin/license/users` | no-api-call |

## `login` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/login` | no-service-import |

## `advanced-features` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/advanced-features/iot` | no-api-call |

## `collaboration` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/collaboration/files` | no-api-call |

## `(dashboard)` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/(dashboard)/production` | no-api-call |

