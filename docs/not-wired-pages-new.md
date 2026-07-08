# Not-Wired Pages Report — Verified

_Verified via import-following investigation on 2026-07-06_

> ✅ **COMPLETED 2026-07-07** — All 28 GENUINELY-NOT-WIRED pages (Section 1) wired full-stack on branch `feat/wire-28-not-wired-pages` (13 commits `ef0833da`…`4d0c6e37`, off `main`). Recipe: reuse existing endpoint where present, else read-side Prisma model + idempotent additive `orphan_*.sql` + NestJS controller/service + FE service + component wiring with loading/error/empty states. Verification green every commit (`prisma generate` + `nest build` exit 0; frontend `tsc --noEmit` 0 errors). For the ~10 `*/advanced-features` tab shells, the primary/overview data view was wired to a real endpoint; deliberately-decorative sub-tabs left as showcase (noted per commit). 8 `orphan_*.sql` files gained additive tables/seeds — **now applied to live Neon** via `npm run db:manual` (commit `b252520f`; `db:manual:status` clean). Two apply-time-only SQL defects fixed in that commit: it-admin seed inserted text into a native-enum `status` column, and the new notification-preferences table collided with an existing TypeORM table (renamed to `notification_user_preferences`). Sections 2 (static-by-design) and 3 (wired-via-delegation) correctly need no work.

## What changed

An earlier regex scan flagged **149** pages as "not-wired at page level" — but this heuristic only reads `page.tsx` and cannot see when a page delegates to a component that IS wired. After removing 31 common-masters false positives, 118 pages remained. **Each of those 118 was manually verified via import-following (3 levels deep) into the components they render.**

The truth: **only 28 of 118 pages are actually not wired.** The rest are either wired via delegation (48 false positives) or intentionally static (42 nav-hubs, docs pages, coming-soon stubs, deprecated folders).

## Summary

| Verdict | Count | Meaning |
|---|---|---|
| 🔴 **GENUINELY-NOT-WIRED** | **28** | Real gaps — need backend wiring work |
| ⚪ **STATIC-BY-DESIGN** | **42** | Nav-hubs, docs pages, coming-soon stubs, deprecated. Should NOT be wired. Remove from punch list. |
| 🟢 **WIRED-VIA-DELEGATION** | **48** | Page-level regex missed it, but the delegated component IS wired. No work needed. |
| **Total re-verified** | **118** | |

---

# 🔴 Section 1: GENUINELY NOT WIRED (28 pages)

These need real backend wiring work. Grouped by module for build planning.

## Finance (2)

| Route | Notes |
|---|---|
| `/finance/expense-claims/[id]` | Uses hardcoded mock `claim` object. Needs `GET /finance/expense-claims/:id` |
| `/finance/integrations` | `FinancialIntegrations.tsx` is a direct component with `useState`/`useEffect` but no API calls |

## Logistics (1)

| Route | Notes |
|---|---|
| `/logistics/advanced-features` | Client page with hardcoded data / no API |

## HR (1)

| Route | Notes |
|---|---|
| `/hr/advanced-features` | Direct client page with local state, no API |

## Production (4) — all delegate to unwired `industry4/*` components

| Route | Notes |
|---|---|
| `/production/advanced-features` | Tab shell → unwired industry4 components |
| `/production/analytics/variance` | Direct client page, no API |
| `/production/collaboration` | Delegates to unwired industry4 |
| `/production/resilience` | Delegates to unwired industry4 |

## Project-Management (5) — all delegate to unwired components

| Route | Notes |
|---|---|
| `/project-management/critical-path` | `CriticalPathHighlight` has no API imports |
| `/project-management/phase-2` | Direct client page with hardcoded steps |
| `/project-management/phase-progress` | `PhaseProgressVisualization` unwired |
| `/project-management/resource-conflicts` | `ResourceConflictAlerts` unwired |
| `/project-management/workflow` | `WorkflowQuickActions` + `PhaseProgressVisualization` both unwired |

## After-Sales-Service (2)

| Route | Notes |
|---|---|
| `/after-sales-service` | Landing page with hardcoded stats |
| `/after-sales-service/advanced-features` | Tab shell + unwired components |

## IT-Admin (1)

| Route | Notes |
|---|---|
| `/it-admin/security/sessions` | Hardcoded session data + CSV export. Needs sessions backend |

## Projects (legacy) (2)

| Route | Notes |
|---|---|
| `/projects/advanced-features` | Direct client page, no API |
| `/projects/planning/create` | Static form stub, no submit wiring |

## Reports (2)

| Route | Notes |
|---|---|
| `/reports/advanced-features` | Tab shell → unwired components |
| `/reports/dashboards` | Custom dashboards page, no API |

## Support (1)

| Route | Notes |
|---|---|
| `/support/advanced-features` | Tab shell → unwired components |

## Workflow (1)

| Route | Notes |
|---|---|
| `/workflow/automation/advanced-features` | Tab shell → unwired components |

## Landing dashboards (2)

| Route | Notes |
|---|---|
| `/` (root dashboard `(dashboard)`) | Hardcoded metric tiles |
| `/dashboard` | Same pattern — hardcoded tiles |

## Single-page `advanced-features` shells (5)

| Route | Notes |
|---|---|
| `/rfq/advanced-features` | Tab shell → unwired |
| `/sales/advanced-features` | Tab shell → unwired |
| `/cpq/advanced-features` | Direct client page with mock data |
| `/inventory/advanced-features` | Direct client page, no API |
| `/notifications/preferences` | Preferences form with local state only |

**Priority observation:** 10 of these 28 are `*/advanced-features` tab shells that delegate to unwired industry4/tab components. A single batch pass on those underlying components would knock out multiple pages at once.

---

# ⚪ Section 2: STATIC-BY-DESIGN — REMOVE FROM PUNCH LIST (42 pages)

These SHOULDN'T be wired to a backend. They are nav-hubs (link grids), documentation, coming-soon stubs, or deprecated folders. Keeping them in the "needs wiring" list creates false urgency.

## Finance nav-hubs (11) — pure `<Link>` grids into sub-routes

| Route | Notes |
|---|---|
| `/finance/analytics` | Link grid |
| `/finance/automation` | Link grid |
| `/finance/budgeting` | Link grid |
| `/finance/consolidation` | Link grid |
| `/finance/controls` | Link grid |
| `/finance/currency` | Link grid |
| `/finance/integration` | Link grid (production/procurement integrations) |
| `/finance/period-operations` | Link grid |
| `/finance/reporting` | Nav (single link) |
| `/finance/reports` | Link grid |
| `/finance/tax` | Link grid |

## `_finance_deprecated` (5) — folder name signals deprecation

| Route |
|---|
| `/_finance_deprecated` |
| `/_finance_deprecated/currency/gain-loss` |
| `/_finance_deprecated/payables/aging` |
| `/_finance_deprecated/receivables/aging` |
| `/_finance_deprecated/reports` |

## HR under-construction placeholders (5)

| Route | Notes |
|---|---|
| `/hr/leave/policies` | Static policy text |
| `/hr/performance/goals/alignment` | "Under construction" |
| `/hr/performance/goals/tracking` | "Under construction" |
| `/hr/performance/reports/trends` | "Under construction" |
| `/hr/performance/reviews/rating` | "Under construction" |

## `advanced-features` landing hubs (5) — link grids, not real features

| Route |
|---|
| `/advanced-features` (top-level) |
| `/advanced-features/ai-insights` (static content) |
| `/advanced-features/ocr` (demo/upload UI, no backend by design) |
| `/procurement/advanced-features` |
| `/crm/advanced-features` |

## Nav-hub / settings landings (4)

| Route | Notes |
|---|---|
| `/production/settings` | Nav-hub link grid |
| `/it-admin/system/scalability` | Nav-hub link grid |
| `/settings` | Nav-hub link grid |
| `/settings/form-ux-demo` | Design-system form demo |

## Static docs / help / design (5)

| Route |
|---|
| `/design-system` |
| `/documentation` |
| `/help` |
| `/compliance` (nav-hub) |
| `/collaboration` (nav-hub / feed shell) |

## Coming-soon / redirect stubs (5)

| Route | Notes |
|---|---|
| `/support/onboarding` | Wizard content, static |
| `/workflow/designer` | "Coming soon" designer stub |
| `/after-sales-service/field-service/mobile` | Mobile app promo page ("coming soon") |
| `/crm/leads/edit` | "Lead ID required" redirect stub (by design) |
| `/portal` | Portal landing nav-hub |

## Recommended action

Delete these 42 rows from any punch list. If desired, add a top-level tag `STATIC-BY-DESIGN` inside the individual files so future scans skip them.

---

# 🟢 Section 3: WIRED VIA DELEGATION — FALSE POSITIVES (48 pages)

Page-level scan couldn't see across file boundaries. These pages render a component from `src/components/*` that IS wired end-to-end. **No work needed.**

## Finance (13) — `Financial*.tsx` re-export pattern

Each of these page.tsx delegates to `Financial<Something>` under `src/components/finance/`, which is a one-line re-export of the canonical wired component.

| Route | Delegates To → Canonical Component |
|---|---|
| `/finance/accounts-payable` | `FinancialPayables` → `AccountsPayableWorkflow` |
| `/finance/accounts-receivable` | `FinancialReceivables` → `AccountsReceivableManagement` |
| `/finance/bank-reconciliation` | `FinancialBankreconciliation` → `BankReconciliation` |
| `/finance/budget` | `FinancialBudgetManagement` → `BudgetManagement` |
| `/finance/cash-flow` | `FinancialCashFlow` → `CashFlowManagement` |
| `/finance/cost-centers` | `FinancialCostcenters` → `CostCenterManagement` |
| `/finance/credit` | `FinancialCredit` → `CreditManagement` |
| `/finance/dashboard` | `EnhancedFinanceDashboard` (has API calls) |
| `/finance/general-ledger` | `FinancialGeneralLedger` → `GeneralLedger` |
| `/finance/investments` | `FinancialInvestments` → `InvestmentPortfolio` |
| `/finance/multi-currency` | `FinancialMulticurrency` → `MultiCurrencyManagement` |
| `/finance/periods` | `FinancialPeriods` → `FinancialPeriodManagement` (direct API impl) |
| `/finance/workflows` | `FinancialWorkflows` (direct API impl) |

## Procurement (19) — all wired via `src/components/procurement/*`

| Route | Delegates To |
|---|---|
| `/procurement/analytics` | `ProcurementAnalytics` |
| `/procurement/automation` | `ProcurementAutomation` |
| `/procurement/budget-tracking` | `ProcurementBudget` |
| `/procurement/category-management` | `CategoryManagement` |
| `/procurement/collaboration` | `SupplierCollaboration` |
| `/procurement/compliance` | `ProcurementCompliance` |
| `/procurement/contract-management` | `ContractManagement` |
| `/procurement/e-marketplace` | `EProcurementMarketplace` |
| `/procurement/purchase-requisition` | `PurchaseRequisitionWorkflow` |
| `/procurement/quality-assurance` | `QualityAssurance` |
| `/procurement/rfq-rfp` | `RFQRFPManagement` |
| `/procurement/risk-management` | `ProcurementRiskManagement` |
| `/procurement/savings-tracker` | `ProcurementSavings` |
| `/procurement/spend-analysis` | `SpendAnalysis` |
| `/procurement/strategic-sourcing` | `StrategicSourcing` |
| `/procurement/supplier-diversity` | `SupplierDiversity` |
| `/procurement/supplier-onboarding` | `SupplierOnboarding` |
| `/procurement/supplier-relationship` | `SupplierRelationshipManagement` |
| `/procurement/supplier-scorecard` | `SupplierScorecard` |

## CRM (9)

| Route | Delegates To |
|---|---|
| `/crm/advanced-features/accounts` | `AccountContactManagement` |
| `/crm/advanced-features/activity` | `ActivityManagementTracking` |
| `/crm/advanced-features/automation` | `SalesAutomation` |
| `/crm/advanced-features/collaboration` | `CollaborationIntelligence` |
| `/crm/advanced-features/customer360` | `Customer360View` |
| `/crm/advanced-features/lead-scoring` | `LeadScoringQualification` |
| `/crm/advanced-features/pipeline` | `SalesPipelineManagement` |
| `/crm/customers/360` | `Customer360Unified` |
| `/crm/opportunities/kanban` | `PipelineKanban` |

## Logistics `*-master` (7) — all wired via `src/components/logistics/*Master.tsx`

| Route | Delegates To |
|---|---|
| `/logistics/driver-master` | `DriverMaster` |
| `/logistics/freight-master` | `FreightMaster` |
| `/logistics/packaging-master` | `PackagingMaster` |
| `/logistics/port-master` | `PortMaster` |
| `/logistics/route-master` | `RouteMaster` |
| `/logistics/transporter-master` | `TransporterMaster` |
| `/logistics/vehicle-master` | `VehicleMaster` |

## HR (1) — page-level fetch but scanner regex missed it

| Route | Notes |
|---|---|
| `/hr/compliance/reports/dashboard` | Uses page-level `fetch(\`${process.env.NEXT_PUBLIC_API_URL}/hr/compliance-licenses/summary\`)` — not matched by scanner regex |

## Recommended action

Delete these 48 rows from any punch list. If desired, tighten the scanner to follow imports 3 levels deep (see `docs/not-wired-pages.md` completion banner — the docs author already implemented this technique).

---

# Bottom line

- **28 pages** truly need wiring work — that's the actual punch list
- **42 pages** should be removed from the list (static-by-design)
- **48 pages** are already wired via delegation — regex false positives

If you fix the 28 real gaps (~2-3 sprints), you're at essentially 100% wiring coverage for functional pages, with the remaining 42 correctly staying static.
