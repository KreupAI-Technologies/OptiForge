# Partially-Wired Pages Report

> ## ✅ RESOLVED — 2026-07-09 (branch `feat/complete-remaining-wired-pages`)
> Re-verified all 25 flagged pages at HEAD. The `readiness-fixes` merge had already
> fully wired **~16** of them (all 6 inventory pages, production `bom`, `bom/versions`,
> `downtime/log`, `downtime/rca`, `quality`, `shopfloor/operator`, procurement `grn`,
> finance `periods` + `receivables/credit-management`, `crm/customers/portal`,
> `installation/tool-prep`). The genuinely-incomplete remainder was completed:
>
> | Page | Action taken |
> |---|---|
> | `/production/automation` | Added `activate/pause/disable/execute` methods to `production-orphan.service`; wired Start→execute, Pause→pause, Stop→disable; removed all `console.log` stubs (no-backend handlers made honest UI no-ops) |
> | `/production/downtime` | Replaced hardcoded mock summary with `useMemo` computed from `getDowntimeRecords()` (totals, MTTR, by-category; non-derivable metrics → 0, not faked) |
> | `/production/downtime/analysis` | Replaced mock monthly/category arrays with values grouped/computed from fetched records |
> | `/production/shopfloor` | Removed fake operator identity "Amit Sharma"; badge login now derives from the real `employeeId` |
> | `/procurement/purchase-requisition` | New `procurement-purchase-requisition.service` (submit / convert-to-PO); wired both `console.log` stubs to real POST routes |
> | `/procurement/rfq-rfp` | Award → `awardRFQ`; Export → client-side CSV download; View-bid → opens real `AwardBidModal`; dead Edit alert removed |
> | `/procurement/contracts` | Removed permanently-disabled "View History" button (no history endpoint exists) |
> | `/finance/advanced-features` | Removed 6 fabricated mock datasets; each tab now shows an honest empty-state; page fetches the real feature-toggle endpoint |
>
> Gate: frontend `tsc --noEmit` = **0 errors** (baseline preserved). Net genuinely-partial live pages: **0**.
>
> ---

_Regenerated: 2026-07-08 (branch `main`, commit `1db4e41a`)._
_Detector v3: import-following depth ≤ 3, follows relative + alias imports. Same classifier as [`wiring-audit-2026-07-08.md`](./wiring-audit-2026-07-08.md)._

Pages under `b3-erp/frontend/src/app/` that **do fetch data from the backend somewhere in their tree, but also contain a stub-style handler** (`alert()`, `console.log('click'|'save'|…)`, `// TODO`/`FIXME`/`HACK`, or empty `onClick`).

**Total partially-wired pages: 25**
**(Total scanned: 1730 · NOT_WIRED: 2 · PARTIAL: 25 · FULL: 1698 · DEPRECATED: 5)**

## Issue tags used

- `wired-via-delegation` — the `page.tsx` itself has no service import or API call, but a component it renders does — so the page IS wired
- `no-service-import` — nothing in the tree imports from a services alias or relative services path
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, `useMutation`, or `useSWR` at the tree level (rare in this bucket)
- `mock-data` — tree declares `MOCK_*` / `mockData` / `dummyData` alongside a real API call (fallback risk)
- `TODO(xN)` — tree contains N `// TODO`, `// FIXME`, or `// HACK` markers
- `coming-soon` / `not-implemented` / `placeholder-feature` — matching literal in tree
- `empty-onclick` / `console-log-onclick` / `alert-onclick` — stub button handlers

## How to read the issue list

| Pattern | Meaning |
|---|---|
| `wired-via-delegation` | Page is a thin wrapper; the real wiring lives in the child component |
| `mock-data` | Real API call exists but a mock array is also present (fallback risk) |
| `TODO(xN)` | Real API integration but N incomplete spots |
| `alert-onclick` / `console-log-onclick` / `empty-onclick` | Placeholder button handler somewhere in the tree |
| `coming-soon` | Explicit "coming soon" literal in the tree |

---

## Summary by module

| Module | Partial pages |
|---|---|
| production | 10 |
| inventory | 6 |
| procurement | 4 |
| finance | 3 |
| crm | 1 |
| installation | 1 |

---

## `production` — 10 partially-wired pages

| Route | Issues |
|---|---|
| `/production/automation` | console-log-stub |
| `/production/bom` | mock-data; TODO(x5) |
| `/production/bom/versions` | TODO(x9) |
| `/production/downtime` | TODO(x13) |
| `/production/downtime/analysis` | TODO(x10) |
| `/production/downtime/log` | TODO(x3) |
| `/production/downtime/rca` | TODO(x17) |
| `/production/quality` | TODO(x2) |
| `/production/shopfloor` | mock-data; TODO(x3) |
| `/production/shopfloor/operator` | TODO(x2) |

## `inventory` — 6 partially-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments` | TODO(x1) |
| `/inventory/cycle-count` | TODO(x1) |
| `/inventory/movements` | TODO(x6) |
| `/inventory/stock` | TODO(x2) |
| `/inventory/stock/low-stock` | TODO(x2) |
| `/inventory/transfers` | TODO(x3) |

## `procurement` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/procurement/contracts` | TODO(x4) |
| `/procurement/grn` | mock-data; TODO(x7) |
| `/procurement/purchase-requisition` | wired-via-delegation; mock-data; console-log-stub |
| `/procurement/rfq-rfp` | wired-via-delegation; mock-data; TODO(x1) |

## `finance` — 3 partially-wired pages

| Route | Issues |
|---|---|
| `/finance/advanced-features` | mock-data; empty-onclick |
| `/finance/periods` | wired-via-delegation; mock-data; empty-onclick |
| `/finance/receivables/credit-management` | mock-data; console-log-stub |

## `crm` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/crm/customers/portal` | empty-onclick |

## `installation` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/installation/tool-prep` | empty-onclick |

