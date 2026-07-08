# App Readiness Audit — Frontend

_Generated: 2026-07-08 · branch `main` · HEAD `1db4e41a` · scope: `b3-erp/frontend` (1671 pages, 1670 routes)._

Audited against three release criteria:

1. **API-backed** — every page pulls from the backend; no mock/fallback/hardcoded data.
2. **Functional buttons** — every button does something and is backend-integrated.
3. **No 404s** — no internal link points at a route that doesn't exist.

## Verdict: **NOT READY** — one hard blocker (404s), two partial

| Criterion | Status | Headline finding |
|---|---|---|
| i. API-backed, no mock data | 🟡 **Mostly met** | Only ~7 pages still carry explicit mock arrays; ~63 pages have actions with no endpoint (tracked separately) |
| ii. Functional + integrated buttons | 🟡 **Mostly met** | ~13 stub handlers (`alert`/`console.log`/`window.prompt`); but **64 row buttons navigate to 404s** |
| iii. No 404s | 🔴 **BLOCKER** | **110 distinct internal links resolve to non-existent routes**, incl. **26 in always-visible navigation** (Sidebar, Command Palette, mobile nav) |

**Method:** static route map built from every `page.tsx` (route groups `(x)` stripped, `[param]`/`[...catch]` honored); every `href`/`to`/`path`/`router.push`/`redirect` literal across `src/**` matched against it. API-service files excluded from the route check. Every "MISSING" was spot-verified with `find`.

---

## Criterion i — API-backed, no mock data 🟡

**Explicit mock/dummy data still present (7 pages)** — remove and wire to endpoints:

- `hr/assets/reports/costs/page.tsx`
- `hr/assets/reports/department/page.tsx`
- `hr/assets/reports/register/page.tsx`
- `hr/assets/reports/employee/page.tsx`
- `hr/assets/reports/allocation/page.tsx`
- `(modules)/it-admin/users/bulk/page.tsx`
- `(modules)/reports/dashboards/page.tsx`

**No direct API call at page level: 87 pages.** Of these, **79 delegate to a child component** that does the fetching (wired-via-delegation — consistent with prior audits; 30 are common-masters known false-positives). **8 are self-contained static** (nav-hubs / `design-system` / `_finance_deprecated` — no data by design). None are confirmed orphans, but the 79 delegators are worth a spot-check.

**Actions with no backing endpoint (~63 pages)** — these render live data but have write/export actions the backend can't service. Fully enumerated in [`pending-backend-work.md`](./pending-backend-work.md) (the `[BE]` items). Not repeated here.

## Criterion ii — functional & integrated buttons 🟡

**Stub handlers (endpoint-less or placeholder):**

- `console.log`-only `onClick`: **7 files**
- `alert()`-only `onClick`: **6 files** (e.g. cpq integration "Feature coming soon", grn invoice-matching)
- `href="#"` dead links: **4 files**
- `window.prompt` interim inputs (endpoint exists, UI unfinished): **~11 files** — see `[UI]` items in [`pending-backend-work.md`](./pending-backend-work.md)
- Empty `onClick={() => {}}`: **0** ✅

**Buttons that "work" but lead to a dead page: 64** — row-level View/Edit/History buttons that `router.push` to a route that was never built (see Criterion iii §C). Functionally these are worse than a stub — they look wired but 404 on click.

## Criterion iii — no 404s 🔴 BLOCKER

**110 distinct internal targets resolve to no route.** Grouped by severity:

### A. Navigation-component 404s — 26 (highest severity: always on screen)

These live in the sidebar, command palette, global search, mobile nav, keyboard shortcuts, and shop-floor layout — every user hits them.

| Broken route | Source |
|---|---|
| `/finance/currency/gain-loss` | Sidebar |
| `/sales/delivery` | Sidebar (parent hub, only children exist) |
| `/sales/pricing`, `/sales/settings` | Sidebar |
| `/production/shopfloor/logs` | Sidebar |
| `/reports/finance`, `/reports/quality` | Sidebar |
| `/it-admin/monitoring/logs` | Sidebar |
| `/procurement/orders/new`, `/production/orders/new`, `/crm/contacts/new` | CommandPalette, QuickAccessButtons |
| `/production/orders`, `/inventory/items`, `/accounts/ledger` | CommandPalette |
| `/procurement/orders/5678`, `/crm/contacts/acme`, `/crm/leads/techstart` | GlobalSearch (hardcoded demo results) |
| `/orders`, `/customers` | MobileBottomNav / VoiceCommands |
| `/procurement/purchase-orders/add`, `/procurement/rfq/add` | KeyboardShortcuts |
| `/shopfloor`, `/shopfloor/tasks`, `/shopfloor/scan`, `/shopfloor/materials`, `/shopfloor/issues` | ShopFloorLayout (real routes are under `/production/shopfloor`) |

### B. Hub / quick-action 404s — 20 (dashboard tiles & static buttons)

| Broken route | Source page |
|---|---|
| `/settings/notifications`, `/settings/localization`, `/settings/appearance` | settings |
| `/it-admin/settings`, `/it-admin/backup`, `/it-admin/servers`, `/it-admin/logs` | it-admin hub |
| `/finance/journal-entries/create`, `/finance/accounting/journal-entries/add` | finance hub / dashboard |
| `/reports/sales/today`, `/reports/inventory/current-stock`, `/reports/production/active-wo`, `/reports/approvals/pending` | reports hub |
| `/cpq/contracts` (parent hub) | cpq contracts/generate |
| `/invoices`, `/transactions`, `/charges`, `/company/invoices` | FinancialIntegrations |
| `/estimation/costing/view/…`, `/estimation/pricing/view/…` | estimation edit pages |

### C. List-row View/Edit 404s — 64 (row action buttons → unbuilt pages)

List pages exist and load data, but their per-row View/Edit/History/Configure buttons navigate to routes that were never created. Highest-volume clusters:

- **after-sales-service** (largest): service-contracts, installations, warranties (edit/extend), field-service, service-requests, parts (requisition/consumption/returns) view & edit, billing — **~16 broken view/edit routes**
- **Reports drill-downs → `/accounts/*`**: `/accounts/ledger/[id]`, `/accounts/journal/[id]`, `/accounts/transactions/[id]`, `/accounts/expense-claims/[id]`, `/accounts/expenses/[id]`, `/accounts/petty-cash/[id]`, `/accounts/banks/[id]` — **the entire `/accounts` module does not exist** (real module is `/finance`); every finance/accounts report drill-down 404s
- **Reports drill-downs → `/after-sales/*`** (missing `-service`): warranty-claims, service-calls, feedback
- **support**: tickets, knowledge, incidents — view & edit (**6**)
- **crm**: campaigns/email, campaigns/automation, settings/territories, settings/statuses — view/edit/configure/assign (**~8**)
- **projects / project-management**: planning, commissioning (view/edit/docs), deliverables (**6**)
- **estimation/rates**: labor, equipment, subcontractors — history (**3**)
- **workflow**: templates/view, automation/view & edit (**3**)
- **finance/costing**: view & edit (**2**); **procurement/po**: view & edit (**2**); **inventory/warehouse/edit** (**1**)
- **Missing builder/create targets**: `/cpq/quotes/builder` (3 refs), `/sales/quotes/create`, `/estimation/boq/create`

_Full machine-readable list: re-run `/tmp/route-audit3.mjs` (categorized) — reproduced from this session._

---

## Recommended remediation order

1. **Fix navigation 404s first (A, 26)** — small, high-visibility. Mostly wrong-path constants (`/shopfloor/*` → `/production/shopfloor/*`, `/reports/finance` → real report route, remove GlobalSearch hardcoded demo results).
2. **Decide the `/accounts` vs `/finance` convention** — one fix (rewrite report drill-down links to `/finance/*`, or alias) clears ~7 route families in cluster C.
3. **Build or redirect the 64 list-row view/edit pages** — biggest effort. For each, either scaffold the `view/[id]` + `edit/[id]` page or repoint the button to an existing detail route. after-sales-service is the largest single win.
4. **Hub tiles (B, 20)** — build the target page or hide the tile.
5. **Remove the 7 mock-data pages + 13 stub handlers** — wire to endpoints (or the `[BE]` backlog where no endpoint exists).

**Bottom line:** the app is **not release-ready** against these criteria. Data-wiring is in good shape (criterion i mostly met), but **routing integrity is a hard blocker** — 110 dead links, 26 of them in permanent navigation, plus 64 row buttons that 404 on click. None of this fails the build (Next.js resolves 404s at runtime), so it can only be caught by an audit like this or by clicking through.
</content>
