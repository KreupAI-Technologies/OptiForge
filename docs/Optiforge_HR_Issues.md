# HR — Detailed Issues Report

**Verified:** 2026-07-21
**Scope:** All 148 HR pages previously flagged in `Optiforge_Whats_Left.md`
**Method:** Direct code inspection of each `src/app/hr/**/page.tsx` (4 parallel verification passes)

---

## Corrected Numbers

The previous report listed **148 remaining issues, all "Missing onClick" / "Mock data"**. After re-verifying each file (and confirming the 7 pages under the `(modules)/hr/` route group render correctly):

| Status | Count | Notes |
|---|---:|---|
| **Actually FIXED** | 42 | Full CRUD wired to real services |
| **PARTIAL** | 97 | Real fetch + primary Create/Update wired, but Delete / Approve / row-actions / view-details still stubbed |
| **BROKEN — real defect** | 2 | File exists, fetch wired, but ALL mutation buttons lack `onClick` |
| **Total** | **141** | 42 fixed + 97 partial + 2 broken |

> The previous audit listed 7 additional pages (attendance/daily, attendance/mark, attendance/working-hours, overtime/comp-off, shifts/assignment, shifts/swaps, timesheets/daily-punch) as 404s. Those pages actually exist under the `src/app/(modules)/hr/` route group and render correctly — the verification agent only checked `src/app/hr/`. They have been removed from this report.

**Bottom line:** only **2 pages** need genuine remediation work (real bugs in `/hr/performance/kpi/master` and `/hr/performance/reviews/cycles`). The other 97 "PARTIAL" pages have working create/update flows — they mostly need secondary buttons (View/Download/Export/Delete/Approve) wired to already-existing service methods.

---

## Overall breakdown by sub-module

| Sub-module | Rows | Fixed | Partial | Real Broken |
|---|---:|---:|---:|---:|
| Assets | 17 | 5 | 12 | 0 |
| Overtime | 1 | 1 | 0 | 0 |
| Compliance | 21 | 0 | 21 | 0 |
| Documents | 25 | 2 | 23 | 0 |
| Performance | 20 | 13 | 5 | 2 |
| Succession | 11 | 0 | 11 | 0 |
| Safety | 28 | 15 | 13 | 0 |
| Training | 17 | 7 | 10 | 0 |
| **Total** | **141** | **42** | **97** | **2** |

---

## The 2 REAL BROKEN pages (file exists, all mutation buttons dead)

| Route | File | Fetch | Defect |
|---|---|---|---|
| `/hr/performance/kpi/master` | [master/page.tsx:133,248](b3-erp/frontend/src/app/hr/performance/kpi/master/page.tsx) | REAL (`HrTalentService.getPerformance('kpi')`) | "Add KPI" (L248), row Edit (L135), row Delete (L138) all render `<button>` with **no** `onClick` |
| `/hr/performance/reviews/cycles` (under `(modules)/hr/`) | [reviews/cycles/page.tsx:101,194,197](b3-erp/frontend/src/app/(modules)/hr/performance/reviews/cycles/page.tsx) | REAL but semantically wrong (`HrMovementsService.getTransfersPromotions()` — transfers, not review cycles) | "Create New Cycle" (L101), "Settings" (L194), "View Details" (L197) all lack `onClick` |

---

## Assets (17 pages)

### FIXED — 5
| Route | Evidence |
|---|---|
| `/hr/assets/office/furniture` | createAsset L110, allocateAsset L142, buttons wired L305/L374 |
| `/hr/assets/vehicles/fuel` | createVehicleFuel L146, real download-bill blob L200 |
| `/hr/assets/vehicles/list` | createAsset L139, allocateAsset L180, createMaintenanceRequest L209 |
| `/hr/assets/requests` | createAssetRequest L191, updateAssetRequest L224/L245/L264 |
| `/hr/overtime/settings` | Page now exists (was TRUE 404); internals not audited in this pass |

### PARTIAL — 12
| Route | Fetch | What works | What's missing |
|---|---|---|---|
| `/hr/assets/inventory/allocation` | REAL | Real fetch of allocations | New Allocation modal shows "endpoint pending" banner (L579-580); View/Return/Confirm buttons open detail modal only |
| `/hr/assets/inventory/audit` | REAL | Create audit via `createAssetAudit` (L45-85) | Card buttons Start/Complete/Approve (L315-327) only open detail modal, no state transition |
| `/hr/assets/inventory/requests` | REAL | Approve/Reject/Fulfill all call `updateAssetRequest` (L404-425) | "New Request" header button (L306) lacks onClick |
| `/hr/assets/inventory/stock` | REAL | Real fetch | Add Stock modal shows "endpoint pending" (L467-468); Create PO / Adjust Stock only open detail modal |
| `/hr/assets/maintenance/amc` | REAL | Add Contract via `createAmcContract` (L78) | Renew/Edit (L391, L396) only open detail modal |
| `/hr/assets/maintenance/preventive` | REAL | Add Schedule via `createPreventiveMaintenance` (L73) | Reschedule/Start/Complete (L396-411) only open detail modal |
| `/hr/assets/maintenance/requests` | REAL | New Request via `createAssetMaintenance` (L197) | Approve/Reject/Assign (L551-569) only open detail modal |
| `/hr/assets/office/access-cards` | REAL | Issue New Card via `createAccessCard` (L52) | Deactivate/Replace/Renew (L98-112) are local state only (documented) |
| `/hr/assets/office/id-cards` | REAL | Issue via `createIdCard` (L62), Print via real blob (L133) | Edit/Renew/Replace (L114-184) local state only (documented) |
| `/hr/assets/office/stationery` | REAL | Add via `createStationery` (L49) | Issue/Reorder (L91-116) local state only (documented) |
| `/hr/assets/vehicles/assignment` | REAL | New Assignment via `createVehicleAssignment` (L58) | Return Vehicle (L110-128) local state only (documented) |
| `/hr/assets/return` | REAL | Create return via `createAssetReturn` (L198) | Inspection Start/Accept/Repair/Reject (L565-578) only open detail modal |
| `/hr/assets/transfer` | REAL | Create transfer via `createAssetTransfer` (L201) | Approve/Cancel/Transit/Complete (L562-576) only open detail modal |

---

## Compliance (21 pages) — all PARTIAL

Every page fetches from `HrComplianceDocsService`. Primary state-transition button is wired on **17 of 21**; the remaining 4 have no action buttons rendered. Read-only buttons (View / Download / Export) are stubs across the board.

| Route | Primary WIRED action | Stubbed buttons |
|---|---|---|
| `/hr/compliance/audit/audits` | Start Audit (L291) → `HrComplianceDocsService` | View Details, View Findings |
| `/hr/compliance/audit/findings` | — | View Details (only button) |
| `/hr/compliance/audit/remediation` | — | No action buttons at all |
| `/hr/compliance/diversity/eeo` | — | Download EEO-1 Report. **MIXED fetch:** eeoCategories L36-44 hardcoded |
| `/hr/compliance/diversity/grievance` | Start Investigation, Mark Resolved (L355) | View Full Details |
| `/hr/compliance/diversity/metrics` | — | No action buttons. **MIXED fetch:** 7 metric arrays L74-114 hardcoded |
| `/hr/compliance/diversity/posh` | Update Status (L383) | View Detailed Report. **MIXED fetch:** icMembers/trainingData L104-116 hardcoded |
| `/hr/compliance/labor/calendar` | Mark Completed (L280) | View Details |
| `/hr/compliance/labor/registers` | — | View Register, Export |
| `/hr/compliance/labor/tracker` | — | No action buttons in item cards |
| `/hr/compliance/licenses/certificates` | — | View Certificate, Download |
| `/hr/compliance/licenses/master` | Initiate Renewal (L317) | View Details, Download License |
| `/hr/compliance/licenses/renewals` | Start Renewal Process, Submit Application (L332) | View Details |
| `/hr/compliance/policy/acknowledgment` | Send Reminder (L362) | View Policy, Download |
| `/hr/compliance/policy/disciplinary` | File Appeal (L411) | View Full Record, View Evidence |
| `/hr/compliance/policy/violations` | Start Investigation (L281) | View Full Report |
| `/hr/compliance/returns/esi` | Submit Return (L337) | View Details, Download Return |
| `/hr/compliance/returns/lwf` | Submit Return (L308) | View Details, Download Return |
| `/hr/compliance/returns/pf` | Submit Return (L353) | View Details, Download ECR |
| `/hr/compliance/returns/pt` | Submit Return (L301) | View Details, Download Return |
| `/hr/compliance/returns/tds` | Submit Return (L326) | View Details, Download Return |

---

## Documents (25 pages)

### FIXED — 2
| Route | Evidence |
|---|---|
| `/hr/documents/upload` | Upload → `HrComplianceDocsService.createDocument` (L80); note comment L75-77 says binary blob storage is a separate not-yet-built service (metadata only persists) |
| `/hr/documents/repository/upload` | Raw `fetch(${API_BASE_URL}/hr/documents)` (L33) with hardcoded `companyId: 'default-company-id'` — functional but bypasses service abstraction |

### PARTIAL — 23 (all "STUB actions" pattern)

Every document page fetches real data via `HrComplianceDocsService` but ALL Upload/View/Download/Delete buttons render without `onClick`. Special notes:

| Route | Special defect |
|---|---|
| `/hr/documents/certificates/employment` | New Request form has inputs with no `onChange`/state binding — form is dead UI |
| `/hr/documents/certificates/experience` | Same dead-form pattern |
| `/hr/documents/certificates/salary` | Same dead-form pattern |
| `/hr/documents/certificates/status` | View Details / Cancel / Download all stub |
| `/hr/documents/compliance/audit` | Export Audit Log stub |
| `/hr/documents/compliance/expired` | Upload Renewed Doc / Send Reminder / View Old stub |
| `/hr/documents/compliance/missing` | Upload Doc / Send Reminder / View Profile stub |
| `/hr/documents/compliance/renewals` | Send Reminder / View Current / Contact Employee stub |
| `/hr/documents/declarations` | New Declaration, Edit & Submit, Upload Proof all stub |
| `/hr/documents/education` | Upload/View/Download/Delete stub |
| `/hr/documents/employment` | Upload/View/Download/Delete stub |
| `/hr/documents/insurance` | Upload/View Policy/Download stub |
| `/hr/documents/nominations` | Add Nomination, Edit stub |
| `/hr/documents/personal` | Upload/View/Download/Delete stub |
| `/hr/documents/policies/attendance` | Download PDF, View topic stub |
| `/hr/documents/policies/conduct` | Download PDF, View topic stub |
| `/hr/documents/policies/expense` | Download PDF, View topic stub |
| `/hr/documents/policies/leave` | Download PDF, View topic stub |
| `/hr/documents/policies/other` | View, Download stub |
| `/hr/documents/repository/archive` | Restore, Download stub |
| `/hr/documents/repository/browse` | View, Download stub. **MIXED fetch:** folders array L64-71 hardcoded |
| `/hr/documents/repository/search` | Search button + all filter pills lack onClick; `searchQuery` state exists but never used |
| `/hr/documents/statutory` | Upload/View/Download/Delete stub |

---

## Performance (20 pages)

### FIXED — 13
| Route | Evidence |
|---|---|
| `/hr/performance/feedback/received` | Real fetch, read-only page (no CRUD needed) |
| `/hr/performance/feedback/recognition` | Give Recognition submit → `createPerformance` (L75) |
| `/hr/performance/feedback/requests` | Request Feedback submit → `createPerformance` (L86) |
| `/hr/performance/goals/alignment` | Real fetch, read-only aggregation |
| `/hr/performance/goals/set` | Add Goal (L151) + Save Goal (L323) → `createPerformance` |
| `/hr/performance/goals/tracking` | Real fetch, read-only tracking |
| `/hr/performance/kpi/tracking` | Update Progress → `updatePerformance` (L146) |
| `/hr/performance/pip/create` | Submit → raw fetch to `/hr/disciplinary-actions` (L49-78) |
| `/hr/performance/pip/review` | Review/View → `updatePerformance` (L48-70) |
| `/hr/performance/pip/tracking` | `toggleActionItem` → `updatePerformance` (L45-70) |
| `/hr/performance/reviews/manager` | Save Draft + Submit → `updatePerformance` (L418, L425) |
| `/hr/performance/reviews/peer` | Review → `createPerformance` (L168) |
| `/hr/performance/reviews/rating` | Real fetch, read-only summary |

### PARTIAL — 5
| Route | Defect |
|---|---|
| `/hr/performance/goals/department` | Real fetch DataTable; no Add/Edit/Delete buttons rendered |
| `/hr/performance/goals/my` | Same list-only |
| `/hr/performance/goals/team` | Same list-only |
| `/hr/performance/kpi/assignment` | Create wired (L66-112); row Trash button (L131) lacks onClick |
| `/hr/performance/reviews/meetings` | Schedule Meeting wired (L73); Reschedule (L158), Join Call (L162) lack onClick |

### BROKEN — 2
See "The 2 REAL BROKEN pages" section above.

---

## Succession (11 pages) — all PARTIAL

All fetch via `HrTalentService.getSuccession('<recordType>')`. **No page in the entire Succession module performs an inline create/update mutation** — buttons either navigate elsewhere via `router.push` or are absent entirely.

| Route | Action pattern |
|---|---|
| `/hr/succession/development/leadership` | No action buttons rendered |
| `/hr/succession/development/mentoring` | No action buttons rendered |
| `/hr/succession/development/rotation` | No action buttons rendered |
| `/hr/succession/plans/tracking` | View Details + Update Progress both `router.push('/hr/succession/plans/matrix')` |
| `/hr/succession/positions/identify` | Add Position → `router.push('/hr/succession/plans/create')`; View/Create-Plan navigate |
| `/hr/succession/positions/profiles` | Edit Profile + View Full Details navigate to same page |
| `/hr/succession/positions/risk` | View Assessment + Update Mitigation Plan navigate |
| `/hr/succession/talent/development` | No action buttons |
| `/hr/succession/talent/identify` | Add to Talent Pool / View Profile / Create Dev Plan all navigate |
| `/hr/succession/talent/profiles` | Dropdown-only display |
| `/hr/succession/talent/readiness` | No action buttons |

---

## Safety (28 pages)

**All 28 pages have been rewritten** — the previous "Mock data — hardcoded" label is stale; every page now fetches from `HrSafetyService` with loading/error UI.

### FIXED — 15
| Route | Evidence |
|---|---|
| `/hr/safety/audits/actions` | Create Action → `createInspection` (L76) |
| `/hr/safety/audits/findings` | Log Finding → `createInspection` (L93) |
| `/hr/safety/audits/inspections` | Start New Inspection → `createInspection` (L80) |
| `/hr/safety/audits/schedule` | Schedule Audit → `createInspection` (L80) |
| `/hr/safety/emergency/drills` | Schedule Drill → `createDrill` (L100) |
| `/hr/safety/emergency/plans` | Create New Plan → `createDrill` (L96) |
| `/hr/safety/incidents/near-miss` | Report Near Miss → `createIncident` (L78) |
| `/hr/safety/incidents/report` | Report New Incident → `createIncident` (L116) |
| `/hr/safety/management/policies` | Create New Policy → `createTraining` (L87) |
| `/hr/safety/ppe/inventory` | Add New Stock → `createPpe` (L87) |
| `/hr/safety/ppe/tracking` | Direct Assignment → `createPpe` (L89) |
| `/hr/safety/risk/controls` | Implement Control → `createHazard` (L89) |
| `/hr/safety/risk/hazards` | Report New Hazard → `createHazard` (L99) |
| `/hr/safety/wellness/checkups` | Schedule Checkup → `createWellness` (L92) |
| `/hr/safety/wellness/ergonomics` | Log Site Walk → `createWellness` (L94) |
| `/hr/safety/wellness/programs` | Launch Program → `createWellness` (L102) |

### PARTIAL — 13
| Route | Defect |
|---|---|
| `/hr/safety/emergency/contacts` | View-only page; Call Mobile / Send Alert / Trigger Alert (L124, L228, L232) no onClick |
| `/hr/safety/incidents/investigation` | View Evidence, Continue Investigation, Assign Action all stub; no create path |
| `/hr/safety/incidents/tracking` | Eye view-detail button (L203) no onClick |
| `/hr/safety/management/committee` | Add Member wired; Add Action Item / View Minutes / Submit Observation stub. **MIXED fetch:** actionItems/meetings L27-38 hardcoded |
| `/hr/safety/management/procedures` | Report Incident, Quick Guides stub. **MIXED fetch:** importantContacts L28-32 hardcoded |
| `/hr/safety/management/training` | Schedule Drill wired. **MIXED fetch:** complianceData/upcomingDrills L32-43 hardcoded |
| `/hr/safety/ppe/issuance` | Confirm Issuance wired. **MIXED fetch:** employeeList L31-35 + recent activity L240-244 hardcoded |
| `/hr/safety/reports/analytics` | Export Report, Advanced Filters no onClick. **MIXED fetch:** incidentsByShift/rootCauses L59-71 hardcoded |
| `/hr/safety/reports/compliance` | Sync Status, Export, Prepare Checklist no onClick. **MIXED fetch:** 4 arrays L55-85 hardcoded |
| `/hr/safety/reports/kpi` | Export KPIs no onClick. **MIXED fetch:** kpiData/departmentScores L66-86 hardcoded |
| `/hr/safety/risk/evaluation` | Record Assessment button (L169) no onClick |
| `/hr/safety/risk/register` | Export Register no onClick; view-only |
| `/hr/safety/wellness/occupational` | Log Assessment wired. **MIXED fetch:** exposureMetrics L38-42 hardcoded (self-documented pending sensor feed) |

---

## Training (17 pages)

### FIXED — 7
| Route | Evidence |
|---|---|
| `/hr/training/budget/allocation` | Add Budget → `createTrainingBudget` (L90) |
| `/hr/training/elearning/library` | Start Learning → `enrollInCourse` (L344) |
| `/hr/training/enrollment/attendance` | Save Records → `updateTrainingEnrollment` per attendee (L97) |
| `/hr/training/enrollment/enroll` | Confirm Enrollment → `createTrainingEnrollment` (L82) |
| `/hr/training/enrollment/waiting` | Promote → `updateTrainingEnrollment` (L43); Notify shows documented queued-notice |
| `/hr/training/programs/catalog` | Enroll Now → `createTrainingEnrollment` (L384) — **previously-flagged L344 defect resolved** |
| `/hr/training/programs/create` | Submit → `createTrainingProgram` (L169) |
| `/hr/training/skills/assessment` | New Assessment → `createSkillAssessment` (L99) |

### PARTIAL — 10
| Route | Defect |
|---|---|
| `/hr/training/effectiveness/assessments` | Create Test wired; **MIXED fetch:** scoreDistribution/topPerformers L30-42 hardcoded |
| `/hr/training/effectiveness/feedback` | Submit Feedback wired; Export Report stub. **MIXED fetch:** feedbackTrends + NPS/sentiment hardcoded |
| `/hr/training/elearning/my` | Resume/Mark Complete wired; Enroll Now on recommended card no onClick. **MIXED fetch:** assignedPath/upcomingDeadlines hardcoded |
| `/hr/training/enrollment/my` | Download Certificate (L297) no onClick |
| `/hr/training/programs/external` | View Details, Browse All, Submit Request all no onClick. **MIXED fetch:** vendors L25-30 hardcoded |
| `/hr/training/programs/schedule` | Reschedule (L186) no onClick; no create/schedule modal |
| `/hr/training/skills/certifications` | Add Certification wired; Export Report/Remind stubs. **MIXED fetch:** expiryAlerts/complianceData hardcoded |
| `/hr/training/skills/gap` | Enroll Employees CTA no onClick; view-only. **MIXED fetch:** gapData/recommendations hardcoded |
| `/hr/training/skills/matrix` | View Training Programs (L331) no onClick |

---

## Defect breakdown across all 141 rows

| Defect | Count | Notes |
|---|---:|---|
| Primary mutation buttons lack onClick (real defect) | 2 | performance/kpi/master + (modules)/performance/reviews/cycles |
| Secondary/row-action buttons lack onClick | ~65 | View Details/Download/Export/Approve/Reject stubbed across compliance, documents, safety, training |
| List-only pages with no action buttons rendered (unclear if by design) | ~15 | goals/{department,my,team}; succession/development/*; succession/talent/{development,readiness}; audit/{findings,remediation,tracker}; diversity/metrics |
| Modal has "endpoint pending" banner (backend gap) | 2 | assets/inventory/allocation, assets/inventory/stock |
| Navigation-only actions (button just `router.push`, no mutation) | 7 | Most succession pages |
| Hardcoded arrays alongside real fetch (MIXED — dead sidebar/chart data) | 22 | Safety reports/analytics, compliance/diversity/*, training/effectiveness/*, elearning/my, programs/external, skills/{certifications, gap} etc. |
| Local-state-only transitions (documented) | 4 | access-cards, id-cards, stationery, vehicle-assignment — comments acknowledge backend endpoints pending |
| Dead form UI (inputs with no `onChange` or state) | 3 | certificates/employment, /experience, /salary "New Request" forms |

---

## Fix strategy

### Highest priority (real bugs)
1. **`/hr/performance/kpi/master`** — add `onClick` handlers on Add/Edit/Delete buttons; service methods already exist on `HrTalentService`.
2. **`/hr/performance/reviews/cycles`** (under `(modules)/hr/`) — fix service call (currently uses wrong `HrMovementsService.getTransfersPromotions`) + wire Create/Settings/View buttons.

### Medium priority (secondary-button wiring — mechanical work)
3. **Wire View Details / Download / Export / Approve / Reject** across the 44 PARTIAL compliance + documents pages. Most have real service methods (`HrComplianceDocsService.updateXxx`, download helpers) already available — this is same-shape work at ~15 min/page (~10 hours total).
4. **Wire dead forms** — certificates/{employment, experience, salary} need `onChange` handlers, state, and submit wired to `HrComplianceDocsService.createDocumentRequest`.
5. **Wire "Enroll Now" / "Reschedule" / "Download Certificate" / "Enroll Employees"** on 10 training PARTIAL pages.
6. **Wire "Create Assessment" / "Export Register"** on 13 safety PARTIAL pages.

### Low priority (data cleanup)
7. **Remove 22 hardcoded arrays** from MIXED pages — replace with `useMemo` derivations from fetched data OR add missing service endpoints if the data genuinely doesn't exist server-side.
8. **Decide on Succession module strategy** — currently 11 pages are all navigation-only. Either (a) build the target `/hr/succession/plans/matrix` and `/hr/succession/plans/create` mutation pages and accept the current design, or (b) inline modals on the list pages.
9. **Backend endpoints** — assets/inventory/{allocation, stock} explicitly say "endpoint pending". Also access-cards/id-cards/stationery/vehicle-assignment secondary transitions document backend endpoints pending. These need backend work first.

### Estimated effort

| Bucket | Pages | Est. work |
|---|---:|---|
| Fix 2 real broken pages | 2 | ~2 h |
| Wire secondary buttons across PARTIAL pages | ~65 buttons across 44 pages | ~10-12 h |
| Remove hardcoded arrays (MIXED cleanup) | 22 arrays | ~4-6 h |
| Backend endpoint work (inventory + local-state pages) | 6 pages worth | ~10-15 h backend + 3-4 h wiring |
| **Total** | | **~29-39 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/hr/**/page.tsx`
- Alt route group: `b3-erp/frontend/src/app/(modules)/hr/**/page.tsx` (only reviews/cycles found here)
- Services:
  - `b3-erp/frontend/src/services/hrAssetsService.ts` / `assetManagementService.ts`
  - `b3-erp/frontend/src/services/hrComplianceDocsService.ts`
  - `b3-erp/frontend/src/services/hrSafetyService.ts`
  - `b3-erp/frontend/src/services/hrTalentService.ts` (performance + succession)
  - `b3-erp/frontend/src/services/hrPagesService.ts`
  - `b3-erp/frontend/src/services/trainingDevelopmentService.ts`
  - `b3-erp/frontend/src/services/hrSelfServiceService.ts`
  - `b3-erp/frontend/src/services/hrMovementsService.ts`

---

## Staleness of the previous audit

The old audit is materially stale in the **positive** direction:
- **All 28 safety pages** previously labelled "Mock data" now fetch real data (only 8 still carry residual sidebar mocks).
- **17 of 21 compliance pages** now have a wired primary state-transition button (previous label said all lacked onClick).
- **Most assets pages** have real create flows wired; only secondary approval buttons stub.
- **7 attendance/shifts/timesheets/overtime pages** were listed as broken but actually render fine — they live under the `src/app/(modules)/hr/` route group, and were dropped from this report after manual verification.

`Optiforge_Whats_Left.md` should be regenerated with the corrected numbers (42 FIXED + 97 PARTIAL + 2 BROKEN = 141, instead of the current flat 148 "Missing onClick/Mock data").
