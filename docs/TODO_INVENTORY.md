# TODO / FIXME Inventory (triage)

> Tracking doc for P2-02. Snapshot: **2026-07-05**. Regenerate with:
> ```
> grep -rInE 'TODO|FIXME|HACK|XXX' b3-erp/backend/src --include='*.ts'
> grep -rInE 'TODO|FIXME|HACK|XXX' b3-erp/frontend/src --include='*.ts' --include='*.tsx'
> ```
> These are intentionally **not** filed as 300+ individual GitHub issues (that
> would be noise). This inventory is the tracking record; promote a cluster to a
> real issue when it's scheduled.

## Summary

| Area | Count | Nature |
|---|---|---|
| Backend (NestJS) `src` | 12 | 2 false positives; ~6 real, all P2-level polish |
| Frontend `src` | 319 | Almost all "action not wired to API" placeholders (the known FE≫BE gap) |
| Django `backend/optiforge` | 1 | negligible |

None are P0/P1 blockers — the P0/P1 work is tracked separately in
[PRODUCTION_READINESS_GAPS.md](PRODUCTION_READINESS_GAPS.md).

## Backend (12) — itemised

**False positives (not real TODOs):**
- `project-management/entities/installation-task.entity.ts:5,35` — `TODO = 'todo'` is an **enum status value**, not a marker.
- `sales/services/quotation.service.ts:13` — `(per TODO)` is a doc reference on a constant.

**Real, P2-level (all non-blocking polish):**
| Location | Item | Notes |
|---|---|---|
| `approvals/services/approval-workflow.service.ts:244,359` | role-based approver lookup / filter approvals by role | approvals otherwise functional (notifications wired in P0-EXEC-03) |
| `approvals/services/analytics.service.ts:319,320` | resolve approver name/role from user service | cosmetic in analytics output |
| `approvals/services/escalation.service.ts:86` | real previous-approver name in escalation | cosmetic |
| `workflow/controllers/user-task.controller.ts:133` | EventEmitter listener for user-task events | enhancement |
| `workflow/processors/notification.processor.ts:162,181` | Twilio SMS / Firebase push | already gracefully gated behind `TWILIO_ACCOUNT_SID`/`FCM_SERVER_KEY` env (see P0-EXEC-02) |
| `after-sales-service/service-billing/service-billing.service.ts:247` | integrate ServiceContractsService for active contracts | enhancement |

**Recommended:** fold the 4 approvals items into one "approvals: resolve real user/role data" ticket; the two notification items are already env-gated and need no code change until SMS/push is enabled.

## Frontend (319) — clustered

By area: `app/(modules)/*` ≈ 105 · `components/*` ≈ 86 · `app/hr/*` ≈ 7 · remainder scattered.

By pattern (top recurring — all the same shape):

| Pattern | ~count | Meaning |
|---|---|---|
| `TODO: Implement API call` / `Replace with actual API call` | ~17 | button/form handler is a stub — no fetch yet |
| `TODO: API call to <verb>` (add comment, update BOM, post to inventory, submit inspection, generate report…) | ~40+ | specific unwired write actions |
| `TODO: Implement export / edit / download functionality` | ~10 | action buttons not wired |
| `TODO: Get from auth context` | ~3 | hardcoded user/id instead of `useAuth()` |
| `TODO: Integrate Chart.js / Recharts` | ~2 | placeholder chart |

**Interpretation:** the frontend TODOs are overwhelmingly the **"page renders but this action isn't wired to a backend endpoint yet"** class — the same FE≫BE gap tracked in [optiforge_gaps.md](optiforge_gaps.md). They are not defects in shipped flows; they mark features not yet connected. They should be burned down **per-page as endpoints are built/wired**, not as a bulk sweep.

**Recommended:** treat this count as a **wiring-progress metric** — drive it down alongside the endpoint-building effort. A good pre-pilot gate: zero TODOs on the specific pages/flows the pilot exercises (rather than all 319 repo-wide).
