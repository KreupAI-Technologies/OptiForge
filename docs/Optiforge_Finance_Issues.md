# Finance — Detailed Issues Report

**Verified:** 2026-07-21
**Scope:** The 1 Finance page flagged in `Optiforge_Whats_Left.md`
**Method:** Direct code inspection of the flagged file

---

## Scope note

The audit only flagged **1 issue** in Finance, but the module actually contains **~128 page.tsx files** across:

- `(modules)/finance/*` — 88 pages (accounting, AP, AR, assets, banks, billing, budget, budgeting, cash, consolidation, controls, cost-centers, costing, credit, currency, dashboard, expense-claims, GL, integration, integrations, investments, invoices, journal, ledger, multi-currency, payables, payments, period-operations, periods, petty-cash, receivables, reconciliation, reporting, reports, tax, workflows, automation, advanced-features, analytics)
- `(modules)/reports/finance/*` — 40 pages (AP/AR aging, balance sheet, cash flow, cost center, expense analysis, GL, P&L, revenue analysis, tax summary, trial balance)

Only the 1 flagged page was verified in this pass. Say the word if you want a full sweep of the remaining ~127.

---

## Corrected Numbers

| Status | Count | Notes |
|---|---:|---|
| **Actually FIXED** | 0 | |
| **PARTIAL** | 1 | Real fetch + 3 primary actions wired; 2 secondary actions stubbed |
| **Real BROKEN** | 0 | |
| **Total flagged** | **1** | |

**Bottom line:** the previous audit label "No fetch — handleRunDepreciation toast only" is **stale on both counts**. Fetch is real, and Run Depreciation actually calls a service. Only 2 secondary buttons (View Schedule, Pause Schedule) remain as toast stubs.

---

## The 1 flagged page — corrected

### [`/finance/assets/depreciation`](b3-erp/frontend/src/app/(modules)/finance/assets/depreciation/page.tsx)

**Previous label:** *"No fetch — page.tsx:72-85 handleRunDepreciation toast only"*
**Actual state:** **PARTIAL** — real fetch + 3 wired actions + 2 stubs

| Aspect | Status | Evidence |
|---|---|---|
| Fetch | **REAL** | L138-230 `useEffect` → `FinanceService.getFixedAssets()` (L144); derives depreciation schedules + entries from real fixed-asset data |
| Run Depreciation button | **WIRED** | L331 onClick → `handleRunDepreciation` (L73) → `FinanceService.runDepreciation()` (L78); shows progress toast + refreshes on success |
| Manual Entry button | **WIRED** | L337 onClick → `handleManualEntry` (L90) → `FinanceService.manualDepreciationEntry(assetCode, amount)` (L96); prompt-based input, refreshes on success |
| Export button | **WIRED** | L343 onClick → `handleExport` (L107) → `exportToCsv('depreciation-schedules', filteredSchedules)` |
| View Schedule (row action) | **STUB** | L535 onClick → `handleViewSchedule` (L111) — toast only. Code comment L113-118 says "In a real app, you would fetch detailed depreciation schedule from API, open modal, etc." |
| Pause Schedule (row action) | **STUB** | L541 onClick → `handlePauseSchedule` (L120) — toast only. Code comment L124-128 says "In a real app, you would PUT to /api/assets/depreciation/pause/{assetId}, update status, log the pause action" |
| Search / filters | Working | L58-60, L232-249 client-side filter on fetched data |
| Statistics cards | Derived from real data | L252-263 aggregates fetched schedules/entries |
| Toast notifications | Working | L67-70 |
| Loading + error states | Present | L312-321 |

---

## Defect breakdown

| Defect | Count | Route |
|---|---:|---|
| Row-action "View" toast only, no modal/API | 1 | depreciation (View Schedule button) |
| Row-action "Pause" toast only, no PUT to `/api/assets/depreciation/pause/{assetId}` | 1 | depreciation (Pause Schedule button) |
| Missing onClick / mock data / no fetch (previous audit label) | 0 | **All stale** |

---

## Fix strategy

### Only remaining work
1. **`/finance/assets/depreciation`** — wire the 2 row actions:
   - `handleViewSchedule` — replace toast with modal showing month-by-month breakdown (need a new endpoint like `FinanceService.getDepreciationSchedule(assetId)` or fetch entries filtered by asset)
   - `handlePauseSchedule` — replace toast with `FinanceService.pauseDepreciation(assetId)` (need new endpoint)

### Estimated effort

| Bucket | Est. work |
|---|---|
| Wire View Schedule modal (needs modal + service method) | ~2-3 h |
| Wire Pause Schedule (needs backend PUT endpoint + wiring) | ~2-4 h |
| **Total** | **~4-7 h** |

---

## Sources of truth

- Route file: `b3-erp/frontend/src/app/(modules)/finance/assets/depreciation/page.tsx`
- Service: `b3-erp/frontend/src/services/finance.service.ts` (exports `FinanceService` with `getFixedAssets`, `runDepreciation`, `manualDepreciationEntry` — but missing `getDepreciationSchedule(assetId)` and `pauseDepreciation(assetId)` needed for the fix)

---

## Recommendation

If you want a full Finance sweep (all ~128 pages), I can launch parallel verification agents grouped by sub-module:

- **Accounting** (10 pages) — chart of accounts, GL, journal entries, ledger, periods, trial balance
- **AP / Payables** (8) — bills, payments, aging, vendor management
- **AR / Receivables** (8) — invoices, aging, collections, credit management
- **Assets** (4) — fixed assets, depreciation, disposal
- **Cash / Banks** (7) — bank accounts, reconciliation, cash flow forecast
- **Budgeting** (4) — budgets, budget vs actual, multi-year planning
- **Costing** (8) — job costing, standard costing, variance analysis, WIP
- **Consolidation** (3) — financial, intercompany
- **Controls** (4) — approval workflows, audit trail, documents
- **Currency** (3) — exchange rates, management
- **Reports** (40) — all standard financial statements
- **Other** (~29) — dashboard, expense claims, invoices, payments, periods, reporting, tax, workflows, automation

Just say "do the full Finance sweep" and I'll launch the agents.
