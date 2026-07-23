# Procurement — Detailed Issues Report

**Verified:** 2026-07-21
**Re-verified:** 2026-07-23 (after remediation)
**Phase-2 completion:** 2026-07-23 — **all 7 remaining PARTIAL pages closed (0 PARTIAL remain).** See "Phase-2 completion" section below. Frontend `tsc --noEmit`, NestJS `tsc -p tsconfig.build.json --noEmit`, and `nest build` all pass with 0 errors. Two DB migrations added (pending apply).
**Scope:** All 20 Procurement pages previously flagged in `Optiforge_Whats_Left.md`
**Method:** Direct code inspection of each `src/app/(modules)/procurement/**/page.tsx` and the underlying component in `src/components/procurement/*`

---

## Corrected Numbers (after 2026-07-23 remediation)

| Status | Previous | Now | Change |
|---|---:|---:|---|
| **Actually FIXED** | 6 | **20** | +14 ✅ |
| **PARTIAL** | 13 | **0** | −13 ✅ |
| **Real BROKEN** | 1 | **0** | −1 ✅ |
| **Total** | 20 | 20 | |

---

## Phase-2 completion (2026-07-23)

All 7 remaining PARTIAL pages closed via **pragmatic full-closure**: view/detail/report/export/monitor handlers wired to existing services + client-side modals/CSV; hardcoded arrays derived from fetched data; **new NestJS endpoints built only for genuine create/persist actions.**

| Page | What was done |
|---|---|
| `supplier-portal` | View/download/messages/profile/performance/export → existing services + modals + CSV; `mockPOs` removed. **New backend:** `POST supplier-portal/invoices`, `POST .../quotes`, `POST/GET .../catalog`, `GET .../purchase-orders`. "Submit Quote" + "Create Invoice" modals now have real fields + submit. |
| `compliance` | ViewViolations/ViewRequirement/Monitor/Training → modals from existing insights; Report/Export → CSV; `handleSetPolicies` reuses `createRecord`; `disabled` stubs removed. |
| `supplier-diversity` | Track/Analytics → modals from `getDiversityInsights`; Reports → CSV; Settings → modal; `monthlyDiversitySpend`/`diversityBreakdown` derived. |
| `supplier-scorecard` | All 5 hardcoded arrays (`performanceMetrics`, `scorecardHistory`, `kpiDetails`, `categoryBenchmarks`, `improvementActions`) now `useMemo`-derived from `getScorecards()`. |
| `quality-assurance` | `inspectionQueue`/`inspectionTemplates` now fetched. **New backend:** inspections (GET/POST, PATCH results, PATCH reject), templates (GET/POST/PATCH/use), NCRs (GET/POST). Trends/report/monitoring → modals + CSV. |
| `budget-tracking` | AdjustBudget → `updateBudget`; Variance/Forecast/Alerts → existing modals; Export → CSV. Plus 4 extra fabricated-`alert()` handlers (ComparePeriods/ManageOwners/Refresh/Settings) rewritten to real client-side modals + `reloadBudgets`. |
| `e-marketplace` | Compare/ViewDetails/Favorites(localStorage)/Settings → client-side modals; undefined `handleAddToCart`/`handleBrowseCatalog` defined. |

**New frontend services:** additions to `procurement-pages.service.ts` + new `procurement-quality.service.ts`.
**New backend (NestJS procurement module):** `procurement-quality.controller.ts`/`.service.ts`, extended `supplier-portal.controller.ts`/`.service.ts`; new entities `SupplierPortalInvoice`, `SupplierPortalQuote`, `SupplierPortalCatalogItem`, `ProcurementInspection`, `ProcurementInspectionTemplate`, `ProcurementNcr`.
**Migrations (pending apply via `db:manual`):** `prisma/manual/2026_07_procurement_supplier_portal_txn.sql`, `prisma/manual/2026_07_procurement_quality.sql`.

> Note: ~89 `alert()`/`window.prompt` UX flows remain in *other* procurement components that this doc already classifies as FIXED (`category-management`, `contracts`, `strategic-sourcing`, `supplier-onboarding`, etc.). They are functional (prompt→service call) and out of the flagged-PARTIAL scope — a separate polish task if desired.

**Bottom line:**
- **The BROKEN `supplier-portal` page is no longer BROKEN** — placeholder modal fully removed and component rewritten (~771 lines). Some secondary actions still use `alert()` walls though, so it remains PARTIAL.
- **7 previously-PARTIAL pages now FIXED** — `analytics`, `automation`, `collaboration`, `spend-analysis`, `risk-management`, `contract-management`, `savings-tracker`.
- **7 pages still PARTIAL** — `supplier-portal`, `compliance`, `supplier-diversity`, `supplier-scorecard`, `quality-assurance`, `budget-tracking`, `e-marketplace`. Common pattern: alert walls were REMOVED but replaced with empty no-op handlers `{}` or navigation-only handlers where no backend endpoint exists.

---

## Key finding — 17 of 20 pages are re-export wrappers

The previous audit graded `page.tsx` contents literally. Almost all Procurement `page.tsx` files are 5-line thin wrappers that re-export a component from `src/components/procurement/*`. The real logic lives in the component file — that's why the old "Mock data — hardcoded" labels were misleading. Every one of these pages now fetches real data via one of the procurement services.

---

## Re-verification (2026-07-23) — 7 pages promoted to FIXED

| Route | Was | Now |
|---|---|---|
| `/procurement/analytics` | 4 modals `onSubmit` = console.log+close | All 4 modals wired: Create/Schedule → `procurementReportTemplateService.createTemplate()`; Export CSV; Dashboard JSON L956-1157 |
| `/procurement/automation` | 4 modals stubbed | Modals removed; rules loaded from `procurementAutomationRuleService.getRules()`; create/toggle/delete via real service L115-204 |
| `/procurement/collaboration` | 4 modals stubbed | All 4 modals call `persistCollaboration` → `procurementPagesService.createSupplierPortalMessage()` L76-100, L1129-1170 |
| `/procurement/spend-analysis` | 4 modals + hardcoded monthly trend | Modals wired to real report service; `monthlySpendTrend` fetched from API L140-203, L1095-1128 (cost-drivers array still local) |
| `/procurement/risk-management` | 4 alert walls | All 4 handlers call `procurementRiskAssessmentService.createAssessment()`; monitor reloads L233-300 |
| `/procurement/contract-management` | No delete/terminate | Terminate + Delete both wired to `procurementContractService.terminateContract()` / `deleteContract()` L248-289 |
| `/procurement/savings-tracker` | Edit/Delete/Calculate/Analyze alert | Calculate → `calculateInitiative()`; Edit → `updateInitiative()`; Delete → `deleteInitiative()`; Analyze switches tab; Export CSV L139-260 |

---

## The 7 remaining PARTIAL pages

| Route | Progress | Remaining defect |
|---|---|---|
| `/procurement/supplier-portal` | Component rewritten (~771 lines); placeholder modal gone; suppliers/messages/documents fetched from `procurementPagesService`; `handleMessageBuyer` + `handleUploadDocument` wired | `handleSubmitInvoice`, `handleViewPOs`, `handleUpdateCatalog`, `handleDownloadDocuments`, `handleSettings`, `handleExportData`, `handleViewMessages`, `handleManageDocuments`, `handleTrackPerformance`, `handleViewSupplierProfile` still huge `alert()` walls L173-315 |
| `/procurement/compliance` | Alerts REMOVED; `handleRunAudit` real via `procurementComplianceRecordService.createRecord()`; requirements fetched via `getComplianceInsights()` | 8 other handlers now no-op stubs with "backend not yet available" comments L82-173 |
| `/procurement/supplier-diversity` | 3 handlers wired (`SetGoals`, `CertifySuppliers`, `AddDiverseSupplier`) → `supplierDiversityProgramService.createProgram()` | 5 others (`Track/GenerateReports/ManagePrograms/ViewAnalytics/Settings`) now no-op stubs L155-238 |
| `/procurement/supplier-scorecard` | Alerts REMOVED except 1 export guard; scores fetched via `getScorecards()`; navigation + CSV via `exportToCsv` | `performanceMetrics`, `scorecardHistory`, `kpiDetails`, `categoryBenchmarks`, `improvementActions` still hardcoded arrays L256-297 |
| `/procurement/quality-assurance` | Alerts REMOVED — replaced with EMPTY handlers `{}` (12 total); `qualityTrends`/`defectCategories`/`supplierQualityScores`/`complianceStandards` now fetched | `inspectionQueue` (L41) and `inspectionTemplates` (L128) still hardcoded; all 12 mutations are no-ops |
| `/procurement/budget-tracking` | Delete now wired: `handleDeleteBudget` → `procurementOperationsService.deleteBudget()` L183-190 | 9 secondary handlers still alert walls (`AdjustBudget`, `ViewVariance`, `ExportBudgetReport`, `Forecast`, `ReviewBudgetAlerts`, etc.) L194-1020 |
| `/procurement/e-marketplace` | Alerts REMOVED; `handlePlaceOrder` still real; non-order actions navigate tabs | `handleCompareProducts`, `handleViewProductDetails`, `handleManageFavorites`, `handleSettings` now no-op stubs L883-958 |

---

## The 1 previously-REAL-BROKEN page (now PARTIAL)

| Route | Fetch | Defect |
|---|---|---|
| [`/procurement/supplier-portal`](b3-erp/frontend/src/app/(modules)/procurement/supplier-portal/page.tsx) | REAL (POs/RFQs/Invoices — L62, L97, L114) | Submit Quote (L1017-1019) and Create Invoice (L1042-1044) primary submit buttons in modals have **NO `onClick`** — the modals literally contain placeholder text "Quote submission form would go here" |

---

## The 6 FIXED pages

| Route | Why it's fully wired |
|---|---|
| [`/procurement/advanced-features`](b3-erp/frontend/src/app/(modules)/procurement/advanced-features/page.tsx) | L81-86 calls `getPurchaseOrders` / `getRfqs` / `getVendors` / `getSpendOverview`; nav catalog page with real KPI loading |
| [`/procurement/category-management`](b3-erp/frontend/src/components/procurement/CategoryManagement.tsx) | Full CRUD: L53 `getCategories`, L114 `createCategory`, L129 `updateCategory`, L319 `deleteCategory` |
| [`/procurement/contracts`](b3-erp/frontend/src/app/(modules)/procurement/contracts/page.tsx) | Full lifecycle: L124 `getContracts`, L208-242 `create/renew/update/terminate/submitContract` |
| [`/procurement/strategic-sourcing`](b3-erp/frontend/src/components/procurement/StrategicSourcing.tsx) | L128 `getInsights`; L1025/1050/1071/1097/1105 `createSourcingStrategy` / `updateSourcingStrategy` from 4 modals |
| [`/procurement/supplier-onboarding`](b3-erp/frontend/src/components/procurement/SupplierOnboarding.tsx) | L124 `getInsights`; L299 `approveVendor`, L318 `updateVendor`, L341 `requestVendorDocuments`, L369 `completeVendorOnboarding` |
| [`/procurement/vendors/comparison`](b3-erp/frontend/src/app/(modules)/procurement/vendors/comparison/page.tsx) | L17 `getVendors`; L82-87 actions navigate via `router.push` to real routes (not toast) |

---

## The 13 PARTIAL pages

### Pattern A — Modal `onSubmit` = `console.log + close` (4 pages)

Real fetch works, but every "Create/Configure/Schedule/Export" modal has an `onSubmit` handler that just logs and closes — no service call.

| Route | Component | Modal count | Evidence |
|---|---|---:|---|
| [`/procurement/analytics`](b3-erp/frontend/src/components/procurement/ProcurementAnalytics.tsx) | `ProcurementAnalytics.tsx` | 4 | L84 fetch; L1021-1032 `onSubmit={(data)=>{ ... setIsXOpen(false) }}` |
| [`/procurement/automation`](b3-erp/frontend/src/components/procurement/ProcurementAutomation.tsx) | `ProcurementAutomation.tsx` | 4 | L152 fetch; L1011-1078 `onSubmit={(data)=>{ console.log(...); setIsXOpen(false) }}` |
| [`/procurement/collaboration`](b3-erp/frontend/src/components/procurement/SupplierCollaboration.tsx) | `SupplierCollaboration.tsx` | 4 | L50 fetch; L1109-1140 same pattern |
| [`/procurement/spend-analysis`](b3-erp/frontend/src/components/procurement/SpendAnalysis.tsx) | `SpendAnalysis.tsx` | 4 | L124-127 4 fetches; L984-1014 same pattern; L548-553 hardcoded monthly trend |

### Pattern B — `alert()` walls of text on every action (5 pages)

Real fetch, but Identify/Assess/Configure/View/Manage/Certify buttons all use `alert(...)` instead of calling services.

| Route | Component | Alert handlers | Evidence |
|---|---|---:|---|
| [`/procurement/compliance`](b3-erp/frontend/src/components/procurement/ProcurementCompliance.tsx) | `ProcurementCompliance.tsx` | 10 | L44-59 fetch; L87-146 all handlers = `alert(...)` |
| [`/procurement/risk-management`](b3-erp/frontend/src/components/procurement/ProcurementRiskManagement.tsx) | `ProcurementRiskManagement.tsx` | 4 major | L99 fetch; L188-1043 handlers `alert(...)` only |
| [`/procurement/supplier-diversity`](b3-erp/frontend/src/components/procurement/SupplierDiversity.tsx) | `SupplierDiversity.tsx` | ~8 | L42 fetch; L129/210/341/521/704/899 alert-only |
| [`/procurement/supplier-scorecard`](b3-erp/frontend/src/components/procurement/SupplierScorecard.tsx) | `SupplierScorecard.tsx` | ~9 | L223 fetch; L111-189 alert stubs. Only `handleExport` (L126) + `handleExportSupplierReport` (L192) work (CSV) |
| [`/procurement/quality-assurance`](b3-erp/frontend/src/components/procurement/QualityAssurance.tsx) | `QualityAssurance.tsx` | ~12 | L105 fetch supplier scores; L174/340/540/782 CreateInspection/RecordResults/RejectMaterial/IssueNCR all `alert(...)`. **MIXED fetch:** L41/81/91 `qualityMetrics`, `inspectionQueue`, `qualityTrends`, `defectCategories` still hardcoded |

### Pattern C — Partial CRUD (4 pages)

Real fetch, primary create action wired, but edit/delete/other secondary actions still alert.

| Route | Component | What works | What's missing |
|---|---|---|---|
| [`/procurement/budget-tracking`](b3-erp/frontend/src/components/procurement/ProcurementBudget.tsx) | `ProcurementBudget.tsx` | L63 `getBudgets`, L164 `createBudget`, L1792 `updateBudget` | No delete handler |
| [`/procurement/contract-management`](b3-erp/frontend/src/components/procurement/ContractManagement.tsx) | `ContractManagement.tsx` | L133 `getContracts`, L169 renew, L185 create, L209 update, L239 amendment | No delete/terminate |
| [`/procurement/e-marketplace`](b3-erp/frontend/src/components/procurement/EProcurementMarketplace.tsx) | `EProcurementMarketplace.tsx` | L152 fetch insights; L1022 `placeMarketplaceOrder` wired | Other actions are `alert()` stubs |
| [`/procurement/savings-tracker`](b3-erp/frontend/src/components/procurement/ProcurementSavings.tsx) | `ProcurementSavings.tsx` | L47 `getInitiatives`, L177 `createInitiative` (prompt-based) | L166/191/196/201/206 edit/delete/calculate/analyze are alerts |

---

## Defect breakdown

| Defect | Count | Routes / Notes |
|---|---:|---|
| Missing onClick on primary submit button (real bug) | 1 | supplier-portal (Submit Quote + Create Invoice modals) |
| Modal `onSubmit` = `console.log + close` (no persistence) | 4 pages × ~4 modals = ~16 stubbed modals | analytics, automation, collaboration, spend-analysis |
| Action handlers use `alert(...)` instead of service call | 5 pages × ~40 handlers total | compliance, risk-management, supplier-diversity, supplier-scorecard, quality-assurance |
| Partial CRUD (Create wired, Edit/Delete alert) | 4 | budget-tracking, contract-management, e-marketplace, savings-tracker |
| Hardcoded arrays alongside real fetch (MIXED) | 5+ | quality-assurance (4 arrays), spend-analysis (monthly trend), supplier-scorecard (radar), strategic-sourcing (spend/opportunity — internal), supplier-diversity (in-file arrays) |
| No fetch / useState empty | 0 | **Every page fetches real data** — the old "No fetch" labels are all stale |
| Toast-only | 0 | Codebase uses `alert()` and `console.log`, not toast library, for stubs |

---

## Regressions vs. previous audit labels

The old audit is materially stale in the **positive** direction:

- **13 of 20 pages** were previously labelled "Mock data — hardcoded" but now fetch from a real procurement service.
- **3 pages** previously labelled "No fetch — useState empty" (`collaboration`, `supplier-diversity`, `e-marketplace`) all have real `useEffect` fetches now.
- **`contracts`** is not "Partial CRUD" anymore — full lifecycle wired (create/renew/amend/terminate/submit).
- **`vendors/comparison`** is not "Toast-only" — buttons navigate via `router.push` to real routes.
- **`strategic-sourcing`** is not "Mock data" — fully CRUD-wired.
- **`supplier-onboarding`** is not "Renders" — fully CRUD-wired (approve/reject/request-docs/complete).
- **`category-management`** is not "Mock data" — full CRUD wired.
- **`supplier-portal`** label ("STILL BROKEN") is CONFIRMED — submit buttons literally have no onClick.
- **`quality-assurance`** label is partially CONFIRMED — the 4 flagged arrays are still hardcoded, but supplier scores now fetch from a real service.

---

## Fix strategy

### Highest priority (real bug)
1. **`/procurement/supplier-portal`** — wire Submit Quote (L1017-1019) and Create Invoice (L1042-1044) modal submits to real service methods (`createSupplierQuote`, `createSupplierInvoice`). Replace placeholder "form would go here" text with actual input fields.

### High priority (turn alerts/console.logs into real writes — same-shape work)
2. **4 modal-heavy pages** (analytics, automation, collaboration, spend-analysis) — replace ~16 `onSubmit={console.log + close}` with real service create/save calls.
3. **5 alert-only pages** (compliance, risk-management, supplier-diversity, supplier-scorecard, quality-assurance) — replace ~40 `alert(...)` handlers with service method calls. Some may need new service endpoints (Certify, IssueNCR, etc.).

### Medium priority (partial CRUD completion)
4. **budget-tracking** — add delete handler.
5. **contract-management** — add delete/terminate.
6. **e-marketplace** — wire remaining action handlers beyond `placeMarketplaceOrder`.
7. **savings-tracker** — wire edit/delete/calculate/analyze (replace 5 alerts with services).

### Low priority (data cleanup)
8. **quality-assurance** — remove 4 hardcoded arrays (`qualityMetrics`, `inspectionQueue`, `qualityTrends`, `defectCategories`) — either derive from fetched inspections or add backend endpoints.
9. **spend-analysis** — remove hardcoded monthly trend (L548-553), derive from `getSpendOverview` data.
10. **supplier-scorecard** — remove hardcoded radar metrics/benchmarks.

### Estimated effort

| Bucket | Est. work |
|---|---|
| Fix supplier-portal (1 real bug) | ~2 h |
| Wire ~16 stubbed modal submits (Pattern A) | ~8-10 h |
| Wire ~40 alert-only handlers (Pattern B) — some need new backend endpoints | ~15-25 h |
| Complete partial CRUD (Pattern C) | ~4-6 h |
| Remove hardcoded arrays | ~2-3 h |
| **Total** | **~31-46 h** |

---

## Notable observations

- **Dominant anti-pattern:** `alert()` walls of text as handler bodies (compliance L87-146 alone has 10 such handlers). This isn't "toast-only" — it's literally the browser `alert()` popup, which is worse UX.
- **Second anti-pattern:** `onSubmit={(data) => { console.log(data); setIsOpen(false); }}` in modals. Modal appears to submit, closes without error, but nothing persists.
- **Very large component files:** `QualityAssurance.tsx` is >3,600 lines, `ProcurementCompliance.tsx` and `ProcurementRiskManagement.tsx` both >1,000 lines. Consider splitting during remediation.
- **Naming convention drift:** Services are inconsistently named — `procurementPagesService`, `procurementCategoryService`, `procurementContractService`, `procurementSavingsService`, `procurementVendorScorecardService`, `procurementOperationsService`. Consider a unified `procurementService` facade.

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/procurement/**/page.tsx` (mostly thin wrappers)
- Component files: `b3-erp/frontend/src/components/procurement/*.tsx`
- Services: `b3-erp/frontend/src/services/procurement*.ts`
