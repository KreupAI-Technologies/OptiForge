# Not-Wired Pages Report

> ## ✅ COMPLETED — 2026-07-06 (branch `feat/wire-pages-full-stack`, merged to `main`)
>
> This report has been actioned end-to-end. **370+ / 455 pages now call real backend APIs.**
> - Full-stack wiring delivered per module (Prisma model → manual SQL → NestJS controller/service → frontend service → page), building **net-new backends** where endpoints were missing (finance GL/costing/consolidation/currency, procurement spend/insights, logistics management, HR offers/overtime, compliance module, inventory analytics/kitting, it-admin monitoring, estimation report-schedules, and more).
> - The remaining ~85 are **static-by-design**: nav-hub link grids, `advanced-features` showcases, coming-soon stubs, static pages (`design-system`, `documentation`, `help`), **5 `_finance_deprecated`** pages, plus detector false-negatives already wired via their components.
> - **Database:** all additive/idempotent tables in `b3-erp/backend/prisma/manual/orphan_*.sql` were **applied to Neon** via `npm run db:manual` (27 migrations, ledger up to date).
> - **Verified:** backend `nest build` exit 0 · frontend `tsc --noEmit` 0 errors.
>
> _The route inventory below is the original pre-work snapshot, retained for reference._

Pages under `b3-erp/frontend/src/app/` that have **no service import and no API call** — pure static shells or hardcoded UI.

**Total not-wired pages: 455**

## Issue tags used

- `no-service-import` — file does not import from `@/services` or `@/lib/api-client`
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, or `useMutation` call
- `mock-data` — file declares `MOCK_*` / `mockData` / `dummyData` constants (hardcoded UI)
- `TODO` — file contains TODO or FIXME markers
- `coming-soon` — file contains 'coming soon' literal
- `not-implemented` — file contains 'not implemented' literal
- `placeholder-feature` — file contains placeholder feature markers
- `empty-onclick` — button handler is `() => {}`
- `console-log-onclick` — button handler is just `console.log`
- `alert-onclick` — button handler is just `alert()`

---

## Summary by module

| Module | Not-wired pages |
|---|---|
| finance | 65 |
| crm | 41 |
| reports | 41 |
| procurement | 31 |
| common-masters | 31 |
| hr | 30 |
| inventory | 28 |
| it-admin | 28 |
| estimation | 27 |
| production | 22 |
| logistics | 19 |
| support | 15 |
| after-sales-service | 14 |
| project-management | 14 |
| cpq | 10 |
| sales | 5 |
| _finance_deprecated | 5 |
| workflow | 4 |
| projects | 3 |
| advanced-features | 3 |
| compliance | 3 |
| (dashboard) | 2 |
| notifications | 2 |
| settings | 2 |
| dashboard | 1 |
| help | 1 |
| external | 1 |
| portal | 1 |
| rfq | 1 |
| design-system | 1 |
| quality | 1 |
| collaboration | 1 |
| documentation | 1 |
| profile | 1 |

---

## `finance` — 65 not-wired pages

| Route | Issues |
|---|---|
| `/finance/accounting/general-ledger` | no-service-import; no-api-call |
| `/finance/accounting/ledger-report` | no-service-import; no-api-call; mock-data; alert-onclick |
| `/finance/accounting/periods` | no-service-import; no-api-call |
| `/finance/accounts-payable` | no-service-import; no-api-call |
| `/finance/accounts-receivable` | no-service-import; no-api-call |
| `/finance/analytics` | no-service-import; no-api-call |
| `/finance/analytics/financial-ratios` | no-service-import; no-api-call |
| `/finance/analytics/kpi-dashboard` | no-service-import; no-api-call |
| `/finance/analytics/profitability-analysis` | no-service-import; no-api-call |
| `/finance/assets/asset-disposal` | no-service-import; no-api-call |
| `/finance/automation` | no-service-import; no-api-call |
| `/finance/automation/alerts` | no-service-import; no-api-call |
| `/finance/automation/recurring-transactions` | no-service-import; no-api-call |
| `/finance/automation/workflows` | no-service-import; no-api-call |
| `/finance/bank-reconciliation` | no-service-import; no-api-call |
| `/finance/budget` | no-service-import; no-api-call |
| `/finance/budgeting` | no-service-import; no-api-call |
| `/finance/budgeting/multi-year-planning` | no-service-import; no-api-call |
| `/finance/cash/anticipated-payments` | no-service-import; no-api-call |
| `/finance/cash/anticipated-receipts` | no-service-import; no-api-call |
| `/finance/cash-flow` | no-service-import; no-api-call |
| `/finance/consolidation` | no-service-import; no-api-call |
| `/finance/consolidation/financial-consolidation` | no-service-import; no-api-call |
| `/finance/consolidation/intercompany` | no-service-import; no-api-call |
| `/finance/controls` | no-service-import; no-api-call |
| `/finance/controls/approval-workflows` | no-service-import; no-api-call |
| `/finance/controls/audit-trail` | no-service-import; no-api-call |
| `/finance/controls/documents` | no-service-import; no-api-call |
| `/finance/cost-centers` | no-service-import; no-api-call |
| `/finance/costing/job-costing` | no-service-import; no-api-call |
| `/finance/costing/profit-centers` | no-service-import; no-api-call |
| `/finance/costing/standard-costing` | no-service-import; no-api-call |
| `/finance/costing/variance-analysis` | no-service-import; no-api-call |
| `/finance/costing/wip-accounting` | no-service-import; no-api-call |
| `/finance/credit` | no-service-import; no-api-call |
| `/finance/currency` | no-service-import; no-api-call |
| `/finance/currency/exchange-rates` | no-service-import; no-api-call |
| `/finance/currency/management` | no-service-import; no-api-call |
| `/finance/dashboard` | no-service-import; no-api-call |
| `/finance/expense-claims/[id]` | no-service-import; no-api-call |
| `/finance/general-ledger` | no-service-import; no-api-call |
| `/finance/integration` | no-service-import; no-api-call |
| `/finance/integration/procurement` | no-service-import; no-api-call |
| `/finance/integration/production` | no-service-import; no-api-call |
| `/finance/integrations` | no-service-import; no-api-call |
| `/finance/investments` | no-service-import; no-api-call |
| `/finance/invoices/add` | no-service-import; no-api-call |
| `/finance/invoices/add-enhanced` | no-service-import; no-api-call |
| `/finance/journal/[id]` | no-service-import; no-api-call |
| `/finance/multi-currency` | no-service-import; no-api-call |
| `/finance/period-operations` | no-service-import; no-api-call |
| `/finance/period-operations/close` | no-service-import; no-api-call |
| `/finance/period-operations/period-close` | no-service-import; no-api-call |
| `/finance/period-operations/year-end` | no-service-import; no-api-call |
| `/finance/periods` | no-service-import; no-api-call |
| `/finance/receivables/credit-management` | no-service-import; no-api-call |
| `/finance/reporting` | no-service-import; no-api-call |
| `/finance/reporting/report-builder` | no-service-import; no-api-call |
| `/finance/reports` | no-service-import; no-api-call |
| `/finance/reports/balance-sheet` | no-service-import; no-api-call |
| `/finance/reports/cash-flow` | no-service-import; no-api-call |
| `/finance/reports/profit-loss` | no-service-import; no-api-call |
| `/finance/tax` | no-service-import; no-api-call |
| `/finance/tax/tax-reports` | no-service-import; no-api-call |
| `/finance/workflows` | no-service-import; no-api-call |

## `crm` — 41 not-wired pages

| Route | Issues |
|---|---|
| `/crm/activities/quick-entry` | no-service-import; no-api-call |
| `/crm/advanced-features` | no-service-import; no-api-call |
| `/crm/advanced-features/accounts` | no-service-import; no-api-call |
| `/crm/advanced-features/activity` | no-service-import; no-api-call |
| `/crm/advanced-features/automation` | no-service-import; no-api-call |
| `/crm/advanced-features/collaboration` | no-service-import; no-api-call |
| `/crm/advanced-features/customer360` | no-service-import; no-api-call |
| `/crm/advanced-features/lead-scoring` | no-service-import; no-api-call |
| `/crm/advanced-features/pipeline` | no-service-import; no-api-call |
| `/crm/advanced-features/workflow-automation` | no-service-import; no-api-call |
| `/crm/contacts/add` | no-service-import; no-api-call |
| `/crm/contacts/edit/[id]` | no-service-import; no-api-call |
| `/crm/contracts/amendments/create` | no-service-import; no-api-call |
| `/crm/contracts/create` | no-service-import; no-api-call |
| `/crm/contracts/edit/[id]` | no-service-import; no-api-call |
| `/crm/contracts/templates/edit/[id]` | no-service-import; no-api-call |
| `/crm/contracts/templates/view/[id]` | no-service-import; no-api-call |
| `/crm/contracts/view/[id]` | no-service-import; no-api-call |
| `/crm/customers/360` | no-service-import; no-api-call |
| `/crm/customers/add` | no-service-import; no-api-call |
| `/crm/customers/add-enhanced` | no-service-import; no-api-call |
| `/crm/customers/edit/[id]` | no-service-import; no-api-call; mock-data |
| `/crm/interactions/add` | no-service-import; no-api-call |
| `/crm/interactions/edit/[id]` | no-service-import; no-api-call |
| `/crm/leads/edit` | no-service-import; no-api-call |
| `/crm/leads/edit/[id]` | no-service-import; no-api-call |
| `/crm/opportunities/[id]` | no-service-import; no-api-call |
| `/crm/opportunities/add` | no-service-import; no-api-call |
| `/crm/opportunities/edit/[id]` | no-service-import; no-api-call |
| `/crm/opportunities/kanban` | no-service-import; no-api-call |
| `/crm/proposals/create` | no-service-import; no-api-call |
| `/crm/quotes/pricing/create` | no-service-import; no-api-call |
| `/crm/quotes/pricing/edit/[id]` | no-service-import; no-api-call |
| `/crm/settings/stages/add` | no-service-import; no-api-call |
| `/crm/settings/stages/edit/[id]` | no-service-import; no-api-call; mock-data |
| `/crm/settings/statuses/edit/[id]` | no-service-import; no-api-call |
| `/crm/settings/territories/view/[id]` | no-service-import; no-api-call |
| `/crm/support/knowledge/create` | no-service-import; no-api-call |
| `/crm/support/sla/create` | no-service-import; no-api-call |
| `/crm/support/sla/edit/[id]` | no-service-import; no-api-call |
| `/crm/support/tickets/create` | no-service-import; no-api-call |

## `reports` — 41 not-wired pages

| Route | Issues |
|---|---|
| `/reports/accounts/expense-claims` | no-service-import; no-api-call |
| `/reports/accounts/petty-cash` | no-service-import; no-api-call |
| `/reports/accounts/reconciliation` | no-service-import; no-api-call |
| `/reports/advanced-features` | no-service-import; no-api-call |
| `/reports/after-sales/satisfaction` | no-service-import; no-api-call |
| `/reports/after-sales/service-calls` | no-service-import; no-api-call |
| `/reports/after-sales/warranty` | no-service-import; no-api-call |
| `/reports/analytics` | no-service-import; no-api-call |
| `/reports/crm/customers` | no-service-import; no-api-call |
| `/reports/crm/leads` | no-service-import; no-api-call |
| `/reports/crm/pipeline` | no-service-import; no-api-call |
| `/reports/dashboards` | no-service-import; no-api-call |
| `/reports/finance/ap-aging` | no-service-import; no-api-call |
| `/reports/finance/balance-sheet` | no-service-import; no-api-call |
| `/reports/finance/cash-flow` | no-service-import; no-api-call |
| `/reports/finance/pl` | no-service-import; no-api-call |
| `/reports/hr/attendance` | no-service-import; no-api-call |
| `/reports/hr/headcount` | no-service-import; no-api-call |
| `/reports/hr/leave` | no-service-import; no-api-call |
| `/reports/hr/payroll` | no-service-import; no-api-call |
| `/reports/hr/performance` | no-service-import; no-api-call |
| `/reports/inventory/aging` | no-service-import; no-api-call |
| `/reports/inventory/movement` | no-service-import; no-api-call |
| `/reports/inventory/stock` | no-service-import; no-api-call |
| `/reports/inventory/valuation` | no-service-import; no-api-call |
| `/reports/logistics/fleet` | no-service-import; no-api-call |
| `/reports/logistics/shipping` | no-service-import; no-api-call |
| `/reports/procurement/po` | no-service-import; no-api-call |
| `/reports/procurement/spend-analysis` | no-service-import; no-api-call |
| `/reports/procurement/vendor-performance` | no-service-import; no-api-call |
| `/reports/production/material-consumption` | no-service-import; no-api-call |
| `/reports/production/performance` | no-service-import; no-api-call |
| `/reports/production/work-orders` | no-service-import; no-api-call |
| `/reports/project-management/performance` | no-service-import; no-api-call |
| `/reports/project-management/resources` | no-service-import; no-api-call |
| `/reports/quality/dashboard` | no-service-import; no-api-call; console-log-onclick |
| `/reports/quality/inspections` | no-service-import; no-api-call; console-log-onclick |
| `/reports/quality/ncr-capa` | no-service-import; no-api-call |
| `/reports/sales/orders` | no-service-import; no-api-call |
| `/reports/sales/performance` | no-service-import; no-api-call |
| `/reports/sales/quotations` | no-service-import; no-api-call |

## `procurement` — 31 not-wired pages

| Route | Issues |
|---|---|
| `/procurement/advanced-features` | no-service-import; no-api-call; coming-soon |
| `/procurement/analytics` | no-service-import; no-api-call |
| `/procurement/automation` | no-service-import; no-api-call |
| `/procurement/bills/[id]` | no-service-import; no-api-call |
| `/procurement/budget-tracking` | no-service-import; no-api-call |
| `/procurement/category-management` | no-service-import; no-api-call |
| `/procurement/collaboration` | no-service-import; no-api-call |
| `/procurement/compliance` | no-service-import; no-api-call |
| `/procurement/contract-management` | no-service-import; no-api-call |
| `/procurement/e-marketplace` | no-service-import; no-api-call |
| `/procurement/grn/[id]/inspect` | no-service-import; no-api-call |
| `/procurement/grn/add` | no-service-import; no-api-call; mock-data |
| `/procurement/grn/edit/[id]` | no-service-import; no-api-call; mock-data |
| `/procurement/grn/matching` | no-service-import; no-api-call |
| `/procurement/grn/view/[id]` | no-service-import; no-api-call; mock-data |
| `/procurement/purchase-requisition` | no-service-import; no-api-call |
| `/procurement/quality-assurance` | no-service-import; no-api-call |
| `/procurement/requisitions/add-enhanced` | no-service-import; no-api-call |
| `/procurement/rfq/[id]/compare` | no-service-import; no-api-call |
| `/procurement/rfq-rfp` | no-service-import; no-api-call |
| `/procurement/risk-management` | no-service-import; no-api-call |
| `/procurement/savings-tracker` | no-service-import; no-api-call |
| `/procurement/spend-analysis` | no-service-import; no-api-call |
| `/procurement/strategic-sourcing` | no-service-import; no-api-call |
| `/procurement/supplier-diversity` | no-service-import; no-api-call |
| `/procurement/supplier-onboarding` | no-service-import; no-api-call |
| `/procurement/supplier-relationship` | no-service-import; no-api-call |
| `/procurement/supplier-scorecard` | no-service-import; no-api-call |
| `/procurement/vendors/add` | no-service-import; no-api-call |
| `/procurement/vendors/add-enhanced` | no-service-import; no-api-call |
| `/procurement/vendors/comparison` | no-service-import; no-api-call |

## `common-masters` — 31 not-wired pages

| Route | Issues |
|---|---|
| `/common-masters` | no-service-import; no-api-call |
| `/common-masters/appliance-master` | no-service-import; no-api-call |
| `/common-masters/barcode-master` | no-service-import; no-api-call |
| `/common-masters/batch-lot-master` | no-service-import; no-api-call |
| `/common-masters/branch-master` | no-service-import; no-api-call |
| `/common-masters/brand-master` | no-service-import; no-api-call |
| `/common-masters/cabinet-type-master` | no-service-import; no-api-call |
| `/common-masters/chart-of-accounts-master` | no-service-import; no-api-call |
| `/common-masters/company-master` | no-service-import; no-api-call |
| `/common-masters/cost-center-master` | no-service-import; no-api-call |
| `/common-masters/counter-material-master` | no-service-import; no-api-call |
| `/common-masters/customer-master` | no-service-import; no-api-call |
| `/common-masters/department-master` | no-service-import; no-api-call |
| `/common-masters/employee-master` | no-service-import; no-api-call |
| `/common-masters/finish-master` | no-service-import; no-api-call |
| `/common-masters/hardware-master` | no-service-import; no-api-call |
| `/common-masters/installation-type-master` | no-service-import; no-api-call |
| `/common-masters/item-category-master` | no-service-import; no-api-call |
| `/common-masters/item-master` | no-service-import; no-api-call |
| `/common-masters/kitchen-layout-master` | no-service-import; no-api-call |
| `/common-masters/location-master` | no-service-import; no-api-call |
| `/common-masters/material-grade-master` | no-service-import; no-api-call |
| `/common-masters/plant-master` | no-service-import; no-api-call |
| `/common-masters/quality-parameter-master` | no-service-import; no-api-call |
| `/common-masters/routing-master` | no-service-import; no-api-call |
| `/common-masters/skill-master` | no-service-import; no-api-call |
| `/common-masters/tax-master` | no-service-import; no-api-call |
| `/common-masters/uom-master` | no-service-import; no-api-call |
| `/common-masters/vendor-master` | no-service-import; no-api-call |
| `/common-masters/warehouse-master` | no-service-import; no-api-call |
| `/common-masters/work-center-master` | no-service-import; no-api-call |

## `hr` — 30 not-wired pages

| Route | Issues |
|---|---|
| `/hr/advanced-features` | no-service-import; no-api-call |
| `/hr/compliance/reports/dashboard` | no-service-import; no-api-call |
| `/hr/documents/repository/upload` | no-service-import; no-api-call |
| `/hr/employees/add` | no-service-import; no-api-call |
| `/hr/employees/add-enhanced` | no-service-import; no-api-call |
| `/hr/employees/edit/[id]` | no-service-import; no-api-call |
| `/hr/expenses/expense-management/submit` | no-service-import; no-api-call |
| `/hr/leave/balance/team` | no-service-import; no-api-call |
| `/hr/leave/edit/[id]` | no-service-import; no-api-call |
| `/hr/leave/encashment/requests` | no-service-import; no-api-call; mock-data |
| `/hr/leave/encashment/workflow` | no-service-import; no-api-call |
| `/hr/leave/policies` | no-service-import; no-api-call; console-log-onclick |
| `/hr/leave/reports/analytics` | no-service-import; no-api-call |
| `/hr/offboarding/docs` | no-service-import; no-api-call |
| `/hr/offboarding/fnf` | no-service-import; no-api-call |
| `/hr/onboarding` | no-service-import; no-api-call |
| `/hr/onboarding/induction/department` | no-service-import; no-api-call |
| `/hr/onboarding/offers/[id]` | no-service-import; no-api-call |
| `/hr/overtime/settings` | no-service-import; no-api-call; TODO(x2) |
| `/hr/payroll/edit/[id]` | no-service-import; no-api-call |
| `/hr/performance/edit/[id]` | no-service-import; no-api-call |
| `/hr/performance/goals/alignment` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/goals/tracking` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/pip/create` | no-service-import; no-api-call |
| `/hr/performance/reports/trends` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/reviews/rating` | no-service-import; no-api-call; coming-soon |
| `/hr/succession/plans/create` | no-service-import; no-api-call |
| `/hr/succession/reports/analytics` | no-service-import; no-api-call |
| `/hr/training/programs/create` | no-service-import; no-api-call |
| `/hr/travel/cards/transactions` | no-service-import; no-api-call; mock-data |

## `inventory` — 28 not-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments/create` | no-service-import; no-api-call |
| `/inventory/adjustments/quantity` | no-service-import; no-api-call |
| `/inventory/adjustments/value` | no-service-import; no-api-call |
| `/inventory/adjustments/write-offs` | no-service-import; no-api-call |
| `/inventory/advanced-features` | no-service-import; no-api-call |
| `/inventory/analytics/carrying-cost` | no-service-import; no-api-call |
| `/inventory/analytics/dead-stock` | no-service-import; no-api-call |
| `/inventory/analytics/velocity` | no-service-import; no-api-call |
| `/inventory/cycle-count/physical` | no-service-import; no-api-call |
| `/inventory/cycle-count/reconciliation` | no-service-import; no-api-call |
| `/inventory/cycle-count/variance` | no-service-import; no-api-call |
| `/inventory/items/[id]` | no-service-import; no-api-call |
| `/inventory/kitting/assembly` | no-service-import; no-api-call |
| `/inventory/kitting/disassembly` | no-service-import; no-api-call |
| `/inventory/kitting/kits` | no-service-import; no-api-call |
| `/inventory/movements/reports` | no-service-import; no-api-call |
| `/inventory/optimization/eoq` | no-service-import; no-api-call |
| `/inventory/optimization/safety-stock` | no-service-import; no-api-call |
| `/inventory/replenishment/min-max` | no-service-import; no-api-call |
| `/inventory/settings/categories` | no-service-import; no-api-call |
| `/inventory/settings/policies` | no-service-import; no-api-call |
| `/inventory/settings/storage` | no-service-import; no-api-call |
| `/inventory/settings/uom` | no-service-import; no-api-call |
| `/inventory/stock/add` | no-service-import; no-api-call |
| `/inventory/stock/edit/[id]` | no-service-import; no-api-call |
| `/inventory/stock/low-stock` | no-service-import; no-api-call; TODO(x4); not-implemented |
| `/inventory/transfers/create` | no-service-import; no-api-call |
| `/inventory/transfers/view/[id]` | no-service-import; no-api-call |

## `it-admin` — 28 not-wired pages

| Route | Issues |
|---|---|
| `/it-admin/audit/changes` | no-service-import; no-api-call |
| `/it-admin/audit/compliance` | no-service-import; no-api-call |
| `/it-admin/audit/logins` | no-service-import; no-api-call |
| `/it-admin/customization/branding` | no-service-import; no-api-call |
| `/it-admin/customization/workflows` | no-service-import; no-api-call |
| `/it-admin/database/cleanup` | no-service-import; no-api-call |
| `/it-admin/database/import` | no-service-import; no-api-call |
| `/it-admin/license` | no-service-import; no-api-call |
| `/it-admin/monitoring/errors` | no-service-import; no-api-call |
| `/it-admin/monitoring/health` | no-service-import; no-api-call |
| `/it-admin/monitoring/performance` | no-service-import; no-api-call |
| `/it-admin/roles/create` | no-service-import; no-api-call |
| `/it-admin/roles/hierarchy` | no-service-import; no-api-call |
| `/it-admin/scheduler/automation` | no-service-import; no-api-call |
| `/it-admin/scheduler/history` | no-service-import; no-api-call |
| `/it-admin/security/2fa` | no-service-import; no-api-call |
| `/it-admin/security/alerts` | no-service-import; no-api-call |
| `/it-admin/security/password` | no-service-import; no-api-call |
| `/it-admin/security/sessions` | no-service-import; no-api-call |
| `/it-admin/security/sso` | no-service-import; no-api-call |
| `/it-admin/system/email` | no-service-import; no-api-call |
| `/it-admin/system/notifications` | no-service-import; no-api-call |
| `/it-admin/system/scalability` | no-service-import; no-api-call |
| `/it-admin/system/scalability/caching` | no-service-import; no-api-call |
| `/it-admin/system/scalability/load-balancing` | no-service-import; no-api-call |
| `/it-admin/system/scalability/sharding` | no-service-import; no-api-call |
| `/it-admin/users/bulk` | no-service-import; no-api-call |
| `/it-admin/users/create` | no-service-import; no-api-call |

## `estimation` — 27 not-wired pages

| Route | Issues |
|---|---|
| `/estimation` | no-service-import; no-api-call |
| `/estimation/analytics/accuracy` | no-service-import; no-api-call |
| `/estimation/analytics/performance` | no-service-import; no-api-call |
| `/estimation/analytics/reports` | no-service-import; no-api-call |
| `/estimation/analytics/reports/schedule` | no-service-import; no-api-call |
| `/estimation/analytics/reports/schedule/[id]` | no-service-import; no-api-call |
| `/estimation/analytics/win-loss` | no-service-import; no-api-call |
| `/estimation/boq/comparison` | no-service-import; no-api-call |
| `/estimation/boq/edit/[id]` | no-service-import; no-api-call |
| `/estimation/boq/templates` | no-service-import; no-api-call |
| `/estimation/boq/templates/create` | no-service-import; no-api-call |
| `/estimation/boq/templates/edit/[id]` | no-service-import; no-api-call; mock-data |
| `/estimation/costing/add` | no-service-import; no-api-call |
| `/estimation/costing/edit/[id]` | no-service-import; no-api-call |
| `/estimation/pricing/edit/[id]` | no-service-import; no-api-call |
| `/estimation/rates/equipment/add` | no-service-import; no-api-call |
| `/estimation/rates/labor/add` | no-service-import; no-api-call |
| `/estimation/rates/materials/add` | no-service-import; no-api-call |
| `/estimation/rates/materials/history/[id]` | no-service-import; no-api-call |
| `/estimation/rates/subcontractors` | no-service-import; no-api-call |
| `/estimation/rates/subcontractors/add` | no-service-import; no-api-call |
| `/estimation/workflow/approved` | no-service-import; no-api-call |
| `/estimation/workflow/converted` | no-service-import; no-api-call |
| `/estimation/workflow/drafts/create` | no-service-import; no-api-call |
| `/estimation/workflow/drafts/edit/[id]` | no-service-import; no-api-call |
| `/estimation/workflow/pending/comments/[id]` | no-service-import; no-api-call |
| `/estimation/workflow/send/[id]` | no-service-import; no-api-call |

## `production` — 22 not-wired pages

| Route | Issues |
|---|---|
| `/production/advanced-features` | no-service-import; no-api-call |
| `/production/analytics/efficiency` | no-service-import; no-api-call |
| `/production/analytics/productivity` | no-service-import; no-api-call |
| `/production/analytics/variance` | no-service-import; no-api-call |
| `/production/bom/add` | no-service-import; no-api-call; mock-data |
| `/production/capacity-planning` | no-service-import; no-api-call |
| `/production/collaboration` | no-service-import; no-api-call |
| `/production/downtime/log` | no-service-import; no-api-call; TODO(x1) |
| `/production/floor/edit/[id]` | no-service-import; no-api-call |
| `/production/floor/view/[id]` | no-service-import; no-api-call |
| `/production/mrp` | no-service-import; no-api-call; TODO(x2) |
| `/production/planning/aggregate` | no-service-import; no-api-call |
| `/production/quality/add` | no-service-import; no-api-call; mock-data; alert-onclick |
| `/production/quality/dashboard` | no-service-import; no-api-call |
| `/production/quality/edit/[id]` | no-service-import; no-api-call |
| `/production/quality/view/[id]` | no-service-import; no-api-call |
| `/production/resilience` | no-service-import; no-api-call |
| `/production/scheduling/add` | no-service-import; no-api-call; mock-data |
| `/production/scheduling/edit/[id]` | no-service-import; no-api-call; mock-data |
| `/production/settings` | no-service-import; no-api-call |
| `/production/work-orders/add` | no-service-import; no-api-call; mock-data |
| `/production/work-orders/add-enhanced` | no-service-import; no-api-call |

## `logistics` — 19 not-wired pages

| Route | Issues |
|---|---|
| `/logistics/advanced-features` | no-service-import; no-api-call |
| `/logistics/analytics/reports` | no-service-import; no-api-call |
| `/logistics/analytics/spend` | no-service-import; no-api-call |
| `/logistics/carriers/add` | no-service-import; no-api-call |
| `/logistics/carriers/edit/[id]` | no-service-import; no-api-call |
| `/logistics/driver-master` | no-service-import; no-api-call |
| `/logistics/drivers/compliance` | no-service-import; no-api-call |
| `/logistics/fleet/maintenance` | no-service-import; no-api-call |
| `/logistics/freight-master` | no-service-import; no-api-call |
| `/logistics/packaging-master` | no-service-import; no-api-call |
| `/logistics/planning/consolidation` | no-service-import; no-api-call |
| `/logistics/planning/dispatch` | no-service-import; no-api-call |
| `/logistics/planning/loads` | no-service-import; no-api-call |
| `/logistics/port-master` | no-service-import; no-api-call |
| `/logistics/route-master` | no-service-import; no-api-call |
| `/logistics/shipping/edit/[id]` | no-service-import; no-api-call |
| `/logistics/tracking/trace` | no-service-import; no-api-call |
| `/logistics/transporter-master` | no-service-import; no-api-call |
| `/logistics/vehicle-master` | no-service-import; no-api-call |

## `support` — 15 not-wired pages

| Route | Issues |
|---|---|
| `/support` | no-service-import; no-api-call |
| `/support/advanced-features` | no-service-import; no-api-call |
| `/support/changes/create` | no-service-import; no-api-call |
| `/support/incidents/create` | no-service-import; no-api-call |
| `/support/incidents/critical` | no-service-import; no-api-call |
| `/support/incidents/major` | no-service-import; no-api-call |
| `/support/incidents/tracking` | no-service-import; no-api-call |
| `/support/knowledge/create` | no-service-import; no-api-call |
| `/support/onboarding` | no-service-import; no-api-call |
| `/support/problems` | no-service-import; no-api-call |
| `/support/problems/create` | no-service-import; no-api-call |
| `/support/problems/rca` | no-service-import; no-api-call |
| `/support/tickets/assigned` | no-service-import; no-api-call |
| `/support/tickets/create` | no-service-import; no-api-call |
| `/support/tickets/resolved` | no-service-import; no-api-call |

## `after-sales-service` — 14 not-wired pages

| Route | Issues |
|---|---|
| `/after-sales-service` | no-service-import; no-api-call |
| `/after-sales-service/advanced-features` | no-service-import; no-api-call |
| `/after-sales-service/billing/view/[id]` | no-service-import; no-api-call |
| `/after-sales-service/field-service/mobile` | no-service-import; no-api-call; coming-soon |
| `/after-sales-service/field-service/tracking` | no-service-import; no-api-call; mock-data |
| `/after-sales-service/field-service/view/[id]` | no-service-import; no-api-call |
| `/after-sales-service/installations/add` | no-service-import; no-api-call; mock-data |
| `/after-sales-service/installations/completed` | no-service-import; no-api-call |
| `/after-sales-service/installations/view/[id]` | no-service-import; no-api-call |
| `/after-sales-service/knowledge/articles` | no-service-import; no-api-call; mock-data |
| `/after-sales-service/service-contracts/renew/[id]` | no-service-import; no-api-call |
| `/after-sales-service/service-contracts/terms` | no-service-import; no-api-call |
| `/after-sales-service/service-requests/add` | no-service-import; no-api-call; mock-data |
| `/after-sales-service/warranties/add` | no-service-import; no-api-call; mock-data |

## `project-management` — 14 not-wired pages

| Route | Issues |
|---|---|
| `/project-management/[id]/logistics` | no-service-import; no-api-call |
| `/project-management/[id]/procurement/receipt` | no-service-import; no-api-call |
| `/project-management/[id]/qc` | no-service-import; no-api-call |
| `/project-management/capacity` | no-service-import; no-api-call; mock-data; coming-soon |
| `/project-management/critical-path` | no-service-import; no-api-call |
| `/project-management/documents/upload/boq` | no-service-import; no-api-call |
| `/project-management/documents/upload/drawings` | no-service-import; no-api-call |
| `/project-management/documents/upload/renders` | no-service-import; no-api-call |
| `/project-management/milestone-timeline` | no-service-import; no-api-call |
| `/project-management/phase-2` | no-service-import; no-api-call |
| `/project-management/phase-progress` | no-service-import; no-api-call |
| `/project-management/quality-inspection-enhanced` | no-service-import; no-api-call |
| `/project-management/resource-conflicts` | no-service-import; no-api-call |
| `/project-management/workflow` | no-service-import; no-api-call |

## `cpq` — 10 not-wired pages

| Route | Issues |
|---|---|
| `/cpq/advanced-features` | no-service-import; no-api-call; mock-data |
| `/cpq/contracts/approvals` | no-service-import; no-api-call |
| `/cpq/contracts/execution` | no-service-import; no-api-call |
| `/cpq/contracts/generate` | no-service-import; no-api-call |
| `/cpq/pricing/dynamic` | no-service-import; no-api-call |
| `/cpq/products/options` | no-service-import; no-api-call |
| `/cpq/proposals/builder` | no-service-import; no-api-call |
| `/cpq/proposals/signatures` | no-service-import; no-api-call |
| `/cpq/quotes/create` | no-service-import; no-api-call |
| `/cpq/settings/general` | no-service-import; no-api-call |

## `sales` — 5 not-wired pages

| Route | Issues |
|---|---|
| `/sales/advanced-features` | no-service-import; no-api-call |
| `/sales/invoices/[id]` | no-service-import; no-api-call |
| `/sales/invoices/create` | no-service-import; no-api-call |
| `/sales/orders/[id]` | no-service-import; no-api-call |
| `/sales/orders/create-enhanced` | no-service-import; no-api-call |

## `_finance_deprecated` — 5 not-wired pages

| Route | Issues |
|---|---|
| `/_finance_deprecated` | no-service-import; no-api-call; coming-soon |
| `/_finance_deprecated/currency/gain-loss` | no-service-import; no-api-call; mock-data; alert-onclick |
| `/_finance_deprecated/payables/aging` | no-service-import; no-api-call; mock-data |
| `/_finance_deprecated/receivables/aging` | no-service-import; no-api-call; mock-data |
| `/_finance_deprecated/reports` | no-service-import; no-api-call |

## `workflow` — 4 not-wired pages

| Route | Issues |
|---|---|
| `/workflow/automation/advanced-features` | no-service-import; no-api-call |
| `/workflow/automation/create` | no-service-import; no-api-call |
| `/workflow/designer` | no-service-import; no-api-call; coming-soon |
| `/workflow/templates/create` | no-service-import; no-api-call |

## `projects` — 3 not-wired pages

| Route | Issues |
|---|---|
| `/projects` | no-service-import; no-api-call |
| `/projects/advanced-features` | no-service-import; no-api-call |
| `/projects/planning/create` | no-service-import; no-api-call |

## `advanced-features` — 3 not-wired pages

| Route | Issues |
|---|---|
| `/advanced-features` | no-service-import; no-api-call |
| `/advanced-features/ai-insights` | no-service-import; no-api-call |
| `/advanced-features/ocr` | no-service-import; no-api-call |

## `compliance` — 3 not-wired pages

| Route | Issues |
|---|---|
| `/compliance` | no-service-import; no-api-call |
| `/compliance/gdpr` | no-service-import; no-api-call |
| `/compliance/reporting` | no-service-import; no-api-call |

## `(dashboard)` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/(dashboard)` | no-service-import; no-api-call |
| `/(dashboard)/inventory` | no-service-import; no-api-call; mock-data |

## `notifications` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/notifications` | no-service-import; no-api-call |
| `/notifications/preferences` | no-service-import; no-api-call |

## `settings` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/settings` | no-service-import; no-api-call |
| `/settings/form-ux-demo` | no-service-import; no-api-call |

## `dashboard` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/dashboard` | no-service-import; no-api-call |

## `help` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/help` | no-service-import; no-api-call |

## `external` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/external/project/[projectId]/approval/[token]` | no-service-import; no-api-call |

## `portal` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/portal` | no-service-import; no-api-call |

## `rfq` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/rfq/advanced-features` | no-service-import; no-api-call |

## `design-system` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/design-system` | no-service-import; no-api-call |

## `quality` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/quality/inspections/new-enhanced` | no-service-import; no-api-call |

## `collaboration` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/collaboration` | no-service-import; no-api-call |

## `documentation` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/documentation` | no-service-import; no-api-call |

## `profile` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/profile` | no-service-import; no-api-call |

