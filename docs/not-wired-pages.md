# Not-Wired Pages Report

> ## ✅ RESOLVED — branch `feat/readiness-fixes` (re-verified at HEAD)
> Both flagged pages checked at current HEAD:
> - `/design-system` — intentionally static internal component gallery (no domain data). **Correct as-is.**
> - `/projects/planning/create` — **already fully wired**: imports `projectManagementService`, real `handleSubmit` → `createProjectPlan(payload)` with submit/error/success states + redirect. Stale flag.
>
> Net genuinely-not-wired live pages: **0**. Deprecated `_finance_*` tree is not routable.
>
> ---

_Regenerated: 2026-07-08 (branch `main`, commit `1db4e41a`)._
_Detector v3: import-following depth ≤ 3, follows relative + alias imports, treats relative service imports as service imports. Same classifier as [`wiring-audit-2026-07-08.md`](./wiring-audit-2026-07-08.md)._

Pages under `b3-erp/frontend/src/app/` where **neither the page nor any component it imports (transitively) contains any backend call** — pure static shells.

**Total not-wired pages: 2**
**(Total scanned: 1671 · NOT_WIRED: 2 · PARTIAL: 39 · FULL: 1625 · DEPRECATED: 5)**

## Issue tags used

- `no-service-import` — nothing in the tree imports from `@/services`, `@/lib/api-client`, or any relative `./services/*` path
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, `useMutation`, or `useSWR` anywhere in the tree
- `mock-data` — tree declares `MOCK_*` / `mockData` / `dummyData` constants
- `TODO(xN)` — tree contains N `// TODO`, `// FIXME`, or `// HACK` markers
- `coming-soon` / `not-implemented` / `placeholder-feature` — matching literal in tree
- `empty-onclick` / `console-log-onclick` / `alert-onclick` — stub button handlers

---

## Summary by module

| Module | Not-wired pages |
|---|---|
| design-system | 1 |
| projects | 1 |

---

## `design-system` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/design-system` | no-service-import; no-api-call; coming-soon |

## `projects` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/projects/planning/create` | no-service-import; no-api-call |

---

## Deprecated folders (Next.js private `_`-prefixed, not routable)

| Route | Issues |
|---|---|
| `/_finance_deprecated` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/currency/gain-loss` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/payables/aging` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/receivables/aging` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/reports` | deprecated-folder (Next.js private) |

