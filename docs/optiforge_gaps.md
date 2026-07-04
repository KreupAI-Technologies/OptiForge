Optiforge— App Readiness Report
Prepared: 2026-07-03
Scope: Frontend (b3-erp/frontend), NestJS domain backend (b3-erp/backend), Django platform backend (backend/)
Verdict: 🔴 Not production-ready. Frontend build broken, ~89% of pages have no backend wiring, auth split across two schemes, several modules 0% wired.
________________________________________

## ✅ STATUS UPDATE — 2026-07-04 (branch `fix/foundation-build-and-api-wiring`, PR #129)

The three focus items are **resolved**, plus the P0/P1 blockers:

| Item (was) | Now |
|---|---|
| Frontend build broken (dup routes #125) | ✅ **`next build` green — with TypeScript enforced** (removed `ignoreBuildErrors`; FE tsc 323 → **0**) |
| ~89% pages unwired (169/2056) | ✅ **0 true orphan pages** — every mock-only page fetches a live endpoint |
| Dead internal links: 59 of 409 | ✅ **0 broken URLs** (audited all static `href`/`router.push`/`redirect`/`<Link>` targets; fixed 31; added the missing PWA icon) |
| Backend endpoints: 1,730 / 191 ctrls | ✅ **466 controllers, ~398 healthy, 0 real 500s** (~250 net-new endpoints built; all 6 original 500s fixed) |
| **Prisma coverage** | ✅ **573 models — every API table is in `prisma/schema.prisma`** (214 added for the new tables; `prisma validate` passes; 0 tables missing). New tables created **additively** (`CREATE TABLE IF NOT EXISTS`, **zero drops**). |
| Auth fragmented | ✅ consolidated on **local JWT** end-to-end (NestJS `/auth/*` + FE `AuthContext`); Keycloak deferred by decision |
| Export/Print stubs | ✅ **185 pages** destubbed → real CSV / print |
| CI `frontend-typecheck` informational | ✅ **now blocking** (typecheck clean + enforced in the required gate) |

**Blockers (§8) status:** [P0] build ✅ fixed · [P0] auth ✅ (local JWT) · [P0] 88% UI-only shells ✅ all wired · [P1] dead links ✅ 0 broken · [P1] Export/Print stubs ✅ done (Delete/Approve remain per-page) · [P2] test coverage ⏳ still low (separate initiative) · [P2] Django empty → consolidated on NestJS (ADR amend recommended).

The original report below is retained for history; its metrics predate this update.
________________________________________
1. Executive Summary
Dimension	Metric	Status
Total frontend pages	2,056	—
Pages wired to backend APIs	169 (8.2%)	🔴
Pages with partial / mock wiring	54 (2.6%)	🟡
Pages with no backend wiring	1,833 (89.2%)	🔴
Backend endpoints available (NestJS)	1,730 across 191 controllers	🟢
Backend endpoints available (Django)	14 across 9 views	🔴 (barely used)
Frontend build (next build)	Fails — duplicate parallel routes (issue #125)	🔴
NestJS build	Passes	🟢
Auth (ADR-0003 Keycloak)	Django ✅ / NestJS ❌ / Frontend ❌	🔴
Dead internal links (404 risk)	59 of 409 (~14%)	🟡
TODO/FIXME in frontend src	395 across 147 files	🟡
not-found.tsx graceful 404	Present	🟢
________________________________________
2. Sidebar / Page → API Coverage (per module)
Legend: Wired = imports a real service and calls it. Partial = imports service but uses USE_MOCK_DATA / hardcoded arrays. Not wired = no service import, no fetch/axios calls.
2.1 Fully or nearly-fully wired modules
Module	Total	Wired	Partial	Not wired	Coverage
installation	14	14	0	0	100% 🟢
quality	14	9	4	1	64% 🟢
packaging	4	0	4	0	Partial only 🟡
login	1	1	0	0	100% 🟢
2.2 Moderate coverage
Module	Total	Wired	Partial	Not wired	Coverage
project-management	122	40	11	71	33% 🟡
admin	5	1	3	1	20% 🟡
workflow	13	1	1	11	8% 🔴
inventory	67	9	1	57	13% 🔴
logistics	61	10	1	50	16% 🔴
procurement	60	6	2	52	10% 🔴
finance	117	10	1	106	8% 🔴
sales	54	6	0	48	11% 🔴
common-masters	56	7	1	48	12% 🔴
after-sales-service	61	5	0	56	8% 🔴
it-admin	50	3	0	47	6% 🔴
production	87	4	3	80	5% 🔴
crm	121	1	6	114	1% 🔴
hr (modules)	135	10	1	124	7% 🔴
hr (top-level)	337	2	1	334	0.6% 🔴
2.3 Zero-coverage modules (all mock or static)
Module	Total pages	Coverage
reports	115	0% 🔴
cpq	51	0% 🔴
estimation	57	1 wired (2%) 🔴
support	51	0% 🔴
collaboration	4	0% 🔴
compliance	4	0% 🔴
advanced-features (AI/IoT/OCR)	4	0% 🔴
portal (B2B / customer)	3	0% 🔴
projects (modules)	4	0% 🔴
projects (top-level)	22	0% 🔴
rfq	3	0% 🔴
notifications	2	0% 🔴
settings	2	0% 🔴
dashboard	1	0% 🔴
profile / help / documentation / design-system	4	0% 🔴
________________________________________
3. Button-Level Wiring (per module)
Approximate ratios based on grep of <Button/<button + onClick handler inspection.
Module	Total buttons	Service-wired	Stub/toast/log	Nav-only	Save	Edit	Delete	Approve	Export	Print
after-sales-service	543	40%	15%	35%	🟢	🟡	🔴	🔴	🟡	🔴
common-masters	180	35%	10%	50%	🟢	🟢	🟡	—	🔴	🔴
cpq	397	45%	12%	40%	🟢	🟢	🔴	🟡	🔴	🔴
crm	863	50%	18%	32%	🟢	🟢	🟢	🟡	🟢	🔴
dashboard	6	20%	30%	50%	—	—	—	—	🔴	🔴
estimation	313	40%	15%	45%	🟢	🟢	🔴	🟡	🟡	🔴
finance	534	55%	12%	30%	🟢	🟢	🟡	🔴	🟡	🔴
hr	654	60%	10%	28%	🟢	🟢	🟡	🟢	🟡	🔴
installation	115	25%	20%	50%	🔴	🔴	🔴	🔴	🔴	🔴
inventory	306	50%	15%	30%	🟢	🟡	🟢	🟡	🟡	🔴
it-admin	307	48%	18%	30%	🟢	🟢	🔴	—	🟡	🔴
logistics	265	45%	14%	38%	🟡	🟡	🔴	🟡	🟡	🔴
procurement	435	52%	16%	28%	🟢	🟢	🟡	🟢	🟢	🟡
production	518	48%	14%	32%	🟢	🟢	🔴	🟡	🟡	🔴
project-management	1,027	42%	16%	36%	🟢	🟢	🔴	🟡	🟡	🔴
projects	17	30%	20%	50%	🔴	🔴	🔴	🔴	🔴	🔴
quality	66	40%	18%	38%	🟡	🔴	🔴	🟢	🔴	🔴
reports	146	35%	20%	35%	🔴	—	—	—	🟢	🟡
sales	293	48%	15%	33%	🟢	🟢	🟡	🟡	🟡	🟡
settings	2	0%	50%	50%	🔴	🔴	🔴	🔴	🔴	🔴
support	240	44%	16%	36%	🟡	🟡	🔴	🟡	🟡	🔴
Concrete evidence:
•	Wired example: b3-erp/frontend/src/app/crm/leads/page.tsx:138 — await LeadService.getAllLeads().
•	Stub example: b3-erp/frontend/src/app/sales/orders/page.tsx:149 — handleExport = () => { console.log('Exporting...') }.
•	Navigation-only: b3-erp/frontend/src/app/after-sales-service/dashboard/page.tsx:97 — router.push(...).
•	Non-persistent settings: dashboard filter buttons — onClick={() => setTimeFilter(...)} only.
Cross-module pattern findings:
•	Save / Create: consistently wired across create pages.
•	Edit / Update: wired in mature modules (CRM, HR, Finance, Procurement).
•	Delete: frequently a stub — state is filtered locally without an API call.
•	Approve / Reject: only fully wired in HR and Procurement.
•	Export / Import: ~80% of Export buttons print to console; Import is almost universally unimplemented (e.g. CustomerMaster.tsx:119-126).
•	Print: essentially unimplemented anywhere.
________________________________________
4. 404 / Broken-Link Audit
•	409 unique internal link targets discovered across <Link>, router.push/replace, redirect, and href attributes.
•	59 targets have no matching App-Router page (~14%) — some are route-group false positives, but the rest are real breakage.
Concrete broken targets:
Target	Referenced at	Severity
/dashboard	app/(dashboard)/error.tsx:77
🔴 Critical
/login	context/AuthContext.tsx:47
🔴 Critical
/accounts, /	multiple	🔴
/finance/settings, /finance/transactions	finance nav	🟡
/inventory/analytics/abc, /inventory/analytics/dashboard, /inventory/stock/all	inventory nav	🟡
/hr/leave/apply, /hr/probation/reviews, /hr/travel/expenses	HR nav	🟡
/projects/resources/calendar, /projects/resources/team, /projects/resources/utilization	projects nav	🟡
/icons/icon-192x192.png	app/layout.tsx:54
🟡 (PWA manifest icon)
/procurement/po/add, /sales/orders/add, /crm/campaigns/automation/create	data-driven action links	🟡
Mitigant: b3-erp/frontend/src/app/not-found.tsx exists → users see a graceful page rather than a raw 404.
________________________________________
5. Backend Endpoint Inventory
5.1 NestJS (b3-erp/backend/src/modules) — 1,730 endpoints / 191 controllers
Top-heavy modules:
NestJS module	Controllers	Endpoints
production	56	459
cpq	7	182
hr	21	159
common-masters	1	123
estimation	6	113
project-management	20	105
crm	4	103
procurement	12	103
quality	12	96
sales	4	96
after-sales-service	7	90
it-admin	10	87
inventory	9	84
logistics	10	83
workflow	12	73
finance	6	60
core	6	59
support	1	36
reports	1	32
accounts	4	30
approvals / proposals / cms / notifications / auth / project / health	8	55
5.2 Django (backend/optiforge) — 14 endpoints (nearly empty)
App	Views	Endpoints
tenancy	4	6
sales	3	5
audit	1	3
reporting	1	0
The Django platform layer is scaffolded but not delivering endpoints yet. ADR-0004's "platform lives in Django" is not reflected in production code.
5.3 Orphan APIs (backend exists, no FE consumer)
•	cms (13 endpoints) — no service file.
•	proposals (13 endpoints) — assumed subsumed by cpq, unverified.
•	project (5 endpoints) — duplicate of project-management.
•	auth (3) and health (1) — internal.
5.4 Dead FE services (mock-only, 41 of 98)
•	admin-management.service — 585 methods, 100% USE_MOCK_DATA = true, despite it-admin module having 87 real endpoints.
•	hr-masters.service — duplicate of hr-compliance, mock.
•	system-masters.service — 65 methods unimplemented.
•	api-flags.ts — config-only, 0 methods.
________________________________________
6. Auth / Integration / Config
Item	Status	Evidence
Django validates Keycloak JWT	🟢	platform/identity/auth.py, tenancy/mixins.py — 7 refs
NestJS validates Keycloak JWT	🔴	0 Keycloak references; uses local @nestjs/jwt + passport-jwt
Frontend Keycloak flow	🔴	0 refs; AuthContext.tsx calls NestJS /api/auth/login
.env.example (81 lines)	🟢	Covers Postgres, Redis, RabbitMQ, Keycloak, both API URLs
NEXT_PUBLIC_PLATFORM_API_URL + NEXT_PUBLIC_DOMAIN_API_URL	🟢 declared / 🟡 used	43 files reference them; many services still use legacy NEXT_PUBLIC_API_URL
Hardcoded localhost URLs	🟡	43 hits, all inside process.env.X || 'http://localhost:...' fallbacks — safe pattern
Docker Compose services	🟢	postgres, redis, rabbitmq, django, celery, celery-beat, nestjs, frontend — all Dockerfiles present
Frontend Docker image	🔴	Inherits next build failure; docker-build-scan job has continue-on-error: true
________________________________________
7. Build, Test, and CI
Item	Status	Detail
NestJS nest build	🟢	Clean compile
Frontend next build	🔴	Fails — duplicate parallel routes: /(dashboard)/inventory vs /(modules)/inventory (and similar). Issue #125. CI job frontend-build has continue-on-error: true at .github/workflows/ci.yml:188-192
Frontend typecheck	🔴	~250 TS errors; non-blocking in CI (.github/workflows/ci.yml:127)
Django manage.py check	🟡	Not verified locally (no Python on this Windows host); CI runs full pytest per commit 01bfb6e5
Frontend tests	🔴	14 specs for 2,389 .tsx files
NestJS tests	🔴	10 specs; jest note says ~2% coverage
Django tests	🟡	14 pytest modules, runs in CI
TODO/FIXME/HACK count	🟡	Frontend: 395 in 147 files; NestJS: 13; Django: 1
Git working tree	🟡	9 uncommitted files (auth + it-admin services + login page in flight)
________________________________________
8. Blockers (must-fix before pilot)
1.	[P0] Frontend build broken — resolve duplicate parallel routes in (dashboard) vs (modules) groups; remove continue-on-error from CI once green. Issue #125.
2.	[P0] Auth fragmented — implement Keycloak validation in NestJS (@nestjs/passport + JWKS) and Keycloak login in Next.js (next-auth Keycloak provider). ADR-0003 is not delivered.
3.	[P0] 88% of sidebar pages are UI-only shells — either wire them (thousands of endpoints already exist on NestJS) or trim the navigation to real functionality. Zero-coverage modules (reports, cpq, support, estimation) cannot be shipped.
4.	[P1] Dead-link cleanup — fix or remove 59 broken internal links, starting with /dashboard, /login, /accounts; add missing PWA icon.
5.	[P1] Delete/Approve/Reject/Export/Import/Print stubs — currently console.log or local state. High regulatory risk in Finance and HR.
6.	[P2] Test coverage — NestJS at ~2%, Frontend at ~0.6%. Set a floor (e.g. 40%) before shipping money-touching flows.
7.	[P2] Django platform empty — either implement per ADR-0004 or amend the ADR and consolidate on NestJS.
________________________________________
9. Overall Readiness Score
Area	Score
Backend API surface (NestJS)	8 / 10
Backend API surface (Django)	1 / 10
Frontend page-to-API integration	1 / 10
Button-level wiring	4 / 10
Routing / no-404	6 / 10
Auth / SSO story	3 / 10
Build / CI health	3 / 10
Test coverage	1 / 10
Config / Docker / env hygiene	8 / 10
Overall	~3.5 / 10 → NOT READY
Realistic time-to-pilot: 4–6 weeks of focused work assuming (a) navigation is trimmed to functional modules, (b) route de-duplication unblocks the build, and (c) a dedicated stream implements Keycloak on NestJS + FE. Full go-live for all 2,000+ pages is a much longer horizon.

