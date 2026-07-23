# Estimation — Detailed Issues Report

**Verified:** 2026-07-21
**Re-verified:** 2026-07-23 (after remediation) — ✅ **All 4 PARTIAL pages now FIXED**
**Phase-2 confirm:** 2026-07-23 — code re-inspected: **0 PARTIAL remain.** The "What's missing" notes in the sections below are stale. `categoryMarkups` (pricing/markup) and `categoryMetrics` (analytics/performance) are `useMemo`-derived from fetched data; `workflow/rejected` Filter+Export and `workflow/converted` Filter all have working onClick. Frontend `tsc --noEmit` = 0 errors.
**Scope:** All 24 Estimation pages from the original audit (broader than the 4 in `Optiforge_Whats_Left.md`, since prior modules had many stale "fixed" labels)
**Method:** Direct code inspection of each `src/app/(modules)/estimation/**/page.tsx`

---

## Corrected Numbers (after 2026-07-23 remediation)

| Status | Previous | Now | Change |
|---|---:|---:|---|
| **Actually FIXED** | 20 | **24** | +4 ✅ |
| **PARTIAL** | 4 | **0** | −4 |
| **Real BROKEN** | 0 | 0 | |
| **Total** | 24 | 24 | |

**Bottom line:** ✅ **Estimation module is 100% FIXED — zero remaining issues.** All 4 previously-partial pages resolved:
- `pricing/markup` — `categoryMarkups` now derived via `useMemo` from `markupRules` (grouped by category with avg/min/max/count) L162-187
- `workflow/rejected` — Filter toggles panel, Export runs `exportToCsv` L178-195
- `workflow/converted` — Filter toggles panel, Export wired L171-188
- `analytics/performance` — `categoryMetrics` now mapped from `apiCategories` state populated via `loadPerformance()` L55, L70, L107-113

---

## The 4 PARTIAL pages

| Route | What works | What's missing |
|---|---|---|
| [`/estimation/pricing/markup`](b3-erp/frontend/src/app/(modules)/estimation/pricing/markup/page.tsx) | Full CRUD: L64 fetch (`findAllMarkupRules`), L427/L441 inline Edit/Save/Delete call `updateMarkupRule` / `deleteMarkupRule`; Calculator/Filter/Export all wired | L162-170 `categoryMarkups` array (kitchen categories with example numbers) still hardcoded — renders in "Category Markup Guidelines" section |
| [`/estimation/workflow/rejected`](b3-erp/frontend/src/app/(modules)/estimation/workflow/rejected/page.tsx) | L59 fetch (`getEstimates status=Rejected`); row-level View/Comments/Revise wired — Revise calls `createVersion()` | L159 header Filter button has no onClick; L163 header Export button has no onClick |
| [`/estimation/workflow/converted`](b3-erp/frontend/src/app/(modules)/estimation/workflow/converted/page.tsx) | L59 fetch (`findAll status=Converted to Order`); row-level Export/View/Open/ExportPDF all wired via `downloadExport` | L156 header Filter button has no onClick (Export IS wired) |
| [`/estimation/analytics/performance`](b3-erp/frontend/src/app/(modules)/estimation/analytics/performance/page.tsx) | L59 fetch (`getAllEstimatorsPerformance`); Filter/DateRange/Export all wired | L97 `categoryMetrics` hardcoded to empty array — renders empty-state (endpoint has no category breakdown yet) |

---

## The 20 FIXED pages

### BOQ (2)
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/boq/templates`](b3-erp/frontend/src/app/(modules)/estimation/boq/templates/page.tsx) | `estimationTemplateService` (L92) | Create/View/Edit/Use/Export/Delete all onClick; Delete → `deleteBoqTemplate` (L313-341) |
| [`/estimation/boq/analysis`](b3-erp/frontend/src/app/(modules)/estimation/boq/analysis/page.tsx) | `estimationBOQService.findAll` (L54) | Read-only analytics — no CRUD expected. Previous "Missing onClick" label was misapplied |

### Costing (4) — all read-only cost analysis views
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/costing/materials`](b3-erp/frontend/src/app/(modules)/estimation/costing/materials/page.tsx) | `estimationMaterialCostService.getRates` (L63) | Update/Filter/Export wired (L208-222) |
| [`/estimation/costing/labor`](b3-erp/frontend/src/app/(modules)/estimation/costing/labor/page.tsx) | `estimationLaborCostService.getRates` (L64) | Filter/Export wired (L227-234) |
| [`/estimation/costing/overhead`](b3-erp/frontend/src/app/(modules)/estimation/costing/overhead/page.tsx) | `estimationOverheadCostService.getCosts` (L62) | Filter/Export wired (L212-219) |
| [`/estimation/costing/breakdown`](b3-erp/frontend/src/app/(modules)/estimation/costing/breakdown/page.tsx) | `estimationCostEstimateLiveService.getEstimates` (L66) | Filter/Export/row-select wired (L190-431) |

### Pricing (2)
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/pricing/margins`](b3-erp/frontend/src/app/(modules)/estimation/pricing/margins/page.tsx) | `estimationMarkupSettingLiveService.getSettings` (L64) | Filter=reload / Export wired |
| [`/estimation/pricing/competitive`](b3-erp/frontend/src/app/(modules)/estimation/pricing/competitive/page.tsx) | `estimationPricingLiveService.getPricing` (L70) | Filter=reload / Export wired |

### Workflow (2)
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/workflow/drafts`](b3-erp/frontend/src/app/(modules)/estimation/workflow/drafts/page.tsx) | `costEstimateService.findAll status=Draft` (L68) | New/Edit/Copy/Delete (real service)/Send all onClick (L101-311) |
| [`/estimation/workflow/pending`](b3-erp/frontend/src/app/(modules)/estimation/workflow/pending/page.tsx) | `costEstimateService.findAll status=Pending Approval` (L84) | Export/View/Comments/Approve (service)/Reject (service) all wired (L307-334) |

### Resource Rates (4) — all full CRUD
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/rates/materials`](b3-erp/frontend/src/app/(modules)/estimation/rates/materials/page.tsx) | `estimationResourceRateService.findAllResourceRates(rateType=Material)` (L59) | Add/Export/Edit/Save (`updateResourceRate`)/History all wired (L369-386) |
| [`/estimation/rates/labor`](b3-erp/frontend/src/app/(modules)/estimation/rates/labor/page.tsx) | Same service (`rateType=Labor`) (L70) | Full CRUD wired (L352-369) |
| [`/estimation/rates/equipment`](b3-erp/frontend/src/app/(modules)/estimation/rates/equipment/page.tsx) | `findAllEquipmentRates` (L54) | Full CRUD wired (L339-355) |
| [`/estimation/rates/subcontractors`](b3-erp/frontend/src/app/(modules)/estimation/rates/subcontractors/page.tsx) | `findAllSubcontractorRates` (L72) | Full CRUD wired (L370-387) |

### Analytics (2)
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/analytics/win-loss`](b3-erp/frontend/src/app/(modules)/estimation/analytics/win-loss/page.tsx) | `getWinLossAnalysis` (L57) | Filter=reload / DateRange=reload / Export wired |
| [`/estimation/analytics/accuracy`](b3-erp/frontend/src/app/(modules)/estimation/analytics/accuracy/page.tsx) | `getAccuracyAnalysis` (L37) | Filter/DateRange/Export wired |

### Settings (4)
| Route | Fetch | Actions |
|---|---|---|
| [`/estimation/settings/templates`](b3-erp/frontend/src/app/(modules)/estimation/settings/templates/page.tsx) | `estimationTemplateService.findAllTemplates` (L51) | Filter/Export/New/View/Edit/Copy/Delete (`deleteBoqTemplate`) all wired (L308-330) |
| [`/estimation/settings/markup`](b3-erp/frontend/src/app/(modules)/estimation/settings/markup/page.tsx) | `estimationMarkupSettingService.findAll` (L124) | Add=create / Save=update / Delete=delete all wired (L373-390) |
| [`/estimation/settings/workflow`](b3-erp/frontend/src/app/(modules)/estimation/settings/workflow/page.tsx) | `estimationWorkflowStageService.findAll` (L134) | Add Stage / Save / Delete all wired to service (L392-409) |
| [`/estimation/settings/categories`](b3-erp/frontend/src/app/(modules)/estimation/settings/categories/page.tsx) | `estimationCategoryService.getCategories` (L69) | New=create / Save=update / Delete=delete all wired (L436-459) |

---

## Defect breakdown

| Defect | Count | Routes |
|---|---:|---|
| Header Filter/Export button lacks onClick | 2 | workflow/rejected (Filter + Export), workflow/converted (Filter only) |
| Hardcoded sidebar section alongside real fetch | 2 | pricing/markup (`categoryMarkups` guidelines section), analytics/performance (`categoryMetrics` empty-state) |
| Missing onClick on primary buttons | 0 | **All stale** |
| Toast-only handlers | 0 | **All stale** |
| No fetch / mock only | 0 | **All stale** |

---

## Regressions vs. previous audit labels

The old audit is materially stale for **all 24 pages** — the entire Estimation module has been rewritten to real services:

- **All 4 "Toast-only" rates pages** (rates/materials, rates/labor, rates/equipment, rates/subcontractors) now have full CRUD via `estimationResourceRateService` — Add/Save/Edit/Delete all call real methods.
- **All 3 "Missing onClick" analytics pages** (win-loss, accuracy, performance) fetch real data via `estimationAnalyticsService` with Filter/DateRange/Export wired.
- **All 4 "Missing onClick" settings pages** (templates, markup, workflow, categories) have full CRUD wired.
- **All 4 "Missing onClick" cost pages** (materials, labor, overhead, breakdown) fetch real data with Filter/Export wired.
- **All 3 pricing pages** now use dedicated services with real fetch.
- **`workflow/drafts`** upgraded from "Partial CRUD" to full CRUD (Delete + Send + all row actions wired).
- **`workflow/pending`** upgraded from "Missing onClick" to real Approve/Reject via service methods.
- **`workflow/rejected`** upgraded from "Toast-only" — row actions all wired, only header Filter/Export missing.
- **`workflow/converted`** upgraded from "Missing onClick" — row Export/PDF wired, only header Filter missing.
- **`boq/analysis`** is a legitimate read-only analytics view — the previous "Missing onClick" label was misapplied.
- **`boq/templates`** upgraded from "Missing onClick" to full CRUD.

---

## Notable observations

- **Consistent service naming** — every page uses a dedicated `estimation*Service` (unlike Procurement which had inconsistent naming). Services observed: `estimationTemplateService`, `estimationBOQService`, `estimationMaterialCostService`, `estimationLaborCostService`, `estimationOverheadCostService`, `estimationCostEstimateLiveService`, `estimationMarkupSettingLiveService`, `estimationPricingService`, `estimationPricingLiveService`, `estimationResourceRateService`, `estimationAnalyticsService`, `estimationMarkupSettingService`, `estimationWorkflowStageService`, `estimationCategoryService`, `costEstimateService`.
- **`COMPANY_ID = ''` empty string** — several rates/settings pages pass an empty company id. Backend may 400 at runtime; wiring is complete but this could fail in prod. Worth checking as a follow-up.
- **Cosmetic search inputs** — pending/converted/rejected/rates pages have search inputs with no `value`/`onChange` binding; primary CRUD works, this is just dead UI. Not counted as defects since scope was primary action wiring.

---

## Fix strategy

### Highest priority
1. **`workflow/rejected`** — wire header Filter (L159) and Export (L163) onClick handlers (Filter → toggle filter modal; Export → CSV of filtered rows).
2. **`workflow/converted`** — wire header Filter (L156) onClick.

### Medium priority
3. **`pricing/markup`** — remove or endpoint-back `categoryMarkups` hardcoded array (L162-170). Either derive from fetched markup rules by category or add a new endpoint for category guidelines.
4. **`analytics/performance`** — either add a backend endpoint for category performance breakdown or remove the empty-state section entirely.

### Low priority
5. **`COMPANY_ID = ''` cleanup** — inject real company ID from auth context on rates/materials, rates/labor, rates/equipment pages. Verify these don't 400 in production.
6. **Cosmetic search inputs** — wire `value`/`onChange` on pending, converted, rejected, rates/* search boxes.

### Estimated effort

| Bucket | Est. work |
|---|---|
| Wire 3 header buttons | ~1 h |
| Remove/backend hardcoded arrays | ~1-2 h (or ~4-6 h if new endpoints needed) |
| COMPANY_ID injection | ~1 h |
| Cosmetic search wiring | ~1-2 h |
| **Total** | **~4-11 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/estimation/**/page.tsx`
- Services: `b3-erp/frontend/src/services/estimation*.ts` (14 dedicated services)
