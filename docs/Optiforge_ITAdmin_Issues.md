# IT Admin — Detailed Issues Report

**Verified:** 2026-07-21
**Scope:** All 25 IT Admin rows previously flagged in `Optiforge_Whats_Left.md` (24 unique pages — `monitoring/errors` appears twice in the report)
**Method:** Direct code inspection of each `src/app/(modules)/it-admin/**/page.tsx`

---

## Corrected Numbers

| Status | Count | Notes |
|---|---:|---|
| **Actually FIXED** | 6 | Real fetch + all primary actions call services |
| **PARTIAL** | 16 | Real fetch + some actions wired, but Edit/Delete/Create stubbed as toast/state-only |
| **Real BROKEN** | 2 | Real fetch, but primary buttons have no `onClick` at all |
| **Total** | **24** | (Reduced from 25 — duplicate `monitoring/errors` entry) |

**Bottom line:** only **2 pages** need real remediation (`roles/permissions`, `roles/policies`). The other 16 PARTIAL pages need Edit/Delete/Create handlers swapped from toast/state-only to real service calls — the service methods already exist.

---

## The 2 REAL BROKEN pages

| Route | Fetch | Defect |
|---|---|---|
| [`/it-admin/roles/permissions`](b3-erp/frontend/src/app/(modules)/it-admin/roles/permissions/page.tsx) | REAL (L190 `ItAdminService.getRoles()`, with `fallbackRoles` L35-178 as fallback) | Save button (L277-280) has no `onClick` handler — permission edits can't be persisted |
| [`/it-admin/roles/policies`](b3-erp/frontend/src/app/(modules)/it-admin/roles/policies/page.tsx) | REAL (L36 `getSecurityPolicies`) | Add Policy button (L121-124) and row Edit button (L234-236) have no `onClick` — cannot create or edit policies |

---

## The 6 FIXED pages

| Route | Why it's fully wired |
|---|---|
| [`/it-admin/customization/branding`](b3-erp/frontend/src/app/(modules)/it-admin/customization/branding/page.tsx) | L73 `getConfigValue('it.branding')`, L120-127 handleSave → `setConfigValue` |
| [`/it-admin/license/features`](b3-erp/frontend/src/app/(modules)/it-admin/license/features/page.tsx) | L89 `getLicenseFeatures()`; read-only view (no CRUD needed by design) |
| [`/it-admin/security/alerts`](b3-erp/frontend/src/app/(modules)/it-admin/security/alerts/page.tsx) | L70 `getSecurityAlerts`, L105 `getAlertRules`; Acknowledge (L193-207) / Resolve (L209-224) / Delete (L226-239) / Toggle Rule (L245-264) all persist via service |
| [`/it-admin/security/password`](b3-erp/frontend/src/app/(modules)/it-admin/security/password/page.tsx) | L111 `getPasswordPolicy`, L170 `getPasswordStatuses`; Save (L271-293) / Unlock (L316-325) / Force Change (L327-335) all wired |
| [`/it-admin/security/sessions`](b3-erp/frontend/src/app/(modules)/it-admin/security/sessions/page.tsx) | L118 `getSessions`; Terminate (L195-207) / Terminate All (L227-238) / Save Settings (L248-259) all wired |
| [`/it-admin/system/notifications`](b3-erp/frontend/src/app/(modules)/it-admin/system/notifications/page.tsx) | L34 `getNotificationSettings`, L91-113 handleSave → `saveNotificationSettings` |

---

## The 16 PARTIAL pages

### Audit sub-module (3) — "just render" pattern

Real fetch, but every action button only opens a modal, toasts, or exports CSV. No state transitions on audit records (which may be by design — audit logs are typically read-only).

| Route | Fetch | Actions | Notes |
|---|---|---|---|
| [`/it-admin/audit`](b3-erp/frontend/src/app/(modules)/it-admin/audit/page.tsx) | REAL (`AuditLogService.getAuditLogs`) | View Details → toast (L85-87), Export → CSV (L81) | List loads; row actions are noop |
| [`/it-admin/audit/changes`](b3-erp/frontend/src/app/(modules)/it-admin/audit/changes/page.tsx) | REAL (`ItAdminService.getAuditLogs`) | View Details → modal+toast (L181-184), Export → CSV | Same pattern |
| [`/it-admin/audit/logins`](b3-erp/frontend/src/app/(modules)/it-admin/audit/logins/page.tsx) | REAL (`ItAdminService.getAuditLogs({action:'login'})`) | View Details → modal+toast (L155-158), Export → CSV | Same pattern |

### Customization (1)

| Route | Fetch | Actions |
|---|---|---|
| [`/it-admin/customization/workflows`](b3-erp/frontend/src/app/(modules)/it-admin/customization/workflows/page.tsx) | REAL (`getAutomationRules`) | Toggle → `updateAutomationRule` (L150-168) ✓ ; Delete = state-only (L170-172); Edit button no onClick (L406-411); Create = modal-stub (L192) |

### Database (3) — MIXED fetch

| Route | Fetch | Actions | Mock arrays |
|---|---|---|---|
| [`/it-admin/database/cleanup`](b3-erp/frontend/src/app/(modules)/it-admin/database/cleanup/page.tsx) | MIXED — history REAL, tasks MOCK | Run Cleanup → `createBackupRecord` (L235-249) ✓ | `cleanupTasks` L36-179 (12 hardcoded tasks) |
| [`/it-admin/database/export`](b3-erp/frontend/src/app/(modules)/it-admin/database/export/page.tsx) | MIXED — tables REAL, templates MOCK | Export → `createExportDataset` per selected (L153-168) ✓ | `templates` L68-105 (4 hardcoded) |
| [`/it-admin/database/import`](b3-erp/frontend/src/app/(modules)/it-admin/database/import/page.tsx) | MIXED — jobs REAL, mappings MOCK | Start Import → `createBackupRecord` (L118-130) ✓ ; Pause/Resume/Retry are state-only (L132-156) | `columnMappings` L83-90 |

### Monitoring (2) — "toast-only" pattern

| Route | Fetch | Actions | Notes |
|---|---|---|---|
| [`/it-admin/monitoring/errors`](b3-erp/frontend/src/app/(modules)/it-admin/monitoring/errors/page.tsx) | REAL (`getMonitoring({kind:'error'})`) | Resolve → toast only (L67-69); Export → CSV | No service call to persist resolution |
| [`/it-admin/monitoring/health`](b3-erp/frontend/src/app/(modules)/it-admin/monitoring/health/page.tsx) | MIXED — services REAL, servers MOCK | Refresh → toast only, no refetch (L67-69) | `servers` L105-184 (6 hardcoded) |

### Roles (1)

| Route | Fetch | Actions |
|---|---|---|
| [`/it-admin/roles/hierarchy`](b3-erp/frontend/src/app/(modules)/it-admin/roles/hierarchy/page.tsx) | REAL (`getRoleHierarchy()`) | Edit → toast only (L37-40); Delete → toast only (L41-43) |

### Scheduler (3)

| Route | Fetch | Actions |
|---|---|---|
| [`/it-admin/scheduler/automation`](b3-erp/frontend/src/app/(modules)/it-admin/scheduler/automation/page.tsx) | REAL | Toggle → `updateAutomationRule` (L140-154) ✓ ; Create Rule (L205-210), Edit & Delete (L410-415) all no onClick |
| [`/it-admin/scheduler/history`](b3-erp/frontend/src/app/(modules)/it-admin/scheduler/history/page.tsx) | REAL | View Details → modal (L128-130); Export → CSV — no persist actions expected |
| [`/it-admin/scheduler/jobs`](b3-erp/frontend/src/app/(modules)/it-admin/scheduler/jobs/page.tsx) | REAL (mock array now inert — marked `_mockJobsUnused`) | Run Now → `runScheduledJob` (L330-355) ✓ ; Toggle → `updateScheduledJob` ✓ ; Edit/Delete/Create → toast only (L416-428) |

### Security (2)

| Route | Fetch | Actions |
|---|---|---|
| [`/it-admin/security/2fa`](b3-erp/frontend/src/app/(modules)/it-admin/security/2fa/page.tsx) | MIXED — policy REAL, userStatuses MOCK (L138-259, 8 users hardcoded) | Save Settings → `savePasswordPolicy` ✓ ; Reset 2FA / Send Reminder / Generate Backup Codes → toast only (L311-324) |
| [`/it-admin/security/ip-whitelist`](b3-erp/frontend/src/app/(modules)/it-admin/security/ip-whitelist/page.tsx) | MIXED — entries REAL, accessLogs MOCK (L87-176, 8 hardcoded) | Add → `createIpWhitelistEntry` (L261-282) ✓ ; Delete → `deleteIpWhitelistEntry` (L242-255) ✓ ; Export → CSV |

### System (1)

| Route | Fetch | Actions |
|---|---|---|
| [`/it-admin/system/email`](b3-erp/frontend/src/app/(modules)/it-admin/system/email/page.tsx) | REAL (config) — but MOCK `emailStats` L124-131 | Save → `setConfigValue` (L106-113) ✓ ; Send Test Email → `setTimeout` mock, no real send (L115-122) |

---

## Defect breakdown

| Defect | Count | Routes |
|---|---:|---|
| Save/Add/Edit button has no `onClick` (real bug) | 2 | roles/permissions, roles/policies |
| Toast-only actions on primary buttons | 6 | audit, audit/changes, audit/logins, monitoring/errors, monitoring/health, roles/hierarchy, scheduler/jobs (Edit/Delete/Create), security/2fa (Reset/Reminder/Backup) |
| State-only actions (no service persistence) | 4 | customization/workflows (Delete), database/import (Pause/Resume/Retry), customization/templates (Duplicate), customization/fields (Add/Edit — no save handler) |
| Hardcoded arrays alongside real fetch (MIXED) | 8 | database/cleanup (cleanupTasks), database/export (templates), database/import (columnMappings), monitoring/health (servers), security/2fa (userStatuses), security/ip-whitelist (accessLogs), system/email (emailStats), roles/permissions (fallbackRoles) |
| Mock function stubs (e.g. setTimeout instead of service) | 1 | system/email `sendTestEmail` |

---

## Regressions vs. previous audit labels

- **`security/sessions`** — previously "No fetch"; **now FIXED** (L118 real fetch + terminate/terminateAll/save all wired).
- **`system/email`** — previously "No fetch"; **now PARTIAL** (config load + save both wired; only test-email uses setTimeout mock).
- **`roles/hierarchy`** — previously "No fetch"; **fetch is real**, but Edit/Delete are still toast-only → PARTIAL.
- **`roles/policies`** — previously "No fetch"; **fetch is real**, but Add + Edit have no onClick → correctly BROKEN.
- **`security/alerts`** — previously "toast-only actions"; **now FIXED** (all 4 actions call services).
- **`roles/permissions`** — mock `fallbackRoles` array (L35-178) is still present as designed fallback; Save button still has no onClick → correctly BROKEN.
- **`scheduler/jobs`** — mock array now inert (`_mockJobsUnused` at L262), real fetch used; but Edit/Delete/Create still toast → PARTIAL.

---

## Bonus — 2 additional customization pages

These weren't in the 25 remaining but were flagged in the original 38 IT Admin issues:

| Route | Status | Evidence |
|---|---|---|
| [`/it-admin/customization/fields`](b3-erp/frontend/src/app/(modules)/it-admin/customization/fields/page.tsx) | PARTIAL | Real fetch (L39); Delete (L122-131) + Toggle (L133-151) wired; Add Field opens modal (L177) but no save handler; Edit only sets `editingField` state (L387-391) |
| [`/it-admin/customization/templates`](b3-erp/frontend/src/app/(modules)/it-admin/customization/templates/page.tsx) | PARTIAL | Real fetch (L39); Delete (L116-125) + Toggle (L127-145) wired; Duplicate is state-only (L102-114); Create (L170-175) and Edit (L359-363) have no onClick |

---

## Fix strategy

### Highest priority (real bugs)
1. **`/it-admin/roles/permissions`** — add `onClick` to Save button (L277-280) that calls `ItAdminService.updateRole` with the modified permissions.
2. **`/it-admin/roles/policies`** — add `onClick` to Add Policy (L121-124) and row Edit (L234-236), wire to `createSecurityPolicy` / `updateSecurityPolicy`.

### Medium priority (toast/state-only → service)
3. **`monitoring/errors`** Resolve — swap toast for `updateMonitoring({ status: 'resolved' })`.
4. **`monitoring/health`** Refresh — swap toast for a re-invocation of `getMonitoring({kind:'health'})`.
5. **`roles/hierarchy`** Edit/Delete — swap toast for `updateRole` / `deleteRole`.
6. **`scheduler/jobs`** Edit/Delete/Create — swap toast for `updateScheduledJob` / `deleteScheduledJob` / `createScheduledJob`.
7. **`security/2fa`** Reset 2FA / Send Reminder / Generate Backup Codes — need real endpoints.
8. **`customization/workflows`** Delete — swap state-only for `deleteAutomationRule`.
9. **`database/import`** Pause/Resume/Retry — swap state-only for real backend endpoints (likely need backend work first).
10. **`customization/fields`** Add/Edit save handler; **`customization/templates`** Create/Edit onClick + Duplicate service.

### Low priority (data cleanup)
11. **Remove 8 hardcoded arrays** from MIXED pages — either derive from fetched data or add backend endpoints for the missing datasets (servers, userStatuses, accessLogs, cleanupTasks, templates, columnMappings, emailStats, fallbackRoles).
12. **`system/email` Send Test Email** — replace `setTimeout` mock with real SMTP test endpoint.

### Estimated effort

| Bucket | Pages | Est. work |
|---|---:|---|
| Fix 2 real broken pages | 2 | ~1.5 h |
| Toast/state → service on primary actions | ~12 handlers across 8 pages | ~4-6 h |
| Backend endpoints for missing IT ops (send-test-email, retry-import, 2FA reset, etc.) | ~5 endpoints | ~8-12 h backend + 2 h wiring |
| Remove hardcoded arrays (MIXED cleanup) | 8 arrays | ~2-3 h |
| **Total** | | **~17-25 h** |

---

## Sources of truth

- Route files: `b3-erp/frontend/src/app/(modules)/it-admin/**/page.tsx`
- Services:
  - `b3-erp/frontend/src/services/itAdminService.ts` (roles, policies, config, license, audit)
  - `b3-erp/frontend/src/services/auditLogService.ts`
  - `b3-erp/frontend/src/services/securityService.ts` (sessions, alerts, password, 2FA, IP whitelist)
  - `b3-erp/frontend/src/services/monitoringService.ts`
  - `b3-erp/frontend/src/services/schedulerService.ts`
