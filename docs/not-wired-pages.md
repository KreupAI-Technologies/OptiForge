# Not-Wired Pages Report

_Regenerated: 2026-07-08 (branch `main`, commit `6660ba44`)._
_Detector: import-following (each `page.tsx` is scanned together with everything it imports, transitively, up to 2 hops). Same classifier as [`wiring-audit-2026-07-08.md`](./wiring-audit-2026-07-08.md) — all three docs agree on totals._

> **RESOLVED on branch `feat/wire-67-not-wired-pages` (2026-07-08).** All 67 pages below were wired full-stack (Prisma read-side models where net-new backend was required, NestJS endpoints, frontend service methods, loading/error/empty states). Both build gates green: backend `prisma generate && nest build` (exit 0) and frontend `tsc --noEmit` (0 errors).
>
> Key finding: **most of the 67 were already wired 3+ hops deep** (`page.tsx` → `Xxx` re-export → real component under `src/components/`), which the 2-hop detector missed — their only gap was a missing visible loading/error/empty state. Net-new backend was created only for: `advanced-features/ai-insights` + `ocr` (AdvancedFeaturesModule), `support/onboarding` (SupportOnboardingTask), `documentation` (DocumentationModule/doc_articles). One page is intentionally static: `settings/form-ux-demo` and `design-system` (internal component/UX galleries with no domain data).
>
> **DB applied (2026-07-08):** all 5 orphan SQL files applied to the live DB via `npm run db:manual`; `db:manual:status` is clean. Seed rows verified (ai_insights=6, ocr_documents=6, doc_articles=8, support_onboarding_tasks=6, support_faqs=6). See memory `wire-67-branch`.

**Total not-wired pages: 67** — all resolved (see note above)
**(Total scanned: 1671 · NOT_WIRED: 67 · PARTIAL: 391 · FULL: 1208 · DEPRECATED: 5)**

## Issue tags used

- `no-service-import` — nothing in the tree imports from `@/services` or `@/lib/api-client`
- `no-api-call` — no `await service.*`, `fetch`, `axios`, `useQuery`, `useMutation`, or `useSWR` anywhere in the tree
- `mock-data` — tree declares `MOCK_*` / `mockData` / `dummyData` constants (hardcoded UI)
- `TODO(xN)` — tree contains N `// TODO`, `// FIXME`, or `// HACK` markers
- `coming-soon` / `not-implemented` / `placeholder-feature` — matching literal in tree
- `empty-onclick` / `console-log-onclick` / `alert-onclick` — stub button handlers

---

## Summary by module

| Module | Not-wired pages |
|---|---|
| finance | 22 |
| crm | 9 |
| common-masters | 6 |
| hr | 6 |
| advanced-features | 3 |
| after-sales-service | 2 |
| production | 2 |
| projects | 2 |
| settings | 2 |
| support | 2 |
| workflow | 2 |
| collaboration | 1 |
| compliance | 1 |
| design-system | 1 |
| documentation | 1 |
| help | 1 |
| it-admin | 1 |
| portal | 1 |
| procurement | 1 |
| reports | 1 |

---

## `finance` — 22 not-wired pages

| Route | Issues |
|---|---|
| `/finance/accounts-payable` | no-service-import; no-api-call |
| `/finance/accounts-receivable` | no-service-import; no-api-call |
| `/finance/analytics` | no-service-import; no-api-call |
| `/finance/automation` | no-service-import; no-api-call |
| `/finance/bank-reconciliation` | no-service-import; no-api-call |
| `/finance/budget` | no-service-import; no-api-call |
| `/finance/budgeting` | no-service-import; no-api-call |
| `/finance/cash-flow` | no-service-import; no-api-call |
| `/finance/consolidation` | no-service-import; no-api-call |
| `/finance/controls` | no-service-import; no-api-call |
| `/finance/cost-centers` | no-service-import; no-api-call |
| `/finance/credit` | no-service-import; no-api-call |
| `/finance/currency` | no-service-import; no-api-call |
| `/finance/general-ledger` | no-service-import; no-api-call |
| `/finance/integration` | no-service-import; no-api-call |
| `/finance/investments` | no-service-import; no-api-call |
| `/finance/multi-currency` | no-service-import; no-api-call |
| `/finance/period-operations` | no-service-import; no-api-call |
| `/finance/periods` | no-service-import; no-api-call |
| `/finance/reporting` | no-service-import; no-api-call |
| `/finance/reports` | no-service-import; no-api-call |
| `/finance/tax` | no-service-import; no-api-call |

## `crm` — 9 not-wired pages

| Route | Issues |
|---|---|
| `/crm/advanced-features` | no-service-import; no-api-call |
| `/crm/advanced-features/accounts` | no-service-import; no-api-call |
| `/crm/advanced-features/activity` | no-service-import; no-api-call |
| `/crm/advanced-features/automation` | no-service-import; no-api-call |
| `/crm/advanced-features/collaboration` | no-service-import; no-api-call |
| `/crm/advanced-features/customer360` | no-service-import; no-api-call |
| `/crm/advanced-features/lead-scoring` | no-service-import; no-api-call |
| `/crm/advanced-features/pipeline` | no-service-import; no-api-call |
| `/crm/leads/edit` | no-service-import; no-api-call |

## `common-masters` — 6 not-wired pages

| Route | Issues |
|---|---|
| `/common-masters` | no-service-import; no-api-call |
| `/common-masters/batch-lot-master` | no-service-import |
| `/common-masters/quality-parameter-master` | no-service-import |
| `/common-masters/routing-master` | no-service-import |
| `/common-masters/skill-master` | no-service-import |
| `/common-masters/work-center-master` | no-service-import |

## `hr` — 6 not-wired pages

| Route | Issues |
|---|---|
| `/hr/advanced-features` | no-service-import; no-api-call |
| `/hr/leave/policies` | no-service-import; no-api-call |
| `/hr/performance/goals/alignment` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/goals/tracking` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/reports/trends` | no-service-import; no-api-call; coming-soon |
| `/hr/performance/reviews/rating` | no-service-import; no-api-call; coming-soon |

## `advanced-features` — 3 not-wired pages

| Route | Issues |
|---|---|
| `/advanced-features` | no-service-import; no-api-call |
| `/advanced-features/ai-insights` | no-service-import; no-api-call |
| `/advanced-features/ocr` | no-service-import; no-api-call |

## `after-sales-service` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/after-sales-service/advanced-features` | no-service-import; no-api-call |
| `/after-sales-service/field-service/mobile` | no-service-import; no-api-call; coming-soon |

## `production` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/production/advanced-features` | no-service-import; no-api-call |
| `/production/settings` | no-service-import; no-api-call |

## `projects` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/projects/advanced-features` | no-service-import; no-api-call |
| `/projects/planning/create` | no-service-import; no-api-call |

## `settings` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/settings` | no-service-import; no-api-call |
| `/settings/form-ux-demo` | no-service-import; no-api-call |

## `support` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/support/advanced-features` | no-service-import; no-api-call |
| `/support/onboarding` | no-service-import; no-api-call |

## `workflow` — 2 not-wired pages

| Route | Issues |
|---|---|
| `/workflow/automation/advanced-features` | no-service-import; no-api-call |
| `/workflow/designer` | no-service-import; no-api-call; coming-soon |

## `collaboration` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/collaboration` | no-service-import; no-api-call |

## `compliance` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/compliance` | no-service-import; no-api-call |

## `design-system` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/design-system` | no-service-import; no-api-call |

## `documentation` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/documentation` | no-service-import; no-api-call |

## `help` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/help` | no-service-import; no-api-call |

## `it-admin` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/it-admin/system/scalability` | no-service-import; no-api-call |

## `portal` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/portal` | no-service-import; no-api-call |

## `procurement` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/procurement/advanced-features` | no-service-import; no-api-call; coming-soon |

## `reports` — 1 not-wired pages

| Route | Issues |
|---|---|
| `/reports/advanced-features` | no-service-import; no-api-call |

---

## Deprecated folders (Next.js private `_`-prefixed, not routable)

| Route | Issues |
|---|---|
| `/_finance_deprecated` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/currency/gain-loss` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/payables/aging` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/receivables/aging` | deprecated-folder (Next.js private) |
| `/_finance_deprecated/reports` | deprecated-folder (Next.js private) |

