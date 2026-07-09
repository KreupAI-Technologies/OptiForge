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

**Original scan (commit `78a0a080`): 21 partially-wired pages**
**(Total scanned: 1724 · NOT_WIRED: 1 · PARTIAL: 21 · FULL: 1702 · DEPRECATED: 0)**

**Current status (commit `f326c926`): all 21 resolved → 0 remaining.**
_The tables below are the original scan output, annotated with the resolution applied to each route. The `1 NOT_WIRED` page was reported by the scanner but not enumerated in the original output, so it is not addressed here — re-run the scanner (see note) to identify it._

> **How this was re-verified:** the external "Detector v3" tool is not committed to this repo, so it could not be re-run here. Verification was instead done with (a) frontend `tsc --noEmit` = 0 errors, and (b) a re-implementation of the detector's rule — a transitive, import-following (depth ≤ 3, `.tsx` tree) re-scan of all 21 page trees for the documented markers (`// TODO`/`// FIXME`/`// HACK`, `MOCK_`/`mockData`/`dummyData`/`// Mock`, `console.log('save'|'submit'|…)`, empty `onClick`, `coming soon`/`not implemented`, `API call to`) → **0 hits**. A fresh Detector v3 run is recommended to confirm against the authoritative classifier.

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

| Module | Partial (original) | Remaining |
|---|---|---|
| production | 9 | 0 ✅ |
| inventory | 5 | 0 ✅ |
| procurement | 3 | 0 ✅ |
| finance | 2 | 0 ✅ |
| crm | 1 | 0 ✅ |
| installation | 1 | 0 ✅ |
| **Total** | **21** | **0 ✅** |

> Every marker lived in a **child modal component** the page imports (depth ≤ 3), not the `page.tsx`. That is why an earlier page-only pass reported these as clean.

---

## `production` — 9 (all resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/production/bom` | mock-data; TODO(x5) | `BOMCoreModals` create/update/copy `console.log`-ed instead of firing their callback → now fire it, so parent's real `bomService.createBOM/updateBOM` runs. Dead "add components" console.logs removed. |
| `/production/bom/versions` | TODO(x9) | Stale type-placeholder / effect / validation TODOs removed; dropped hardcoded `changedBy:'Current User'` (backend stamps the authed user). Parent → `ProductionOrphanService.createBom/updateBom`. |
| `/production/downtime` | TODO(x13) | `DowntimeEventModals` stale `// TODO: API call…` comments removed; modal fires callbacks, parent calls `ProductionOrphanService`. |
| `/production/downtime/analysis` | TODO(x10) | Removed chart-note TODOs; export runs client-side via `exportToCsv` in parent. *(Chart areas remain visual placeholders — no charting lib; not a data stub.)* |
| `/production/downtime/log` | TODO(x3) | Same shared `DowntimeEventModals` — resolved with the above. |
| `/production/downtime/rca` | TODO(x17) | `DowntimeRCAModals` stale comments removed; `verifiedBy` now sourced from `useAuth` instead of a hardcoded name. Parent → `ProductionOrphanService.*RootCauseAnalysis`. |
| `/production/quality` | TODO(x2) | `QualityModals` stale "Replace with actual API call" removed; parent `handleEditSubmit/handleApproveSubmit` → `ProductionOrphanService.updateNcr`. |
| `/production/shopfloor` | mock-data; TODO(x3) | `ShopFloorActionModals` stale API-integration comments removed (parent → `createAndonLine`/`reportShopFloorDowntime`); `playAudioFeedback` now real Web Audio API (no `console.log`); fake operator name removed earlier. |
| `/production/shopfloor/operator` | TODO(x2) | `ShopFloorExportModals` fake `setTimeout` "simulation" removed; real export via `exportToCsv` in parent. |

## `inventory` — 5 (all resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/inventory/adjustments` | TODO(x1) | Bulk upload now uses a real client-side CSV parser (`FileReader`) mapping header columns → items (was mock items). |
| `/inventory/movements` | TODO(x6) | `RecordReturn` loads a real entry via `inventoryService.getStockEntries()`; print/export wired; also fixed variance-by-category grouping earlier. ⚠️ batch-issue work-order rows are **manual entry** (see NEEDS BACKEND). |
| `/inventory/stock` | TODO(x2) | Fabricated `recentTransactions` removed → prop + empty state; `// Mock hasTransactions` derived from on-hand qty; save-as-draft persists via `createStockEntry`. |
| `/inventory/stock/low-stock` | TODO(x2) | Same shared stock/export modals — resolved with the above. |
| `/inventory/transfers` | TODO(x3) | Real per-step validation; item details from `getStockBalances`; history from a real `transfers` prop (was `mockTransfers`). |

## `procurement` — 3 (all resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/procurement/contracts` | TODO(x4) | Stale `// TODO: API call…` removed; parent → `procurementContractService.create/renew/update/terminateContract`. |
| `/procurement/grn` | mock-data; TODO(x7) | Stale comments removed (parent → `goodsReceiptService.*`); **`mockPOData` auto-fill removed**; `GRNHistoryModal` hardcoded history → prop + empty state. |
| `/procurement/rfq-rfp` | wired-via-delegation; mock-data; TODO(x1) | Delegates to `RFQRFPManagement` (→ `procurementRFQService.createRFQ`). Bid-comparison export implemented via `exportToCsv` (was `{/* TODO */}`). |

## `finance` — 2 (all resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/finance/periods` | wired-via-delegation; mock-data; empty-onclick | Delegates to `FinancialPeriodManagement` (→ `FinanceService.getFinancialPeriods`, honest empty state). Display-only "completed" checkbox made `readOnly` (was empty `onChange`). |
| `/finance/receivables/credit-management` | mock-data; console-log-stub | `CreditManagementModals` — six `console.log` submits now call `FinanceService.updateCreditLimit` (review/hold/release/request/approve). ⚠️ AR aging-alert settings has no endpoint (see NEEDS BACKEND). |

## `crm` — 1 (resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/crm/customers/portal` | empty-onclick | Feature-toggle checkbox made `readOnly`; dead "Configure" button removed; portal-user delete now hits `crmService` (was local-state only). |

## `installation` — 1 (resolved ✅)

| Route | Original issues | Resolution |
|---|---|---|
| `/installation/tool-prep` | empty-onclick | Fabricated sample tools removed → real `projectManagementService.getDeployedTools`; row checkbox made `readOnly` (row `onClick` already toggles). |

---

## Original triage vs. outcome

**🔴 HIGH — create/submit flow (10): all resolved.** In every case the modal was already firing an `onSubmit`/`onSave` callback and the **parent page** made the real service call — the `// TODO: API call…` sitting above the callback was stale. The one true break was `BOMCoreModals` (and a few export modals) `console.log`-ing instead of calling the callback; those now fire it. `credit-management` `console.log('Submitting credit review')` → real `FinanceService.updateCreditLimit`.

**🟡 MEDIUM — export / bulk (6): all resolved.** CSV bulk-upload → real parser; "fetch issue data" → real `getStockEntries`; save-as-draft → real `createStockEntry`; the "export API endpoint" TODOs → client-side `exportToCsv` (no server-side export endpoint exists — this is the honest equivalent).

**🟢 LOW — polish / types (2): all resolved.** Transfer step validation implemented; BOM-version type-placeholder comment removed (the local view-model interface is legitimate; the version service is untyped `any`).

---

## ⚠️ Genuinely missing backend (surfaced, not faked)

These handlers were wired honestly (manual entry / disabled / "not available" notice) instead of fabricating success, because no endpoint exists:

| Area | Gap |
|---|---|
| Downtime export modals | Scheduled/recurring exports & save-export-configuration — no endpoint; primary export works client-side via `exportToCsv`. |
| Finance credit management | AR aging-alert settings persistence — no `POST /finance/settings`-style endpoint. |
| Inventory batch-issue | Work-order → BOM item lookup — no BOM/work-order read on `InventoryService`; rows are entered manually. |
| Downtime analysis / others | Real charts need a charting library (Chart.js/Recharts); current areas are visual placeholders. |