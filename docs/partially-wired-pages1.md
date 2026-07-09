# Partially-Wired Pages Report — Verified

> ## ⚠️ SUPERSEDED (historical) — see [`partially-wired-pages.md`](./partially-wired-pages.md)
> This is the **2026-07-06 investigation** (356→43 pages, since fixed on `main`). It is kept for history. The current, re-verified partial-wiring status is in [`partially-wired-pages.md`](./partially-wired-pages.md) (v3 detector) and the backend gaps in [`pending-backend-work.md`](./pending-backend-work.md). No open action items remain in this file.
>
> ---

_Verified via import-following investigation on 2026-07-06_

> ✅ **COMPLETED 2026-07-07** — All 43 GENUINELY-PARTIAL pages (Section 1) fixed on `main` in 4 commits (`37263949`, `4317cb42`, `e7306512`, `2dd6fb4c`). Frontend `tsc --noEmit` = 0 errors at every commit (baseline was already clean). Breakdown:
> - **HR (26):** dropped the `rows.length ? rows : [mockDemo]` fallback → render real fetched data only, with a proper `<EmptyState />` when empty. Payroll pages recompute header KPIs/challan totals from real records instead of the deleted mock object.
> - **Add-form pickers (5):** wired the residual secondary picker on each add form to an existing service — bom/add→`bomService.getAllBOMs`, work-orders/add→`commonMastersService.getItemsFull`, grn/add→`warehouseService.getAllWarehouses` (+ renamed misleading `mockLineItems`→`lineItems`), rfq/add→`purchaseRequisitionService.getAllRequisitions`, shipping/add→`LogisticsService.getTransportCompanies`. Legitimately-static enums (units, incoterms, package types) correctly left as constants.
> - **TODO backlog (7):** cpq + workflow approvals approve/reject wired to real service calls (`cpqApprovalService.decide`, `approvalService.processAction`) and `alert()`s removed; inventory/movements real cost mapping + edit via `updateStockEntry`; work-orders/edit dropped mock fallback + added not-found state; project-types + kanban dropped dead mock + added EmptyState; gantt drag-drop reschedule was already wired (no-op).
> - **Misc (5):** dashboard/inventory widgets, iot devices, crm contact-lists, estimation cost-breakdown, support report-templates all wired to real endpoints with loading/empty/error states replacing mock fallbacks.
>
> Where a *secondary* sub-feature had no existing endpoint (approval comment/delegate, decorative advanced-feature sub-tabs), it was left honestly disabled / as showcase rather than faked — noted per commit. No speculative backend endpoints were invented. Section 2 (static-by-design) and Section 3 (false positives) correctly needed no work.

## What changed

The regex scanner flagged **356** pages as "partially wired." Each has now been import-followed 3 levels deep with a smarter scanner that detects:
- Generic `await fetchX<T>()` calls (regex assumed `(` right after name — missed these)
- Multi-line service chains (`serviceInstance.\n  method()`)
- Default-import services (`import svc from '...'`)
- Whether mock arrays are actually RENDERED (`.map/.filter`) vs. declared as dead code

**The truth: only 43 of 356 pages actually need code work.** The other 313 are false positives (310 wired, 3 static-by-design). The scanner false-positive rate on the partial-list is **~88%** — even higher than the not-wired list.

## Summary

| Verdict | Count | Meaning |
|---|---|---|
| 🔴 **GENUINELY-PARTIAL** | **43** | Real API works, but has actively-rendered mock fallback, TODO markers, or stubbed CRUD ops |
| ⚪ **STATIC-BY-DESIGN** | **3** | Coming-soon stubs — remove from punch list |
| 🟢 **FULLY-WIRED-VIA-DELEGATION** | **310** | Regex missed direct wiring or delegated wiring (false positives) |
| **Total re-verified** | **356** | |

Notable finding: **all 113 reports pages** are fully wired via `reports-management.service`. **All 15 finance partial pages** are correctly wired. The perceived "wall of partials" is a scanner artifact.

---

# 🔴 Section 1: GENUINELY PARTIAL (43 pages)

Pattern legend for the "Why" column:
- **F**: real API works but a fallback ternary `rows.length ? rows : mockArr` still renders demo data when API is empty/errors
- **T**: unresolved TODO/FIXME marker on an incomplete feature branch
- **M**: hardcoded mock array actively used in render (`.map/.filter/.reduce`) alongside API data
- **C**: "coming soon" copy shown even though partial API exists

## HR (26) — same fallback ternary pattern everywhere, batch-fixable with a codemod

Fix: replace `const items = rows.length ? rows : [...mockDemo]` with `const items = rows;` and render a proper `<EmptyState />` when `rows.length === 0`. One codemod pass across the whole cluster.

| Route | Why |
|---|---|
| `/hr/alumni/directory` | F |
| `/hr/alumni/network` | F + C |
| `/hr/alumni/rehire` | F |
| `/hr/cards/management` | F |
| `/hr/cards/reconciliation` | F |
| `/hr/cards/transactions` | F |
| `/hr/employees/directory/active` | F |
| `/hr/expenses/my` | F |
| `/hr/onboarding` | T (TODO marker) |
| `/hr/overtime/approval` | F |
| `/hr/overtime/requests` | F |
| `/hr/payroll/esi/contribution` | F |
| `/hr/payroll/pf/contribution` | F |
| `/hr/payroll/pt` | F |
| `/hr/reimbursement/paid` | F |
| `/hr/reimbursement/pending` | F |
| `/hr/reimbursement/processing` | F |
| `/hr/reimbursement/settlement` | F |
| `/hr/safety/incidents/tracking` | F |
| `/hr/timesheets/bulk-punch` | T + C (bulk-punch feature stubbed) |
| `/hr/training/programs/catalog` | F |
| `/hr/travel/advances` | F |
| `/hr/travel/cards` | F |
| `/hr/travel/expenses` | F |
| `/hr/travel/history` | F |
| `/hr/travel/requests` | F |

## Add-form mock pickers (5) — need master-data pickers wired

| Route | Why |
|---|---|
| `/production/bom/add` | M (mock BOM components in add form) |
| `/production/work-orders/add` | M |
| `/procurement/grn/add` | M |
| `/rfq/add` | M |
| `/logistics/shipping/add` | M |

## Genuine TODO backlog (7) — real product work, not codemod

| Route | Why |
|---|---|
| `/cpq/workflow/approvals` | T (approval-flow TODO) |
| `/inventory/movements` | T ×2 |
| `/project-management/gantt` | T (drag-drop reschedule TODO) |
| `/project-management/project-types` | M (fallback types list rendered) |
| `/production/work-orders/edit/[id]` | F |
| `/projects/execution/kanban` | M (mock columns still rendered) |
| `/workflow/approvals` | T + C + `alert()` handler |

## Other genuine partials (5)

| Route | Why |
|---|---|
| `/(dashboard)/inventory` | M (dashboard widgets use mock) |
| `/advanced-features/iot` | F (`FALLBACK_DEVICES` when service errors) |
| `/crm/contacts` | M + C (partial coming-soon inside crm contacts) |
| `/estimation/advanced-features` | M |
| `/support/reports` | F (empty-state fallback) |

---

# ⚪ Section 2: STATIC-BY-DESIGN (3 pages)

These are coming-soon stubs — either build them out or delete them, but don't count them as "partial wiring" tasks.

| Route | Why |
|---|---|
| `/project-management/capacity` | Coming-soon stub |
| `/cpq/integration/cad` | Coming-soon + placeholder `alert()` |
| `/cpq/integration/ecommerce` | Coming-soon + placeholder `alert()` |

---

# 🟢 Section 3: FULLY WIRED VIA DELEGATION — FALSE POSITIVES (310 pages)

The regex scanner missed direct wiring or delegated wiring in these pages. **No work needed on any of them.**

## Per-module breakdown of false positives

| Module | False positives | Actual state |
|---|---|---|
| reports | 113 | ALL wired via `reports-management.service` — 100% false positive rate |
| hr | 61 | Wired via HR service layer; mock arrays are dead-code (declared, not rendered) |
| project-management | 26 | Wired via `ProjectManagementService` + related |
| support | 16 | Wired via `support.service` |
| finance | 15 | Wired via `Financial*` re-export components |
| cpq | 14 | Wired via `cpq.service` |
| projects | 13 | Wired via `projects.service` |
| procurement | 11 | Wired via procurement components |
| production | 9 | Wired via production services |
| crm | 7 | Wired via CRM service layer |
| packaging | 4 | Direct API wiring in components |
| inventory | 4 | Wired via inventory services |
| logistics | 3 | Wired via logistics services |
| sales | 3 | Wired via sales services |
| after-sales-service | 2 | Wired via after-sales services |
| compliance | 2 | Wired via compliance service |
| (dashboard) | 1 | Wired |
| collaboration | 1 | Wired |
| it-admin | 1 | Wired |
| login | 1 | Wired (uses auth flow, not @/services regex) |
| quality | 1 | Wired |
| rfq | 1 | Wired |
| workflow | 1 | Wired |

## Why the regex missed them

1. **Generic `await fetchX<T>()`** — scanner regex assumed `(` right after the name, so it missed `await fetchDataService<Response>()`.
2. **Multi-line service chains** — `serviceInstance\n  .method()` — regex only matched single-line invocations.
3. **Default-import services** — `import svc from '...'` — regex looked for named-import patterns.
4. **Dead-code mock arrays** — many pages declare `const MOCK_DATA = [...]` at the top but never reference it; the regex counted these as mock fallback.
5. **`useState` initial value** — `useState<Item[]>(MOCK_ITEMS)` is dead code once the `useEffect` fires the fetch and overwrites state — but the regex counted it as active mock.

---

# Bottom line

- **43 pages** need real code work — 26 HR pages fixable with one codemod (`.length ? rows : mockArr` → `rows` + `<EmptyState />`), plus 5 add-form pickers, plus 7 genuine TODO features, plus 5 misc.
- **3 pages** should be marked as static-by-design (coming-soon stubs).
- **310 pages** are false positives — no work needed.

Estimated effort:
- **HR codemod** (26 pages): ~1 afternoon
- **Add-form master-data pickers** (5 pages): ~2 days
- **Genuine TODO features** (7 pages): variable, product-work
- **Misc partials** (5 pages): ~1-2 days

Combined with the [not-wired-pages.md](not-wired-pages.md) list of **28 genuinely-not-wired** pages, the **total real backlog is 71 pages** out of ~1,670 — significantly better than the raw scan numbers suggested.
