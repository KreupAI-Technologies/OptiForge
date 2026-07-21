# Audit Residual Remediation — Summary & Apply Notes

Branch: `fix/audit-residual-issues` (off `main` @ `91aefa07`).

This work verified and fixed the residual defects behind
[`Optiforge_Audit_Report_Issues.md`](Optiforge_Audit_Report_Issues.md) (338 findings).
Most findings were already resolved by prior remediation; this branch closes the
verified residual tail and builds the net-new backend the frontend needed.

## What was done (by batch / stage)

| Commit | Scope |
|---|---|
| batch 1 | Production 21 data-loss items (job status/QC flags persist via `updateStatus`), Estimation send/export/filter, 5 Common Masters CRUD modals |
| batch 2 | IT-Admin 7 items, HR assets/overtime/training wiring, Procurement risk/analytics arrays actually derivable from insights |
| batch 3a | Export buttons → client-side CSV; HR shifts/overtime/succession CRUD over existing NestJS routes |
| wave 1 | **Transport remap** of document-management / training-development / performance services off the dead relative `/api/hr` base onto real NestJS routes; HR compliance write-suite wired to existing CRUD |
| B2 | HR **KPI-master, training-budget, review-cycle** full stack |
| B3 | IT-Admin **2FA** admin subsystem |
| B5 | Per-check **installation checklists** (6 pages — fixes QA data-loss) |
| B4 | Procurement **insight chart/KPI fields** computed from real tables + **supplier portal** |
| B6a | HR **training subsystem** (schedules, attendance, waitlist, certifications, feedback, assessments, e-learning, reports) |
| B6b | HR **documents** (policies, repository, compliance-tracking) |
| B6c | HR **performance extras** (recognition comments, meeting reschedule, KPI assignment, PIP), succession analytics, biometric devices |
| B6d | IT-Admin **ops** (email, notification metrics, compliance violations, database cleanup/export/import, monitoring servers) |

## Verification (at each stage and final)

- Frontend `npx tsc --noEmit`: **0 errors**.
- Backend `npm run build` (`nest build`): **exit 0**.
- Backend `npm test`: **296 passed / 36 suites**, no regressions.

## Database migrations — MUST be applied

17 additive, idempotent (`CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`)
manual migrations were authored under `b3-erp/backend/prisma/manual/` and registered
in `MIGRATION_ORDER`. They are **pending** — the new backend features will 500/return
empty until applied:

```bash
cd b3-erp/backend
npm run db:manual:status   # dry-run: lists the 17 pending files
# TAKE A DB SNAPSHOT FIRST (forward-only, no down-migrations)
npm run db:manual          # applies them, records each in _manual_migrations ledger
```

Pending files: `orphan_hr_kpi_master`, `orphan_hr_training_budget`,
`orphan_hr_review_cycle`, `orphan_it_admin_two_factor`, `orphan_installation_checklists`,
`orphan_supplier_portal`, `orphan_hr_training_schedules`, `orphan_hr_training_attendance`,
`orphan_hr_training_waitlist`, `orphan_hr_certification_tracking`,
`orphan_hr_training_feedback`, `orphan_hr_training_assessments`, `orphan_hr_course_progress`,
`orphan_hr_policies`, `orphan_hr_documents_repo_compliance`, `orphan_hr_performance_net_new`,
`orphan_itadmin_operational`. All use `gen_random_uuid()` (pgcrypto) consistent with the
existing convention.

## Documented residual TODO (intentionally not built — no consuming page or needs infra)

These were left with explicit `// TODO(needs-backend)` markers rather than faked:

- **Binary file storage** — document/certificate upload/download return the stored
  `fileUrl` when present, else "not available". No blob store is integrated; wiring a
  real object store (S3/GCS) is a separate infra task.
- **HR training**: `getSkillGapAnalysis` (per-employee aggregate), `recordTrainingCost`,
  training `getDashboard`.
- **HR performance**: `feedback`, `feedback-requests`, `dashboard`, `reports/*`
  (no consuming page in the audit scope).
- **Procurement** fields with no source column: strategic-sourcing
  `supplierConsolidationData`; automation `aiPredictions`/`costSavings`; quality
  `inspectionQueue`/`inspectionTemplates`; marketplace product `rating` and order line
  counts; supplier `onTimeDelivery`/`qualityScore`. These return `[]`/`0` (never
  fabricated) and need either new source tables or evaluation data to populate.
- **IT-Admin**: email `openRate`/`clickRate` (no open/click tracking), import
  column-schema for datasets without a static mapping. 2FA is an admin/data subsystem
  (no real TOTP verification / SMTP send — deliberately no new npm deps).

## Note on "production ready"

Platform-level blockers outside this audit's scope remain (endpoint auth coverage,
overall test coverage, applying migrations to each environment). This branch closes the
FE↔API functional gaps and builds the missing domain backend; it does not by itself
certify the whole platform production-ready.
