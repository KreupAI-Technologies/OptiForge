# Partially-Wired Pages Report

> ## ✅ RESOLVED — branch `feat/production-readiness-complete` (follow-up to `78a0a080`)
> All 21 pages below were re-audited by following imports into their **child modal components** (depth ≤ 3), which is where every marker actually lived — the `page.tsx` files were already clean. Outcome:
> - **Stale `// TODO: API call…` comments** (the vast majority): the modal already fires an `onSubmit`/`onSave`/`onExport`/`onConfirm` callback and the parent page's handler calls the real service (e.g. `procurementContractService.createContract`, `bomService.createBOM`, `ProductionOrphanService.*`, `FinanceService.updateCreditLimit`). Comments deleted.
> - **Genuine broken submits** (modal `console.log`-ed instead of calling its callback): `BOMCoreModals` create/update/copy now fire their callbacks → parent's real service runs. Fixed in `DowntimeExportModals`, `InventoryMovementModals`, `InventoryStockModals`, `ShopFloorExportModals` likewise.
> - **Fabricated mock data removed** → honest empty states / real fetches: GRN `mockPOData` + hardcoded GRN/stock history, inventory stock `recentTransactions`, credit-review `console.log` submits → real `FinanceService` calls, tool-prep sample tools → `projectManagementService.getDeployedTools`, quality-report `DEFAULT_DATA` → empty state.
> - **Unimplemented export/CSV features** implemented via client-side `exportToCsv`, or real reads (`inventoryService.getStockBalances/getStockEntries`); genuinely missing endpoints (scheduled exports, AR aging-alert persistence, work-order BOM lookup) surfaced as honest "not available"/manual-entry rather than fake success.
>
> **Verification:** frontend `tsc --noEmit` = 0 errors; a transitive depth-≤3 re-scan of all 21 page trees for `TODO/FIXME/HACK/MOCK_/mockData/// Mock/console.log/API call to/empty-onclick/coming-soon` = **0 hits**.
>
> ---

_Regenerated: 2026-07-09 (branch `main`, commit `78a0a080`)._
_Detector v3: import-following depth ≤ 3, follows relative + alias imports. Same classifier as [`wiring-audit-2026-07-09.md`](./wiring-audit-2026-07-09.md)._

Pages under `b3-erp/frontend/src/app/` that **do fetch data from the backend somewhere in their tree, but also contain a stub-style handler** (`alert()`, `console.log('click'|'save'|…)`, `// TODO`/`FIXME`/`HACK`, or empty `onClick`).

**Total partially-wired pages: 21**
**(Total scanned: 1724 · NOT_WIRED: 1 · PARTIAL: 21 · FULL: 1702 · DEPRECATED: 0)**

## Issue tags used

- `wired-via-delegation` — the `page.tsx` itself has no service import or API call, but a component it renders does — so the page IS wired
- `no-service-import` — nothing in the tree imports from a services alias or relative services path
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
| production | 9 |
| inventory | 5 |
| procurement | 3 |
| finance | 2 |
| crm | 1 |
| installation | 1 |

---

## `production` — 9 partially-wired pages

| Route | Issues |
|---|---|
| `/production/bom` | mock-data; TODO(x5) |
| `/production/bom/versions` | TODO(x9) |
| `/production/downtime` | TODO(x13) |
| `/production/downtime/analysis` | TODO(x10) |
| `/production/downtime/log` | TODO(x3) |
| `/production/downtime/rca` | TODO(x17) |
| `/production/quality` | TODO(x2) |
| `/production/shopfloor` | mock-data; TODO(x3) |
| `/production/shopfloor/operator` | TODO(x2) |

## `inventory` — 5 partially-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments` | TODO(x1) |
| `/inventory/movements` | TODO(x6) |
| `/inventory/stock` | TODO(x2) |
| `/inventory/stock/low-stock` | TODO(x2) |
| `/inventory/transfers` | TODO(x3) |

## `procurement` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/procurement/contracts` | TODO(x4) |
| `/procurement/grn` | mock-data; TODO(x7) |
| `/procurement/rfq-rfp` | wired-via-delegation; mock-data; TODO(x1) |

## `finance` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/finance/periods` | wired-via-delegation; mock-data; empty-onclick |
| `/finance/receivables/credit-management` | mock-data; console-log-stub |

## `crm` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/crm/customers/portal` | empty-onclick |

## `installation` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/installation/tool-prep` | empty-onclick |



The 18 definitely-real partial pages
🔴 HIGH — create/submit flow has no API call (10)
Route	TODO / stub says
/procurement/contracts	"API call to create contract"
/procurement/grn	"API call to create GRN"
/procurement/rfq-rfp	"API call to create RFQ"
/production/bom	"API call to create BOM"
/production/downtime	"API call to update downtime event"
/production/downtime/log	Same shared modal
/production/downtime/rca	"API call to create RCA investigation"
/production/quality	"Replace with actual API call"
/production/shopfloor	"API integration — POST /api/shopfloor/quality-alerts"
/finance/receivables/credit-management	handleSubmit just does console.log('Submitting credit review:', {…}) and closes


MEDIUM — export / bulk features incomplete (6)
Route	TODO says
/inventory/adjustments	"Parse CSV/Excel file and populate items" (bulk-upload)
/inventory/movements	"Fetch issue data based on originalIssueRef and populate items"
/inventory/stock	Save-as-draft + export TODOs (2)
/inventory/stock/low-stock	Same shared modals
/production/downtime/analysis	"Integrate with export API endpoint"
/production/shopfloor/operator	"Implement actual API call to export operator data"



 LOW — polish / types (2)
Route	TODO says
/inventory/transfers	"Add validation for current step" (nice-to-have)
/production/bom/versions	"Replace with actual BOM Version type from API" (types placeholder only)