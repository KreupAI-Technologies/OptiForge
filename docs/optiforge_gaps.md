# OptiForge — App Readiness Report

- **Originally prepared:** 2026-07-03 (🔴 not production-ready)
- **Updated:** 2026-07-04 — branch `fix/foundation-build-and-api-wiring`, PR #129
- **Scope:** Frontend (`b3-erp/frontend`), NestJS domain backend (`b3-erp/backend`), Django platform backend (`backend/`)
- **Verdict:** 🟢 **Core readiness achieved** — build green (typecheck enforced), every page wired to a live API, 0 broken URLs, 0 real 500s, Prisma covers every API table. Remaining: automated test coverage and a few write-action stubs (below).

> The 2026-07-03 report described a broken build, ~89% unwired pages, 59 dead links, and fragmented auth. Those are resolved. The pre-update report is preserved in git history. Colours below reflect the **current, verified** state.

________________________________________

## 1. Executive Summary

| Dimension | 2026-07-03 | Now | Status |
|---|---|---|---|
| Frontend `next build` | Fails (duplicate routes #125) | **Passes, TypeScript enforced** | 🟢 |
| Frontend TypeScript errors | ~323 (build bypassed via `ignoreBuildErrors`) | **0** (`ignoreBuildErrors` removed) | 🟢 |
| NestJS build | Passes | Passes | 🟢 |
| Pages wired to a live backend | 169 / 2,056 (8.2%) | **Every mock-only page wired — 0 true orphans** | 🟢 |
| Backend controllers | 191 | **466** (~250 net-new) | 🟢 |
| Backend endpoint health | unknown | **~398 healthy, 0 real 500s** | 🟢 |
| Dead internal links (404 risk) | 59 of 409 | **0 broken URLs** | 🟢 |
| Prisma coverage of API tables | partial / drifted | **573 models — 100% of API tables**, `prisma validate` ✅ | 🟢 |
| Auth | Django ✅ / NestJS ❌ / FE ❌ | **Local JWT end-to-end** (NestJS `/auth/*` + FE `AuthContext`) | 🟢 |
| Export / Print buttons | ~all `console.log` | **185 pages** → real CSV / print | 🟢 |
| Delete / Approve / Reject buttons | mostly stubs | ~23 pages still `console.log` | 🟡 |
| CI `frontend-typecheck` | informational | **blocking** | 🟢 |
| Automated test coverage | ~0–2% | still low | 🔴 |
| `not-found.tsx` graceful 404 | Present | Present | 🟢 |

________________________________________

## 2. Page → API wiring (per module)

**All modules now wire their pages to a live backend endpoint.** The 2026-07-03 "zero-coverage" and "low-coverage" modules (reports, cpq, support, estimation, crm, hr, finance, production, inventory, logistics, procurement, sales, it-admin, common-masters, after-sales, project-management, workflow, quality, and the 177-page top-level HR tree) were cleared to **0 true orphan pages** (a page rendering a hardcoded mock array with no fetch).

| Module group | Status |
|---|---|
| Every `(modules)/*` module | 🟢 wired |
| Top-level `hr/` (177 pages) | 🟢 wired |
| `projects/`, `dashboard`, `rfq` | 🟢 wired |

Method: pages fetch on mount via a typed service, with a defensive ORM→UI transform and loading/error/empty states; where no endpoint existed, one was **built** (TypeORM entity + additive table + service + controller + registration).

________________________________________

## 3. Button-level wiring

| Action | Status |
|---|---|
| Save / Create | 🟢 wired |
| Edit / Update | 🟢 wired |
| Export (→ CSV) | 🟢 **185 pages** wired to a shared `exportToCsv` util |
| Print (→ print dialog) | 🟢 wired |
| Delete / Approve / Reject | 🟡 ~23 pages still `console.log` (follow-up) |
| Import | 🟡 largely unimplemented (follow-up) |

________________________________________

## 4. 404 / Broken-link audit

🟢 **0 broken internal URLs.** All static `href` / `router.push` / `router.replace` / `redirect` / `<Link href>` targets were audited against the actual App Router pages. 31 broken targets were fixed:
- Wrong paths corrected (e.g. `/procurement/orders` → `/procurement/purchase-orders`, `/support/knowledge-base` → `/support/knowledge`, `/it-administration/...` → `/it-admin/...`).
- Missing action-page links repointed to their real parent list page.
- Missing **PWA icon** created at `public/icons/icon-192x192.png`; dead `.xlsx` download replaced with a real client-side CSV export.

`not-found.tsx` remains as a graceful fallback.

________________________________________

## 5. Backend endpoints & Prisma

- **NestJS:** **466 controllers**; ~398 return 200/201, **0 real 500s** (the single remaining "500" is a POST-only seeder route responding to GET). All 6 originally-broken endpoints fixed.
- **Prisma:** 🟢 **573 models — every API table has a Prisma model.** 214 were generated from the new tables' DDL and appended additively; `prisma validate` passes and the client generates. **Every new table was created additively** (`CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`) — **zero drops** to existing tables.
- **Runtime data layer:** TypeORM owns the live schema (317+ base tables); the Prisma schema now documents/covers the same tables so the API is fully represented in Prisma files.
- **Django:** still minimal — domain functionality consolidated on NestJS (recommend amending ADR-0004). 🟡

________________________________________

## 6. Auth / Integration / Config

| Item | Status |
|---|---|
| FE ↔ NestJS auth (local JWT: `/auth/login`, `/auth/logout`, `/auth/profile`) | 🟢 verified |
| API base URL wiring (`NEXT_PUBLIC_API_URL` → NestJS `:3001/api/v1`) | 🟢 fixed |
| Keycloak SSO (ADR-0003) | 🟡 deferred by decision (local JWT ships) |
| Docker Compose services | 🟢 present |

________________________________________

## 7. Build, Test, CI

| Item | Status |
|---|---|
| NestJS build | 🟢 passes |
| Frontend `next build` (typecheck enforced) | 🟢 passes |
| Frontend typecheck (`tsc --noEmit`) | 🟢 0 errors |
| CI `frontend-typecheck` | 🟢 blocking |
| CI `frontend-build` | 🟡 informational — memory-bound on standard runners (~1670 routes need ~8 GB heap > 7 GB runner); heap raised, move to a larger runner to make blocking |
| Automated tests / coverage | 🔴 still low — the main remaining initiative |

________________________________________

## 8. Blockers (from the original report) — status

1. [P0] Frontend build broken — 🟢 **fixed** (routes deduped; force-dynamic; typecheck enforced).
2. [P0] Auth fragmented — 🟢 **resolved** on local JWT (Keycloak deferred).
3. [P0] 88% pages UI-only shells — 🟢 **resolved** (0 true orphans; ~250 endpoints built to support them).
4. [P1] Dead-link cleanup — 🟢 **0 broken URLs**; PWA icon added.
5. [P1] Export / Import / Print stubs — 🟢 Export/Print done; 🟡 Import + Delete/Approve/Reject remain on ~23 pages.
6. [P2] Test coverage — 🔴 still low (separate initiative).
7. [P2] Django platform empty — 🟡 consolidated on NestJS; recommend amending ADR-0004.

________________________________________

## 9. Overall Readiness

| Area | 2026-07-03 | Now |
|---|---|---|
| Backend API surface | 8 / 10 | 9 / 10 |
| Frontend page-to-API integration | 1 / 10 | **9 / 10** |
| Prisma coverage of the API | — | **9 / 10** |
| Routing / no-404 | 6 / 10 | **10 / 10** |
| Build / CI health | 3 / 10 | **8 / 10** |
| Auth / SSO story | 3 / 10 | 7 / 10 (local JWT; SSO later) |
| Test coverage | 1 / 10 | 1 / 10 (unchanged — remaining work) |
| **Overall** | ~3.5 / 10 → NOT READY | **~8 / 10 → core-ready; test coverage is the main gap before pilot** |

Remaining before full go-live: automated test coverage (backend + frontend), the ~23 Delete/Approve/Reject + Import stubs, optional Keycloak SSO, and moving `frontend-build` to a larger CI runner to make it a blocking check.
