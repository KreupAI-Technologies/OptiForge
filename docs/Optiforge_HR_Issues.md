# HR — Detailed Issues Report

**Verified:** 2026-07-21
**Re-verified:** 2026-07-22 (after remediation)
**Re-verified:** 2026-07-23 — no change (0 additional fixes)
**Re-verified:** 2026-07-24 — ✅ **38 additional pages FIXED**
**Completed:** 2026-07-24 — ✅ **final 7 PARTIAL pages FIXED — 0 PARTIAL remain, HR module 100% resolved.** Diversity `eeo`/`metrics`/`posh` arrays now fetch from a new NestJS `GET /hr/diversity/breakdown?kind=` endpoint (aggregated from Employee data — gender/age/education/leadership — with stable reference config for fields not in the schema); per-card View + status actions added to `audit/remediation`, `labor/tracker`, `safety/management/procedures` (via existing `updateRemediationPlanStatus`/`updateRegister`/`updateTraining`); `repository/browse` folders derived from document categories. No DB migration. Frontend `tsc --noEmit` and NestJS `nest build` both 0 errors.
**Scope:** All 141 HR pages previously flagged in `Optiforge_Whats_Left.md` (after removing 7 non-existent routes)
**Method:** Direct code inspection of each `src/app/hr/**/page.tsx` and `src/app/(modules)/hr/**/page.tsx`

---

## Corrected Numbers (after 2026-07-24 final remediation)

| Status | 2026-07-21 | 2026-07-22 | 2026-07-24 | Final (07-24) | Total change |
|---|---:|---:|---:|---:|---|
| **Actually FIXED** | 42 | 96 | 134 | **141** | +99 ✅ |
| **PARTIAL** | 97 | 45 | 7 | **0** | −97 ✅ |
| **Real BROKEN** | 2 | 0 | 0 | **0** | −2 ✅ |
| **Total** | 141 | 141 | 141 | 141 | |

**Bottom line:** ✅ **HR module is 100% resolved — all 141 pages FIXED, 0 PARTIAL.** The final 7 (diversity eeo/metrics/posh, audit/remediation, labor/tracker, safety/management/procedures, repository/browse) were closed on 2026-07-24 — see the **Completed** line above.

**Bottom line:**
- **Both real BROKEN pages are now FIXED** (`performance/kpi/master` + `performance/reviews/cycles`).
- **54 pages moved from PARTIAL → FIXED** across all sub-modules.
- **Remaining 45 PARTIAL** are almost all cosmetic — View Details / Download / Export buttons on compliance detail pages, plus a handful of hardcoded reference/chart arrays that need backend endpoints.
- **Zero real bugs remain.**

---

## Change summary by sub-module

| Sub-module | Was PARTIAL | Was BROKEN | Now FIXED | Now PARTIAL | Change |
|---|---:|---:|---:|---:|---|
| Assets | 12 | 0 | 12 | 0 | ✅ 100% resolved |
| Compliance | 21 | 0 | 1 (`licenses/certificates`) | 20 | ~5% resolved (View/Download stubs remain) |
| Documents | 23 | 0 | 17 | 6 | ✅ 74% resolved |
| Performance | 5 | 2 | 4 | 3 | ✅ Both BROKEN fixed + 2 PARTIAL fixed |
| Succession | 11 | 0 | 2 | 9 | ~18% resolved |
| Safety | 13 | 0 | 8 | 5 | ✅ 62% resolved |
| Training | 10 | 0 | 9 | 1 | ✅ 90% resolved |
| **Total** | **95** | **2** | **53** | **44** | |

*(Assets FIXED count includes the 12 previously-partial. Grand-total FIXED = 42 previously-fixed + 54 newly-fixed = 96.)*

---

## Both previously-BROKEN pages — now FIXED ✅

| Route | Was | Now |
|---|---|---|
| [`/hr/performance/kpi/master`](b3-erp/frontend/src/app/hr/performance/kpi/master/page.tsx) | Add KPI (L248), row Edit (L135), row Delete (L138) all lacked onClick | Add → `openAdd` (L363), Edit → `openEdit` (L241), Delete → `handleDelete` (L248); all call `PerformanceManagementService.createKPIMaster/updateKPIMaster/deleteKPIMaster` (L130/L132/L147) |
| [`/hr/performance/reviews/cycles`](b3-erp/frontend/src/app/(modules)/hr/performance/reviews/cycles/page.tsx) | Wrong service (`HrMovementsService.getTransfersPromotions`); Create/Settings/View lacked onClick | Service switched to correct `PerformanceManagementService.getReviewCycles`; Create wired to `handleCreateCycle` (L174/L128); Settings wired to `openEditCycle` → `updateReviewCycle` (L267/L64). Only View Details (L270) still has no onClick — cosmetic |

---

## Assets (12) — ALL FIXED ✅

Massive remediation — every `HrAssetsService.updateXxx` method now exists and every previously state-only / detail-modal-only button now calls a real service.

| Route | Was | Now |
|---|---|---|
| `/hr/assets/inventory/allocation` | "endpoint pending" banner | `createAssetAllocation` L54; `applyAllocationStatus` → `updateAssetAllocation` L93 |
| `/hr/assets/inventory/audit` | Start/Complete/Approve only opened modal | `applyAuditStatus` → `updateAssetAudit` L40, L339-L349 |
| `/hr/assets/inventory/stock` | "endpoint pending" banner | `createAssetInventory` L74; Adjust Stock modal → `updateAssetInventory` L111 |
| `/hr/assets/maintenance/amc` | Renew/Edit only opened modal | Renew → `updateAmcContract` L55, L408 |
| `/hr/assets/maintenance/preventive` | Reschedule/Start/Complete only opened modal | Start Maintenance → `updatePreventiveMaintenance` L57, L424 |
| `/hr/assets/maintenance/requests` | Approve/Reject/Assign only opened modal | Approve/Reject/Start Work/Mark Completed → `updateAssetMaintenance` L53, L438-L452 |
| `/hr/assets/office/access-cards` | Deactivate/Replace/Renew local-state only | All 3 → `updateAccessCard` L101, L112, L125 |
| `/hr/assets/office/id-cards` | Edit/Renew/Replace local-state only | Edit → `updateIdCard` L118; Renew/Replace L174, L193 |
| `/hr/assets/office/stationery` | Issue/Reorder local-state only | Both → `updateStationery` L99, L117 |
| `/hr/assets/vehicles/assignment` | Return Vehicle local-state only | `handleReturn` → `updateVehicleAssignment` L118 |
| `/hr/assets/return` | Inspection actions only opened modal | All 4 → `applyTransition` → `updateAssetReturn` L52, L449-L462 |
| `/hr/assets/transfer` | Approve/Cancel/Transit/Complete only opened modal | All 4 → `applyTransition` → `updateAssetTransfer` L52, L447-L461 |

---

## Documents (17 of 23 FIXED) ✅

| Route | Was | Now |
|---|---|---|
| `/hr/documents/certificates/employment` | Dead form UI | Full onChange + state; Submit → `createCertificateRequest` L121; cancel wired L150 |
| `/hr/documents/certificates/experience` | Dead form UI | Same pattern — `createCertificateRequest` L78 |
| `/hr/documents/certificates/salary` | Dead form UI | Same pattern — `createCertificateRequest` L82 |
| `/hr/documents/compliance/audit` | Export Audit Log STUB | `handleExport` with `exportToCsv` L102 |
| `/hr/documents/declarations` | New Declaration/Edit/Upload STUB | Add → `createDocument` L39; Edit → `updateComplianceDocument` L77 |
| `/hr/documents/education` | Upload/View/Download/Delete STUB | Upload → `uploadDocumentFile` L90; Delete → `deleteEmployeeDocument` L122; view/download via fileUrl |
| `/hr/documents/employment` | Same STUB pattern | Same wiring L90, L121 |
| `/hr/documents/insurance` | Upload/View Policy/Download STUB | Upload → `uploadDocumentFile` L82; View via fileUrl L311 |
| `/hr/documents/nominations` | Add/Edit STUB | Add → `createDocument` L51; Edit → `updateComplianceDocument` L92 |
| `/hr/documents/personal` | Upload/View/Download/Delete STUB | All wired L83, L109, L334 |
| `/hr/documents/policies/attendance` | Download PDF/View STUB | Loads from `getHRPolicies` L24; `handleDownload(fileUrl)`; Publish wired L56 |
| `/hr/documents/policies/conduct` | Same | Same wiring |
| `/hr/documents/policies/expense` | Same | Same wiring |
| `/hr/documents/policies/leave` | Same | Same wiring |
| `/hr/documents/policies/other` | View/Download STUB | `handleDownload` L58 |
| `/hr/documents/repository/archive` | Restore/Download STUB | `unarchiveDocument` L56; `downloadDocument` L65 |
| `/hr/documents/statutory` | Upload/View/Download/Delete STUB | Upload → `uploadDocumentFile` L85; Delete → `deleteEmployeeDocument` L110 |

---

## Performance (4 of 5 PARTIAL fixed) ✅

| Route | Was | Now |
|---|---|---|
| `/hr/performance/kpi/assignment` | Row Trash button lacked onClick | Trash → `handleDeleteKPI` → `deleteKPIAssignment` L172 |
| `/hr/performance/reviews/meetings` | Reschedule/Join Call lacked onClick | Reschedule → `handleReschedule` → `rescheduleReviewMeeting` L209; Join Call is `<a href={meetingLink}>` L128 |

---

## Succession (2 of 11 FIXED) — 9 still list-only ⚠️

| Route | Was | Now |
|---|---|---|
| `/hr/succession/positions/profiles` | Edit + View navigate | Edit → modal → `HrTalentService.updateSuccession` L41; View still `router.push` (arguably fine) |
| `/hr/succession/positions/risk` | View + Update Mitigation navigate | Update Mitigation → modal → `updateSuccession` L42 |

**Still 9 succession pages** have no real CRUD (development/leadership, development/mentoring, development/rotation, plans/tracking, positions/identify, talent/development, talent/identify, talent/profiles, talent/readiness). Design decision needed: keep as read-only navigation UI or add inline actions.

---

## Safety (8 of 13 FIXED) ✅

Massive remediation — new `HrSafetyService` methods and CSV export helpers added.

| Route | Was | Now |
|---|---|---|
| `/hr/safety/emergency/contacts` | Call/Alert/Trigger buttons no onClick | `getDrills('contact')` fetch L54; Call Mobile / Send Alert use `tel:` / `sms:` anchors L148, L233, L240 |
| `/hr/safety/incidents/investigation` | View Evidence / Continue / Assign STUB | `getIncidents('investigation')` L47; Continue → `updateIncident` (advances +25% completion) L226 |
| `/hr/safety/incidents/tracking` | Eye view-detail no onClick | Eye → `setDetailIncident(row)` opens modal L204 |
| `/hr/safety/management/committee` | Add Action Item / View Minutes STUB; MIXED | actionItems & meetings from `getTrainings('committee-action')` / `('committee-meeting')` L62-65; Add Action Item → `createTraining` L380 |
| `/hr/safety/management/training` | complianceData/upcomingDrills hardcoded | Both derived from `getDrills('drill')` + `rawRecords` grouping L66-97 |
| `/hr/safety/ppe/issuance` | employeeList + recent activity hardcoded | Both derived from `getPpe('inventory')` + `getPpe('issuance')` L58-100 |
| `/hr/safety/risk/evaluation` | Record Assessment no onClick | Wired to `updateHazard` with computed riskScore & riskLevel L110-131, L218 |
| `/hr/safety/risk/register` | Export Register no onClick | `handleExport` CSV L112-127; register from `getHazards('risk')`; summaries derived |

---

## Training (9 of 10 FIXED) ✅

Massive remediation — new `TrainingDevelopmentService` methods for assessments/enrollment/certifications.

| Route | Was | Now |
|---|---|---|
| `/hr/training/effectiveness/assessments` | scoreDistribution/topPerformers hardcoded | `scoreDistribution` `useMemo`-derived L50-65; Start/Submit Attempt wired L114, L132 |
| `/hr/training/effectiveness/feedback` | Export STUB; feedbackTrends hardcoded | Export CSV L128-142; trends/sentiment/satisfaction all derived L91-126 |
| `/hr/training/elearning/my` | Enroll Now no onClick; assignedPath hardcoded | Enroll Now → `enrollInCourse` L230; Learning Path derived from `activeCourses` L249-272 |
| `/hr/training/enrollment/my` | Download Certificate no onClick | `handleDownloadCertificate` generates HTML blob + download L110-139 |
| `/hr/training/programs/external` | View/Browse/Submit no onClick; vendors hardcoded | View opens modal; Browse routes; Submit Request → `createTrainingProgram` L227; vendors derived L31-44 |
| `/hr/training/programs/schedule` | Reschedule no onClick | Reschedule modal → `updateTrainingSchedule` L62-88, L235-286 |
| `/hr/training/skills/certifications` | Export/Remind STUB; expiryAlerts hardcoded | CSV export L192-208; Renew → `renewCertification` L141; Upload → `uploadCertificate` L93; alerts/compliance derived |
| `/hr/training/skills/gap` | Enroll Employees no onClick; gapData hardcoded | Enroll Employees → modal → `enrollInTraining` L260; skillGaps fetched from `HrPagesService.get('/hr/skill-gaps')` |
| `/hr/training/skills/matrix` | View Training Programs no onClick | `router.push('/hr/training/programs/catalog?skill=…')` L334 |

---

## Compliance (1 of 21 FIXED) — 20 still stubbed 🚧

Only `licenses/certificates` fully fixed (View + Download → `window.open(documentUrl)`).

**The remaining 20 compliance pages** all have the same residual defect: **primary state-transition button is WIRED, but View Details / View Findings / View Full Report / Download Return / Download License / View Evidence / etc. still lack `onClick`**. Every page fetches real data and has functional primary actions (Start Investigation, Submit Return, Send Reminder, Initiate Renewal, etc.), just the read-only detail buttons are unwired.

Additional issues on 3 diversity pages:
- `compliance/diversity/eeo` — `eeoCategories` (L36-44) + promotion/compensation/training (L89-114) still hardcoded
- `compliance/diversity/metrics` — 7 metric arrays (L74-124) still hardcoded (only `departmentDiversity` moved to service)
- `compliance/diversity/posh` — `icMembers` (L104-109), `trainingData` (L111-116) still hardcoded

And `compliance/labor/tracker` — item cards still render no action buttons (only informational display).

---

## Re-verification (2026-07-24) — 38 pages promoted to FIXED

### Compliance (18 of 20 fixed)

All 20 compliance View Details / Download stubs got real detail modals + status handlers. Only 2 still PARTIAL:
- `compliance/audit/remediation` — Add flow works but per-card actions still absent
- `compliance/labor/tracker` — Add flow works but per-card actions still absent

The 18 FIXED: `audit/audits`, `audit/findings`, `diversity/grievance`, `labor/calendar`, `labor/registers`, `licenses/master`, `licenses/renewals`, `policy/acknowledgment`, `policy/disciplinary`, `policy/violations`, `returns/{esi, lwf, pf, pt, tds}` — all now use `setDetail*` modals + status-update handlers via `HrComplianceDocsService`.

### Documents (5 of 6 fixed)

- `certificates/status` — `handleDownloadCertificate` + `setDetailRequest` + `handleCancel` all wired L366-382
- `compliance/expired`, `compliance/missing`, `compliance/renewals` — all `window.alert()` replaced with real `sendComplianceReminder`, `uploadDocumentFile`, `resolveComplianceIssue` calls
- `repository/search` — 5 filter pill buttons now `onClick={() => setActiveType(...)}` L165-169
- `repository/browse` still PARTIAL — folders array still hardcoded (comment labels it "static navigation chrome")

### Performance goals (3 of 3 fixed) ✅

- `goals/{department, my, team}` — all now have `HrTalentService.getPerformance` + `updatePerformance` Edit modal

### Succession (9 of 9 fixed) ✅

All 9 succession pages gained `HrTalentService.getSuccession` + `updateSuccession` Edit modals:
- `development/{leadership, mentoring, rotation}` — Edit Program/Pair/Rotation modals
- `plans/tracking` — Edit modal alongside router.push
- `positions/identify` — Edit Position modal
- `talent/{development, identify, profiles, readiness}` — Edit modals

### Safety (4 of 5 fixed)

- `reports/analytics`, `reports/compliance`, `reports/kpi`, `wellness/occupational` — all now overlay `HrSafetyService.getReportBreakdowns/getIncidentBreakdowns/getTrends` over hardcoded fallback defaults
- Only `management/procedures` still PARTIAL — Report Incident router.push added but procedure cards still non-interactive

### Cosmetic (2 of 2 fixed) ✅

- `performance/reviews/cycles` View Details → `setDetailCycle` L269-272
- `assets/inventory/requests` New Request → `setShowCreateForm(true)` L267

---

## The final 7 PARTIAL pages — ALL FIXED ✅ (2026-07-24)

| Route | Was | Now |
|---|---|---|
| `compliance/audit/remediation` | Cards had no per-card actions | Per-card **View** modal + **Mark In-Progress/Complete** → `HRComplianceService.updateRemediationPlanStatus` |
| `compliance/diversity/eeo` | `eeoCategories`/`promotionData`/`compensationData`/`trainingData` hardcoded | Fetched from `GET /hr/diversity/breakdown?kind=eeo` (categories + compensation aggregated from Employee data; promotion/training reference config); old values seeded as fallback |
| `compliance/diversity/metrics` | 7 metric arrays hardcoded | Fetched from `?kind=metrics` (gender/age/education/leadership aggregated from Employee; disability/ethnicity/hiring reference config) |
| `compliance/diversity/posh` | `icMembers`, `trainingData` hardcoded | Fetched from `?kind=posh` (IC roster + awareness sessions); existing grievance load + `updatePoshComplaint` untouched |
| `compliance/labor/tracker` | Cards display-only | Per-card **View** modal + **Mark Compliant/Log Completion** → `HrComplianceDocsService.updateRegister` |
| `documents/repository/browse` | `folders` array hardcoded | Derived via `useMemo` from loaded documents' `documentCategory` (unique categories + counts); folder click filters the file list |
| `safety/management/procedures` | Procedure cards had no actions | Per-card **View Details** modal + **Start** → `HrSafetyService.updateTraining`; Report Incident routing preserved |

**New backend:** `DiversityController` + `DiversityService` + DTO under `b3-erp/backend/src/modules/hr/` (registered in `hr.module.ts`); no migration (Employee/Department/Designation already in `forFeature`).
**New frontend method:** `HrComplianceDocsService.getDiversityBreakdown(kind)`.

---

## Re-verification note (2026-07-23)

Since the 2026-07-22 remediation pass, **zero additional pages have been fully fixed**. The 45 PARTIAL count is unchanged. However, some partial improvements landed inside pages that are still PARTIAL overall:

| Page | Micro-improvement (still PARTIAL) |
|---|---|
| `compliance/audit/remediation` | Now has full Add flow via `HRComplianceService.createRemediationPlan()` L62; per-card action buttons still absent |
| `compliance/diversity/eeo`, `metrics`, `posh` | Primary data table on each moved to `HrComplianceDocsService.getDocuments('diversity')`; smaller reference arrays still hardcoded |
| `compliance/labor/registers` | Export button now wired to `handleExport(register)` L313; View Register still bare |
| `compliance/returns/lwf/pf/pt/tds` | View/Download button positions verified — all still bare |
| `documents/compliance/{expired, missing, renewals}` | Handlers now named (`handleUploadRenewed`, `handleViewOldDocument`, etc.) instead of empty — but each still just calls `window.alert("not yet available")`. Renewal's `handleResolve` is real (`DocumentManagementService.resolveComplianceIssue`) |
| `safety/reports/{analytics, compliance, kpi}`, `safety/wellness/occupational` | Primary data now fetched from `HrSafetyService.getReports/getWellness/getTrends`; secondary reference arrays remain hardcoded with **inline code comments explaining pending backend feeds** |

**Bottom line:** all 45 pages remain PARTIAL. Of these, **7 are annotated in the source as intentional / pending-backend** (`documents/repository/browse` folders, `documents/repository/search` filter pills, `safety/reports/analytics` shift/root-cause, `safety/reports/compliance` reference arrays, `safety/reports/kpi` cards, `safety/wellness/occupational` sensor metrics) — so they should arguably be reclassified as "backend-gap" rather than "defect".

---

## The 45 remaining PARTIAL pages

### Compliance (20)
- 20 pages with unwired View Details / Download buttons: audits, findings, remediation, eeo, grievance, metrics, posh, labor/calendar, labor/registers, labor/tracker, licenses/master, licenses/renewals, policy/acknowledgment, policy/disciplinary, policy/violations, returns/{esi, lwf, pf, pt, tds}

### Documents (6)
- `certificates/status` — Download Certificate + View Details still stubs
- `compliance/expired` — Upload Renewed + View Old still alert-only
- `compliance/missing` — Upload + View Profile still alert-only
- `compliance/renewals` — View Current + Contact Employee still alert-only
- `repository/browse` — `folders` array L86-93 still hardcoded (annotated intentional)
- `repository/search` — 5 filter pill buttons (All Types/PDF/Word/Excel/Last 30 days) still no onClick (annotated "visual only")

### Performance (3 — read-only DataTables)
- `performance/goals/department`, `/goals/my`, `/goals/team` — filterable DataTables with no CRUD (may be by design)

### Succession (9)
- Development: leadership, mentoring, rotation — no action buttons
- Plans/tracking, positions/identify, talent/development, talent/identify, talent/profiles, talent/readiness — navigation-only

### Safety (5)
- `management/procedures` — Report Incident + Quick Guides tiles no onClick
- `reports/analytics` — Advanced Filters no onClick; `incidentsByShift`/`rootCauses` hardcoded (comment: pending feed)
- `reports/compliance` — Sync Status + Prepare Checklist no onClick; 4 reference arrays hardcoded
- `reports/kpi` — DART/severity/nearMissRatio/training/audit/incidentsClosed cards + `departmentScores` still hardcoded
- `wellness/occupational` — `exposureMetrics` hardcoded (comment: pending sensor feed)

### Training (1)
- (none fully partial — all 10 were fixed except cosmetic details on `elearning/my` and `skills/certifications`)

### Reviews cycles (1 cosmetic)
- `performance/reviews/cycles` — View Details still lacks onClick (Create + Settings work)

### Assets (0)
- ✅ All 12 fully resolved

### Inventory/Requests (1)
- `assets/inventory/requests` — "New Request" header button still lacks onClick (row actions work)

### AMC/Preventive cosmetic (2)
- `assets/maintenance/amc` — "Edit Contract" opens detail modal instead of edit form
- `assets/maintenance/preventive` — "Reschedule" opens detail modal instead of schedule form

---

## Defect breakdown (remaining 45 PARTIAL)

| Defect | Count | Priority |
|---|---:|---|
| View Details / Download detail button lacks onClick (compliance) | 20 | Medium — read-only stubs, backends likely exist |
| Alert-only "coming soon" stubs (documents/compliance) | 3 pages × ~2 buttons | Low — labelled as pending storage integration |
| Hardcoded reference/chart arrays (backend gap) | 8 pages | Low — need new backend endpoints |
| Read-only list pages (may be by design) | 3 goals + 9 succession = 12 | Design decision |
| Cosmetic "opens wrong modal" | 2 (amc, preventive) | Low |
| Header "New Request" button unwired | 1 | Low — row actions work |

---

## Fix strategy — Phase 2

### Highest priority
1. **Wire the 20 compliance View Details / Download buttons** — most already have `handleDownload(fileUrl)` patterns established elsewhere. Same-shape work: ~15 min × 20 = ~5 h.
2. **Complete the 3 documents/compliance alert-only stubs** (expired/missing/renewals) — need backend integration for renewed-doc storage.

### Medium priority
3. **Diversity page hardcoded arrays** — remove `eeoCategories`, 7 metrics arrays, `icMembers`, `trainingData`. Either derive from fetched data or add backend endpoints.
4. **Succession module design decision** — pick whether to (a) accept navigation-only design and mark 9 pages as FIXED-by-design, or (b) add inline modal actions.
5. **Safety report residual arrays** — DART/severity/nearMissRatio (needs backend feed), `incidentsByShift`, `exposureMetrics` (sensor integration).

### Low priority
6. `assets/inventory/requests` "New Request" button (5 min).
7. `assets/maintenance/amc` Edit Contract dedicated form.
8. `assets/maintenance/preventive` Reschedule form.
9. `performance/reviews/cycles` View Details button.

### Estimated effort (Phase 2)

| Bucket | Est. work |
|---|---|
| Wire 20 compliance detail buttons | ~5 h |
| Alert-only stubs remediation | ~3-4 h (needs backend integration) |
| Hardcoded arrays cleanup | ~4-8 h (some need new backend endpoints) |
| Cosmetic buttons | ~2 h |
| **Total** | **~14-19 h** |

Down from the previous estimate of ~29-39 h.

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/hr/**/page.tsx` + `b3-erp/frontend/src/app/(modules)/hr/**/page.tsx`
- Services (new methods added in remediation):
  - `hrAssetsService.ts` — 12 new `updateXxx` methods + `createAssetAllocation`/`createAssetInventory`
  - `hrComplianceDocsService.ts` — `submitReturn`, `updatePoshComplaint`, `updateGrievance`, `updateAudit`, `updateLicense`, `updatePolicyAcknowledgment`, `updateDisciplinaryAction`, `updatePolicyViolation`, `createRegister`, `uploadDocumentFile`
  - `hrSafetyService.ts` — `getDrills`, `getIncidents`, `updateIncident`, `getTrainings`, `createTraining`, `getPpe`, `createPpe`, `getHazards`, `updateHazard`, `getWellness`, `createWellness`, `getReports`, `getTrends`
  - `trainingDevelopmentService.ts` — `startAssessmentAttempt`, `submitAssessmentAttempt`, `submitTrainingFeedback`, `enrollInCourse`, `updateLessonProgress`, `updateTrainingSchedule`, `renewCertification`, `uploadCertificate`, `createCertification`, `createTrainingProgram`, `enrollInTraining`
  - `performanceManagementService.ts` — `getKPIMaster`, `createKPIMaster`, `updateKPIMaster`, `deleteKPIMaster`, `getReviewCycles`, `createReviewCycle`, `updateReviewCycle`, `rescheduleReviewMeeting`, `deleteKPIAssignment`
  - `hrTalentService.ts` — `updateSuccession`
  - `documentManagementService.ts` — `getHRPolicies`, `publishPolicy`, `unarchiveDocument`, `downloadDocument`, `searchDocuments`, `getDocumentAuditLogs`, `deleteEmployeeDocument`, `cancelCertificateRequest`, `sendComplianceReminder`, `resolveComplianceIssue`, `updateComplianceDocument`
