# Partially-Wired Pages Report

_Regenerated: 2026-07-08 (branch `main`, commit `1db4e41a`)._
_Detector v3: import-following depth ≤ 3, follows relative + alias imports. Same classifier as [`wiring-audit-2026-07-08.md`](./wiring-audit-2026-07-08.md)._

Pages under `b3-erp/frontend/src/app/` that **do fetch data from the backend somewhere in their tree, but also contain a stub-style handler** (`alert()`, `console.log('click'|'save'|…)`, `// TODO`/`FIXME`/`HACK`, or empty `onClick`).

**Total partially-wired pages: 39**
**(Total scanned: 1671 · NOT_WIRED: 2 · PARTIAL: 39 · FULL: 1625 · DEPRECATED: 5)**

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
| production | 11 |
| finance | 7 |
| inventory | 6 |
| reports | 5 |
| procurement | 4 |
| cpq | 2 |
| crm | 1 |
| hr | 1 |
| installation | 1 |
| rfq | 1 |

---

## `production` — 11 partially-wired pages

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
| `/production/quality/add` | TODO(x1) |
| `/production/shopfloor` | mock-data; TODO(x3) |
| `/production/shopfloor/operator` | TODO(x2) |

## `finance` — 7 partially-wired pages

| Route | Issues |
|---|---|
| `/finance/accounting/chart-of-accounts` | mock-data; console-log-onclick |
| `/finance/accounting/trial-balance` | mock-data; alert-onclick |
| `/finance/advanced-features` | mock-data; empty-onclick |
| `/finance/automation/recurring-transactions` | mock-data; console-log-onclick |
| `/finance/periods` | wired-via-delegation; mock-data; empty-onclick |
| `/finance/receivables/credit-management` | mock-data; console-log-stub |
| `/finance/tax/tds` | mock-data; TODO(x2) |

## `inventory` — 6 partially-wired pages

| Route | Issues |
|---|---|
| `/inventory/adjustments` | TODO(x1) |
| `/inventory/cycle-count` | TODO(x4) |
| `/inventory/movements` | TODO(x6) |
| `/inventory/stock` | TODO(x2) |
| `/inventory/stock/low-stock` | TODO(x2) |
| `/inventory/transfers` | TODO(x3) |

## `reports` — 5 partially-wired pages

| Route | Issues |
|---|---|
| `/reports/finance/cash-flow/financing` | console-log-onclick |
| `/reports/finance/cash-flow/investing` | console-log-onclick |
| `/reports/finance/cash-flow/operating` | console-log-onclick |
| `/reports/quality/dashboard` | mock-data; not-implemented; console-log-onclick |
| `/reports/quality/inspections` | mock-data; not-implemented; console-log-onclick |

## `procurement` — 4 partially-wired pages

| Route | Issues |
|---|---|
| `/procurement/contracts` | TODO(x4) |
| `/procurement/grn` | mock-data; TODO(x7) |
| `/procurement/purchase-requisition` | wired-via-delegation; mock-data; console-log-stub |
| `/procurement/rfq-rfp` | wired-via-delegation; mock-data; TODO(x1) |

## `cpq` — 2 partially-wired pages

| Route | Issues |
|---|---|
| `/cpq/integration/cad` | coming-soon; alert-onclick |
| `/cpq/integration/ecommerce` | coming-soon; alert-onclick |

## `crm` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/crm/customers/portal` | empty-onclick |

## `hr` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/hr/leave/balance/my` | mock-data; console-log-onclick |

## `installation` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/installation/tool-prep` | empty-onclick |

## `rfq` — 1 partially-wired pages

| Route | Issues |
|---|---|
| `/rfq/view/[id]` | mock-data; coming-soon; alert-onclick |

