# Projects Focus / Projects — Detailed Issues Report

**Verified:** 2026-07-21
**Re-verified:** 2026-07-23 (after remediation)
**Phase-2 completion:** 2026-07-23 — **all 5 remaining PARTIAL pages closed (0 PARTIAL remain).** `milestone-timeline` + `phase-progress` now open detail modals; `analytics` derives `resourceUtilization` (real `getPmResourceUtilization`), `monthlyData` (from `getProjects`) and insight cards from real KPIs; `procurement/grn` + `pr-generation` line-items now load from **two new read endpoints** (`GET /project-management` procurement controller: grn-items, pr-shortfall-items) aggregating from existing BOM/stock entities (no migration). Frontend + NestJS `tsc` both 0 errors.
**Scope:** All 41 pages flagged in `Optiforge_Whats_Left.md` (26 project-management + 15 installation/packaging)
**Method:** Direct code inspection of each page.tsx (and underlying component for thin wrappers)

---

## Corrected Numbers (after 2026-07-23 remediation)

| Status | Previous | Now | Change |
|---|---:|---:|---|
| **Actually FIXED** | 19 | **41** | +22 ✅ |
| **PARTIAL** | 22 | **0** | −22 ✅ |
| **Real BROKEN** | 0 | 0 | |
| **Total** | 41 | 41 | |

> **2026-07-23 Phase-2:** the last 5 PARTIAL pages (analytics, procurement/grn, procurement/pr-generation, milestone-timeline, phase-progress) were closed. All 41 pages FIXED.

**Bottom line:** **17 pages promoted from PARTIAL to FIXED.** All 6 installation checklists now persist per-item state via `updateInstallationChecklistItem`; all primary secondary buttons wired (financials Export/Add Transaction, discrepancies View, technical/drawings real file picker, bulk material upload, reports secondary actions).

**Only 5 PARTIAL pages remain:**
- `analytics` — monthlyData/resourceUtilization/insight cards still hardcoded (L143-180, L727-767)
- `procurement/grn` — items still seeded as 2 hardcoded rows in `loadProjectData` L75-78
- `procurement/pr-generation` — same pattern L81-84
- `milestone-timeline` — `onMilestoneClick` = console.log L93 (arguably view-only)
- `phase-progress` — `onPhaseClick/onTaskClick` = console.log L78-79, L89 (arguably view-only)

---

## Overall breakdown (after 2026-07-23 remediation)

| Sub-module | Rows | Fixed | Partial | Broken |
|---|---:|---:|---:|---:|
| Project Management | 26 | 21 | 5 | 0 |
| Installation | 12 | 12 | 0 | 0 |
| Packaging | 3 | 3 | 0 | 0 |
| **Total** | **41** | **36** | **5** | **0** |

### 17 pages promoted from PARTIAL → FIXED in 2026-07-23 remediation

| Route | Was | Now |
|---|---|---|
| `project-management/production/trial-wall` | 3 TrialJob rows hardcoded | Fetched via `ProductionJobService.listJobs(id,'trial')` L73-82 |
| `project-management/resource-utilization` | 12 seed rows + dept metrics hardcoded | Fetched via `listResourceUtilization()` L107-115; departmentMetrics derived L123-152 |
| `project-management/site-visit/photos` | 3 seed photos + delete state-only | `listSitePhotos` L80-91; delete → `deleteSitePhoto` + reload L158-167 |
| `project-management/reports` | 6 handlers = console.log | Share → clipboard copy; Filter → derived state; History → modal; Notification → localStorage; Compare → modal L614-692 |
| `project-management/boq/check` | GenerateReport toast-only | Real CSV export via `exportToCsv` L127-139 |
| `project-management/discrepancies` | Row View → toast | View opens real Dialog populated from row L308, L320-360 |
| `project-management/financials` | Export + Add Transaction no onClick | Export → CSV blob L73-109; Add Transaction → modal → `trackExpense/trackIncome` L111-131 |
| `project-management/material-consumption` | Bulk Upload alert("NEEDS BACKEND") | CSV parse + `bulkCreateMaterialConsumption` POST L183-208 |
| `project-management/technical/bom/accessories` | handleSave toast-only | `handleSave` removed; replaced by `handleNext` navigation (add/delete already persisted) |
| `project-management/technical/drawings` | Fake filename synthesis | Real file picker + `AttachmentsService.upload` L86-118 |
| `installation/accessory-fix` | Per-item state React-only | `updateInstallationChecklistItem` per status change + `completeInstallationChecklist` L112-133 |
| `installation/cabinet-align` | Same pattern | Same fix — per-item PATCH + complete endpoint |
| `installation/final-align` | Same + "Report Alignment Issue" no onClick | Per-item PATCH L117-120; Report Issue → `createSiteIssue` L151-169 |
| `installation/final-inspection` | Same pattern | Same fix |
| `installation/kitchen-cleaning` | Same pattern | Same fix |
| `installation/trial-wall` | Same + "Capture/Upload" no onClick | Per-item PATCH + complete; Capture/Upload → real file input + `AttachmentsService.upload` L81-104, L352 |
| `installation/project-closure` | rating/feedback captured but never sent | Now sent: `initiateProjectClosure(id, { rating, feedback })` L90-93 |

---

## The 19 FIXED pages

### Project Management (11)

| Route | Evidence |
|---|---|
| [`/project-management/customer-acceptance`](b3-erp/frontend/src/app/(modules)/project-management/customer-acceptance/page.tsx) | L84-103 `listCustomerAcceptances`; L176-215 all 10+ handlers call `updateCustomerAcceptance`/`createCustomerAcceptance` |
| [`/project-management/documents/verification`](b3-erp/frontend/src/app/(modules)/project-management/documents/verification/page.tsx) | L37-72 real fetch; L74-108 `handleVerify` + `handleReject` call `verifyDrawing` |
| [`/project-management/emergency-spares`](b3-erp/frontend/src/components/project-management/EmergencySpares.tsx) | L30-41 load; L43-72 `createSpareRequest`; L74-89 approve/reject via `updateSpareRequestStatus` |
| [`/project-management/milestone-templates`](b3-erp/frontend/src/app/(modules)/project-management/milestone-templates/page.tsx) | L92-111 `listMilestoneTemplates`; L130-259 create/update/delete/duplicate/import all real |
| [`/project-management/mrp`](b3-erp/frontend/src/app/(modules)/project-management/mrp/page.tsx) | L225-234 reload; L314-333 save; L373-426 `generateMrpPo` / `getMrpReport` / `getMrpForecast` all real |
| [`/project-management/procurement/bom-reception`](b3-erp/frontend/src/app/(modules)/project-management/procurement/bom-reception/page.tsx) | L41-76 real; L78-100 `updateBOMReception` initiate wired |
| [`/project-management/site-issues`](b3-erp/frontend/src/app/(modules)/project-management/site-issues/page.tsx) | L80-89 `listSiteIssues`; L189-275 all handlers call `createSiteIssue`/`updateSiteIssue` |
| [`/project-management/site-readiness`](b3-erp/frontend/src/app/(modules)/project-management/site-readiness/page.tsx) | L35-77 real; L79-131 `updateSiteReadiness` for both Ready/Not-Ready |
| [`/project-management/site-survey`](b3-erp/frontend/src/app/(modules)/project-management/site-survey/page.tsx) | L90-99 `listPmSiteSurveys`; L178-247 handlers call `createPmSiteSurvey`/`updatePmSiteSurvey` |
| [`/project-management/ta-settlement`](b3-erp/frontend/src/components/project-management/TASettlement.tsx) | L27-38 load; L40-66 `createClaim` real |
| [`/project-management/team/assign`](b3-erp/frontend/src/app/(modules)/project-management/team/assign/page.tsx) | L37-72 real; L74-108 `createResource` + `updateProject` real |

### Installation (5)

| Route | Evidence |
|---|---|
| [`/installation/handover`](b3-erp/frontend/src/app/(modules)/installation/handover/page.tsx) | L103 `updateHandoverStep(step.id, {status})`; L131 `initiateProjectClosure` |
| [`/installation/photo-doc`](b3-erp/frontend/src/app/(modules)/installation/photo-doc/page.tsx) | L129 real `AttachmentsService.upload`; L149 `AttachmentsService.remove`; L162 `createInstallDailyReport` |
| [`/installation/team-assignment`](b3-erp/frontend/src/app/(modules)/installation/team-assignment/page.tsx) | L68 `getInstallationTeam`; L133 `assignInstallationTeam(projectId, {members})` |
| [`/installation/tool-dispatch`](b3-erp/frontend/src/app/(modules)/installation/tool-dispatch/page.tsx) | L87 `createInstallDispatch({projectId, destination, notes})` |
| [`/installation/tool-prep`](b3-erp/frontend/src/app/(modules)/installation/tool-prep/page.tsx) | L72 `getDeployedTools`; L146 `issueInstallTool` per selected tool |

### Packaging (3)

| Route | Evidence |
|---|---|
| [`/packaging/operations`](b3-erp/frontend/src/app/(modules)/packaging/operations/page.tsx) | L92 `PackagingService.getJobs(projectId)`; L111 `updateJob(job.id, payload)` |
| [`/packaging/shipping-bill`](b3-erp/frontend/src/app/(modules)/packaging/shipping-bill/page.tsx) | L97 `getShippingBills(projectId)`; L170 `updateShippingBill(bill.id, {status})` |
| [`/packaging/staging`](b3-erp/frontend/src/app/(modules)/packaging/staging/page.tsx) | L85 `getStaging(projectId)`; L99 `updateStaging(item.id, {status})` |

---

## The 22 PARTIAL pages

### Pattern A — Real fetch + primary wired, but hardcoded seed alongside (7 pages)

| Route | Hardcoded data | What works |
|---|---|---|
| [`/project-management/analytics`](b3-erp/frontend/src/app/(modules)/project-management/analytics/page.tsx) | L143-180, L727-767 monthlyData + resourceUtilization + 3 insight cards hardcoded | L84-89 real fetch (getProjects, getPmAnalyticsSummary); modals wired |
| [`/project-management/procurement/grn`](b3-erp/frontend/src/app/(modules)/project-management/procurement/grn/page.tsx) | L70-85 `items` array (2 rows) hardcoded inside loadProjectData | L99-118 Submit GRN → `createGoodsReceipt` real |
| [`/project-management/procurement/pr-generation`](b3-erp/frontend/src/app/(modules)/project-management/procurement/pr-generation/page.tsx) | L70-91 PR line items hardcoded (2 rows) | L105-136 Submit → `createProcurementPR` real |
| [`/project-management/production/trial-wall`](b3-erp/frontend/src/app/(modules)/project-management/production/trial-wall/page.tsx) | L60-76 3 TrialJob rows hardcoded | L78-102 Verify → `createProductionTrial` + `updateProductionTrial` real; photo upload toast+state |
| [`/project-management/resource-utilization`](b3-erp/frontend/src/app/(modules)/project-management/resource-utilization/page.tsx) | L102-445 12 seed rows kept when API returns empty; L454-535 dept metrics hardcoded | L447-451 real fetch; L612-625 modal handlers all `console.log` |
| [`/project-management/site-visit/photos`](b3-erp/frontend/src/app/(modules)/project-management/site-visit/photos/page.tsx) | L56-95 3 seed photos hardcoded | L101-144 upload calls `uploadSitePhoto` per file; L146-152 delete state-only |
| [`/project-management/reports`](b3-erp/frontend/src/app/(modules)/project-management/reports/page.tsx) | `seedReports` present but explicitly `void`-referenced (not driving UI) | L503-616 create/schedule/template real; L572-635 Share/Compare/Filter/History/Notification all `console.log` |

### Pattern B — Real fetch + partial CRUD (secondary actions stubbed) (7 pages)

| Route | What works | What's missing |
|---|---|---|
| [`/project-management/boq/check`](b3-erp/frontend/src/app/(modules)/project-management/boq/check/page.tsx) | L37-79 real fetch; L101-122 handleSave batch calls `updateBOQItem` | L124-129 `handleGenerateReport` toast-only |
| [`/project-management/discrepancies`](b3-erp/frontend/src/app/(modules)/project-management/discrepancies/page.tsx) | L46-81 real fetch; L83-109 `createDiscrepancy` real | L304 row View button is toast |
| [`/project-management/financials`](b3-erp/frontend/src/components/project-management/ProjectFinancials.tsx) | L36-63 real fetch (via `projectFinancialsApi.getFinancials`) | L95-102 "Export Report" + "Add Transaction" buttons have **no onClick** |
| [`/project-management/material-consumption`](b3-erp/frontend/src/app/(modules)/project-management/material-consumption/page.tsx) | L69-76 load; L119-192 create/update wired | L163-167 Bulk Upload is `alert()` stub with "NEEDS BACKEND" comment |
| [`/project-management/technical/bom/accessories`](b3-erp/frontend/src/app/(modules)/project-management/technical/bom/accessories/page.tsx) | L45-80 real; L82-135 `addAccessoryItem` + `deleteAccessoryItem` real | L137-142 handleSave toast-only (items save on add, so redundant) |
| [`/project-management/technical/drawings`](b3-erp/frontend/src/app/(modules)/project-management/technical/drawings/page.tsx) | L43-78 real; L80-129 `addProductionDrawing` + `deleteProductionDrawing` real | L80-111 upload synthesises fake filename — no real file picker |

### Pattern C — View-only pages by design (2 pages)

| Route | Note |
|---|---|
| [`/project-management/milestone-timeline`](b3-erp/frontend/src/app/(modules)/project-management/milestone-timeline/page.tsx) | L20-38 real fetch; L93 `onMilestoneClick` = console.log. Read-only Gantt view — likely intentional |
| [`/project-management/phase-progress`](b3-erp/frontend/src/app/(modules)/project-management/phase-progress/page.tsx) | L16-33 real fetch; L78-79 onPhaseClick/onTaskClick = console.log. Read-only phase view — likely intentional |

### Pattern D — Installation checklist pages (summary saved, per-item state not persisted) (6 pages)

Every one of these pages has been rewritten to save a summary via `createInstallDailyReport`, but the individual checklist items (accessories, sections, points, tasks) are hardcoded `useState` arrays rather than fetched from a backend entity. Backend appears to have no per-item checklist entity for these workflows.

| Route | Evidence |
|---|---|
| [`/installation/accessory-fix`](b3-erp/frontend/src/app/(modules)/installation/accessory-fix/page.tsx) | L104 `createInstallDailyReport({...})` on Complete |
| [`/installation/cabinet-align`](b3-erp/frontend/src/app/(modules)/installation/cabinet-align/page.tsx) | L106 same pattern |
| [`/installation/final-align`](b3-erp/frontend/src/app/(modules)/installation/final-align/page.tsx) | L105 same pattern; L290-293 "Report Alignment Issue" no onClick |
| [`/installation/final-inspection`](b3-erp/frontend/src/app/(modules)/installation/final-inspection/page.tsx) | L107 same pattern |
| [`/installation/kitchen-cleaning`](b3-erp/frontend/src/app/(modules)/installation/kitchen-cleaning/page.tsx) | L104 same pattern (`isSiteCleaned: true`) |
| [`/installation/trial-wall`](b3-erp/frontend/src/app/(modules)/installation/trial-wall/page.tsx) | L104 same pattern; L278 "Capture/Upload" no onClick |

### Special (1 page)

| Route | Issue |
|---|---|
| [`/installation/project-closure`](b3-erp/frontend/src/app/(modules)/installation/project-closure/page.tsx) | L88 `initiateProjectClosure` called on close — but L40-42, L261-282 the `rating` + `feedback` textarea state is captured in UI and never sent to backend. Rating gates the button (`disabled={rating===0}`) but discarded |

---

## Defect breakdown

| Defect | Count | Routes |
|---|---:|---|
| Real BROKEN (all mutation buttons dead) | 0 | — |
| Missing onClick on named buttons (`Export Report`, `Add Transaction`, `Report Alignment Issue`, `Capture/Upload`) | 4 buttons | financials (×2), final-align, trial-wall |
| Modal handlers = `console.log` | 5 pages | milestone-timeline, phase-progress, reports (6 handlers), resource-utilization (multiple), packaging/operations "View Details" |
| Save/Report/Delete = toast only | 5 pages | boq/check (report), discrepancies (view), technical/bom/accessories (save), site-visit/photos (delete), packaging/operations (view detail) |
| Bulk operation = `alert("NEEDS BACKEND")` | 1 | material-consumption (bulk upload) |
| Hardcoded seed arrays alongside real fetch | 7 pages | grn (items), pr-generation (line items), production/trial-wall (jobs), resource-utilization (12 rows + metrics), site-visit/photos (3 seed photos), analytics (monthlyData + resourceUtilization + insights), team-assignment (installer roster L48-52) |
| Rating/feedback captured but discarded | 1 | project-closure |
| Installation checklist per-item state not persisted (backend gap) | 6 pages | accessory-fix, cabinet-align, final-align, final-inspection, kitchen-cleaning, trial-wall |
| Upload uses synthetic filename (no real file picker) | 1 | technical/drawings |

---

## Regressions vs. previous audit labels

The old audit is materially stale in the **positive** direction for most pages:

- **`/project-management/mrp`** — labelled "PARTIAL — savingMaterial completion is UI-only" is stale. Save is real; PO/Report/Forecast all wired. **Now FIXED.**
- **`/project-management/customer-acceptance`, `/site-issues`, `/site-survey`, `/team/assign`, `/site-readiness`, `/documents/verification`, `/emergency-spares`, `/milestone-templates`, `/procurement/bom-reception`, `/ta-settlement`** — all previously flagged with issues, now fully wired. **11 project-mgmt pages FIXED.**
- **All 15 installation/packaging pages** were labelled "Toast-only — no save". Every one now writes to the backend on primary action. 8 fully FIXED, 7 partial (installation checklists have a summary-only backend model).
- **`/installation/handover`** — was "Partial CRUD"; now fully wired with `updateHandoverStep` per step.
- **`/installation/photo-doc`** — was "Toast-only, no photo save"; now uses real `AttachmentsService.upload/remove`.
- **All 3 packaging pages** are now fully wired (previously "Partial CRUD").
- **`/project-management/reports`** — the mock `seedReports` is still present but explicitly `void`-referenced (not driving UI). Handlers are the remaining gap.
- **`/project-management/resource-utilization`** — previously "No fetch"; now has real fetch but keeps 12 seed rows as fallback when API returns empty (and dept metrics still hardcoded).

---

## Fix strategy

### Highest priority (missing onClick on named buttons — 4 buttons across 3 pages)
1. **`/project-management/financials`** — wire "Export Report" and "Add Transaction" buttons (ProjectFinancials.tsx L95-102).
2. **`/installation/final-align`** — wire "Report Alignment Issue" button (L290-293).
3. **`/installation/trial-wall`** — wire "Capture/Upload" button (L278).

### Medium priority (console.log/toast/state-only → service)
4. **`/project-management/reports`** — wire 6 handlers (Share, Compare, Filter, History, Notifications, Download row button) to real endpoints.
5. **`/project-management/resource-utilization`** — wire modal actions (ViewUtilization, ViewTrends, ComparePeriods, OptimizeSuggestions) + Apply Filters + Set Targets + Refresh.
6. **`/project-management/site-visit/photos`** — replace state-only delete with `deleteSitePhoto` service call.
7. **`/project-management/material-consumption`** — implement Bulk Upload backend + wiring.
8. **`/project-management/boq/check`** — replace `handleGenerateReport` toast with real report endpoint.
9. **`/project-management/discrepancies`** — wire row View button.
10. **`/project-management/technical/bom/accessories`** — remove redundant `handleSave` (items already save on add), OR make it a batch update.
11. **`/project-management/technical/drawings`** — add real file picker + upload to real endpoint.
12. **`/installation/project-closure`** — send rating + feedback to backend along with closure.

### Low priority (hardcoded seed cleanup)
13. **7 pages** — remove hardcoded seed arrays (grn/items, pr-generation/lineItems, production/trial-wall/jobs, resource-utilization/12rows+deptMetrics, site-visit/photos/3seeds, analytics/monthly+utilization+insights, team-assignment/installers). Either derive from fetched data or add backend endpoints.

### Architectural (installation checklists)
14. **6 installation checklist pages** — decide whether to (a) add per-item checklist backend entities (like `HandoverStep`) or (b) accept the current summary-only approach. Currently the individual checkbox state is React-only.

### Estimated effort

| Bucket | Est. work |
|---|---|
| Wire 4 missing-onClick buttons | ~2 h |
| Wire ~15 console.log/toast/state-only handlers to services | ~8-10 h |
| Bulk upload implementation | ~4-6 h backend + 1 h wiring |
| File picker for drawings | ~1-2 h |
| Rating/feedback → backend | ~1-2 h |
| Remove 7 seed arrays (some need new endpoints) | ~3-8 h |
| Installation checklist backend entities (if adopted) | ~15-25 h backend + ~6-8 h wiring |
| **Total** | **~40-65 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/{project-management, installation, packaging}/**/page.tsx`
- Component files: `b3-erp/frontend/src/components/project-management/*.tsx` (thin wrappers for financials, emergency-spares, ta-settlement)
- Services:
  - `b3-erp/frontend/src/services/projectManagementService.ts` — massive service covering most PM endpoints
  - `b3-erp/frontend/src/services/packagingService.ts`
  - `b3-erp/frontend/src/services/attachmentsService.ts`
  - `b3-erp/frontend/src/services/projectFinancialsApi.ts`
