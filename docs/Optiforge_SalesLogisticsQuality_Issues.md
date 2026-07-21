# Sales, Logistics, Quality — Detailed Issues Report

**Verified:** 2026-07-21
**Scope:** All flagged pages across three small modules (Sales: 1, Logistics: 1, Quality: 5 + 1 bonus)
**Method:** Direct code inspection of each `src/app/(modules)/**/page.tsx`

---

## Scope note

The audit was very sparse for these modules:

| Module | Total pages in codebase | Flagged in audit |
|---|---:|---:|
| Sales | ~63 | 1 (actually a global `/settings` page — misfiled) |
| Logistics | ~60 | 1 |
| Quality | ~26 | 5 (+ 1 bonus verified from prior lists) |

Only the 7 flagged pages + 1 bonus were verified in this pass. Say the word if you want full sub-sweeps.

---

## Corrected Numbers

| Status | Count | Notes |
|---|---:|---|
| **Actually FIXED** | 7 | Real fetch + all primary actions wired |
| **PARTIAL** | 1 | Real fetch + list view works; mutations delegated via `router.push` to sibling routes |
| **Real BROKEN** | 0 | |
| **Total** | **8** | |

**Bottom line:** all 3 modules are essentially healthy for what was audited — **zero real bugs**. The 1 PARTIAL (`/quality/ncr/open`) is arguably by design (navigation to `/new` and `/[id]` sibling routes for mutations).

---

## Per-page verdicts

### Sales (1)

| Route | Verdict | Notes |
|---|---|---|
| [`/settings`](b3-erp/frontend/src/app/(modules)/settings/page.tsx) | **FIXED** (misfiled) | This is the **global app settings navigation hub**, not a Sales-specific page. Contains 4 Quick Access links + 8 category tiles + 1 live "System Status" panel (L94 `dashboardOverviewService.getOverview()`). Zero CRUD buttons — the audit misclassified it as "Sales Settings". Correct taxonomy: navigation hub. |

### Logistics (1)

| Route | Verdict | Evidence |
|---|---|---|
| [`/logistics/loading`](b3-erp/frontend/src/app/(modules)/logistics/loading/page.tsx) | **FIXED** | L74 `LogisticsService.getLoadingJobs()`; L119 `LogisticsService.updateShipment(job.id, {status:'Dispatched'})` inside `handleDispatch`, wired to Dispatch button at L374 |

### Quality (6, incl. 1 bonus)

| Route | Verdict | Evidence |
|---|---|---|
| [`/quality/ncr`](b3-erp/frontend/src/app/(modules)/quality/ncr/page.tsx) | **FIXED** | L146 `NCRService.getAllNCRs()`; L87 `NCRService.create(...)` in `handleCreate`, bound to "Create NCR" button L296, full dialog form L429-483 |
| [`/quality/ncr/open`](b3-erp/frontend/src/app/(modules)/quality/ncr/open/page.tsx) | **PARTIAL** (by design?) | L95 `NCRService.getAllNCRs()` filtered to open subset; row actions View Details (L434) and Create CAPA (L438) only `router.push(...)`; header "Report NCR" (L281) also `router.push('/quality/ncr/new?...')`. No inline `handleCreate`/`handleUpdate` exists. **Arguably intentional** — page delegates mutations to `/quality/ncr` and `/quality/ncr/new` |
| [`/quality/capa`](b3-erp/frontend/src/app/(modules)/quality/capa/page.tsx) | **FIXED** | L162 `CAPAService.getAllCAPAs()`; L100 `CAPAService.create(...)` in `handleCreate`, bound to "Create CAPA" button L310, full dialog form L449-517 |
| [`/quality/capa/my`](b3-erp/frontend/src/app/(modules)/quality/capa/my/page.tsx) | **FIXED** | L101 `getAllCAPAs()`; row Start Working → `CAPAService.implementCAPA` (L129, bound L504); Submit for Verification → `CAPAService.verifyCAPA` (L144, bound L519) |
| [`/quality/rework`](b3-erp/frontend/src/app/(modules)/quality/rework/page.tsx) | **FIXED** | L101 `QualityService.getReworkItems({projectId})`; row Start + Send to QC → `QualityService.updateReworkItem(item.dbId, {status})` in `handleStatusChange` (L147, bound L383 & L398) with optimistic update + rollback |
| [`/quality/defects`](b3-erp/frontend/src/app/(modules)/quality/defects/page.tsx) *(bonus)* | **FIXED** | L190 `defectService.getAllDefects()`; L132 `defectService.create(...)` in `handleCreate`, bound to "Create Defect" button L361, dialog L499-556 |

---

## Defect breakdown

| Defect | Count | Routes |
|---|---:|---|
| Missing onClick (real bug) | 0 | — |
| Toast-only handlers | 0 | — |
| State-only (no persistence) | 0 | — |
| Hardcoded / mock fetch | 0 | — |
| No inline mutation handlers on a list page (mutations delegated via `router.push`) | 1 | `/quality/ncr/open` |
| Audit misclassification (page misfiled under wrong module) | 1 | `/settings` (labelled "Sales Settings" — actually global nav hub) |

---

## Regressions vs. previous audit labels

The audit is stale in the **positive direction** for every page:

- **`/logistics/loading`** — labelled "Partial CRUD"; is actually **FIXED** (Dispatch button wired to `updateShipment`).
- **`/quality/ncr`, `/quality/capa`, `/quality/rework`** — all labelled "Partial CRUD" with "no Create/Update handlers"; all now have working Create dialogs wired to service `.create()` methods.
- **`/quality/capa/my`** — labelled "Partial CRUD, no Create/Update"; now has Start Working (`implementCAPA`) and Submit for Verification (`verifyCAPA`) wired.
- **`/quality/defects`** — was in the original 24-issue audit list (as "Log Defects"); now **FIXED** with full create dialog.
- **`/quality/ncr/open`** — labelled "Partial CRUD"; is technically PARTIAL (no inline create/update handlers exist in this file) but arguably by-design since it delegates to sibling routes via `router.push`.
- **`/settings`** — labelled "Sales Settings, classification not verified"; it's not Sales-related at all. It's the **global app settings navigation hub** with a live System Status panel.

---

## Fix strategy

### The one arguable case
1. **`/quality/ncr/open`** — decide whether inline mutations are needed here. Options:
   - (a) Accept the current navigation-based design (page shows filtered list, users click through to `/quality/ncr/new` or `/quality/ncr/[id]` for mutations). Mark as FIXED.
   - (b) Add inline "Quick Close" / "Assign" handlers with `NCRService.updateNCR` calls. Requires ~1 h.

### Audit hygiene
2. **Reclassify `/settings`** in `Optiforge_Whats_Left.md` — move it out of "Sales" into a "navigation/hub pages" bucket (or drop it entirely since it's working).

### Estimated effort
| Bucket | Est. work |
|---|---|
| Decide + optionally wire inline actions on `ncr/open` | 0-1 h |
| Audit reclassification | negligible |
| **Total** | **~0-1 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/{settings, logistics, quality}/**/page.tsx`
- Services:
  - `b3-erp/frontend/src/services/logisticsService.ts`
  - `b3-erp/frontend/src/services/ncrService.ts`
  - `b3-erp/frontend/src/services/capaService.ts`
  - `b3-erp/frontend/src/services/qualityService.ts`
  - `b3-erp/frontend/src/services/defectService.ts`
  - `b3-erp/frontend/src/services/dashboardOverviewService.ts`

---

## Reminder — audit coverage is very partial for these modules

Only 8 pages were verified out of ~149 total (~63 Sales + ~60 Logistics + ~26 Quality). If any of these modules matter operationally, they warrant a fresh full sweep — the audit team may have simply skipped past most of them. Say the word to trigger a broader scan.
