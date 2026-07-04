# ADR-0004: Dual-backend architecture — OptiForge (Django) + b3-erp (NestJS)

*Status: Accepted — domain functionality consolidated on NestJS (updated 2026-07-04; see addendum)*
*Date: 2026-04-24*
*Deciders: Bosco*

> **2026-07-04 addendum — Consolidation decision (accepted).**
> The domain application is consolidated on the **NestJS backend** (`b3-erp/backend`), which owns the live schema and now exposes ~466 controllers serving the entire feature-complete frontend. The Django `/backend/` layer was **not** built out; ADR-0003's Keycloak SSO is deferred and the shipping auth is **local JWT** validated by NestS + the Next.js `AuthContext`. The Prisma schema (`b3-erp/backend/prisma/schema.prisma`) now models **every** API table (573 models). This resolves the report's "[P2] Django platform empty" gap by choosing consolidation over dual-backend build-out. Django may still host platform concerns (tenancy/identity/audit) later, but that is out of scope for pilot. Q4/Q5 below are answered by this decision: no active porting between backends; the top-level `/frontend` scaffold has been removed.
*Related: [ADR-0001](./0001-five-layer-architecture.md), [ADR-0002](./0002-modular-monolith.md), [PRD](../prds/optiforge-layered-multi-industry-architecture.md), [`docs/architecture.md`](../architecture.md)*

## Context

The repository hosts **two backends running concurrently**, but neither the PRD nor existing ADRs acknowledge this:

| Backend | Stack | Location | Recent activity | Test coverage |
|---|---|---|---|---|
| **OptiForge** | Django 4.2 + DRF + Postgres 15 | `/backend/` | 21 commits in 6 months; all `feat(phase-N)` land here | 14 pytest modules across 7 categories (canary, contract, performance, dr_drill, second_pack, acero, scaffolded_mode) |
| **b3-erp** | NestJS 10 + TypeORM + Postgres | `/b3-erp/backend/` | **165 commits in 6 months**; last touch 2026-04-23 | 8 Jest unit specs |

There are also two frontends:

| Frontend | Stack | Location | Size |
|---|---|---|---|
| **b3-erp/frontend** | Next.js 14 + TypeScript + shadcn | `/b3-erp/frontend/` | **2,389 `.tsx` files, 1,719 pages** — the real, feature-complete UI |
| **top-level /frontend** | Next.js | `/frontend/` | 6 `.tsx` files — appears to be a scaffold |

The b3-erp frontend's API clients call **both** backends:

- `b3-erp/frontend/src/context/AuthContext.tsx:32` — `http://localhost:8000/api/v1` (Django)
- `b3-erp/frontend/src/lib/api-client.ts:4` — `http://localhost:8000/api/v1` (Django)
- `b3-erp/frontend/src/services/loan.service.ts:6` — `http://localhost:3001` (NestJS)
- `b3-erp/frontend/src/services/bonus.service.ts:6` — `http://localhost:3001` (NestJS)
- `b3-erp/frontend/src/app/(modules)/procurement/approvals/page.tsx:89` — `http://localhost:4000` (unknown)

Documentation that currently misrepresents this reality:

- [`CLAUDE.md`](../../CLAUDE.md) describes only NestJS + TypeORM and points at `b3-erp/` as the monorepo. It omits Django entirely.
- [`README.md`](../../README.md) describes only Django + DRF + Celery. It omits the NestJS backend entirely, and its status table shows Phases 1–5 "Not started" while git log confirms Phases 2–6 have merged.
- [`docs/architecture.md`](../architecture.md), the PRD, ADR-0001, and ADR-0002 all describe OptiForge (Django) as if it were the only backend.

The dual-backend reality has not been decided — it has *accumulated*. A new developer or AI agent reading any one source of documentation will form a wrong mental model of the system.

This ADR is the **first attempt to write down what is true** and propose a single coherent interpretation. It is deliberately marked `Proposed` because only the project owners can ratify the intended end state.

## Decision

Accept the following for v1, pending owner ratification of the intended end state:

1. **OptiForge (Django, `/backend/`) is the platform backend of record.** It owns: tenancy, identity, audit, extensions, events, workflow, notifications, reporting, documents, integration, api_gateway, observability, localisation, and the layered Core/Modes/Compliance/Packs stack described in ADR-0001 and PRD. All `feat(phase-N)` work continues to land here.

2. **b3-erp (NestJS, `/b3-erp/backend/`) is the domain services backend for the existing MACBIS feature set.** It owns the 29 application modules that currently power `b3-erp/frontend`: HR (statutory, bonuses, loans, skills, training), CRM, sales, procurement, inventory, logistics, finance, production, project-management, quality, approvals, notifications, workflow, accounts, after-sales-service, cms, common-masters, CPQ, core (items/categories/UOM), estimation, IT-admin, proposals, reports, support.

3. **`b3-erp/frontend` (Next.js, `/b3-erp/frontend/`) is the single frontend of record** for v1. It routes to whichever backend owns the domain. The top-level `/frontend/` is a scaffold only and is NOT a live UI.

4. **The routing contract** between frontend and the two backends is explicit and documented:
   - Frontend API clients use **exactly two base URLs**, sourced from environment variables:
     - `NEXT_PUBLIC_PLATFORM_API_URL` → OptiForge (Django), default `http://localhost:8000/api/v1`
     - `NEXT_PUBLIC_DOMAIN_API_URL` → b3-erp (NestJS), default `http://localhost:3001`
   - Any hardcoded URL or third port (e.g., `localhost:4000`) is a bug and gets removed.

5. **Both backends share one Postgres cluster but live in separate schemas** (`optiforge.*` and `b3_erp.*`) in the same physical database for v1. This makes cross-backend reads possible via read-only views without requiring a distributed transaction coordinator. Writes remain strictly single-backend.

6. **Auth is federated via OpenID Connect** (per ADR-0003, OIDC Provider: Keycloak). Both backends validate JWTs issued by Keycloak; neither issues its own session tokens in v1. (This is already the direction in ADR-0003; this ADR merely confirms it applies to both backends.)

7. **The long-term direction is not committed by this ADR.** Options — consolidate onto Django, consolidate onto NestJS, split into services, or keep the current split — remain open. A follow-up ADR will decide once the v1 ship has settled.

## Alternatives considered

### Alternative A — Document reality and propose a coherent routing/data contract (**CHOSEN**)

Write this ADR. Clarify which backend owns which domains. Fix the docs so new developers and AI tools get the right mental model. Defer the "which backend wins long-term" decision.

**Trade-off.** Preserves all existing work. Unblocks onboarding and the remaining backend-improvement milestone (pagination, soft-delete, docker-compose, CI) which would otherwise have to solve the same problem twice without coordination. Does not force a premature rewrite decision.

### Alternative B — Consolidate on Django immediately, archive NestJS

Declare OptiForge (Django) the only backend. Port the 29 NestJS modules over. Archive `b3-erp/backend/`. Update the frontend to call only Django.

**Trade-off.** Cleanest end state, but ignores reality: NestJS has 165 commits in 6 months and is *more actively maintained than Django by volume*. Porting 29 modules is a multi-month effort that would stop all feature work. **Rejected** as premature and disruptive.

### Alternative C — Consolidate on NestJS, archive Django

Declare b3-erp (NestJS) the only backend. Port OptiForge's platform services (tenancy RLS, import-linter seam, extension framework, compliance hooks) to NestJS.

**Trade-off.** Would throw away the load-bearing architectural work of Phases 1–6 (ADR-0001 seam enforcement, extension registry, pack loader, compliance scaffolding, audit immutability). **Rejected** — the layered architecture is not easily re-expressed in TypeORM, and the effort would exceed Alternative B's.

### Alternative D — Split on clean architectural lines: Django for platform+compliance, NestJS for domain

Very similar to the chosen option, but formalise the split as permanent and forbid domain logic from ever going into Django (or platform from ever going into NestJS).

**Trade-off.** Clean boundary, but hard to enforce without a runtime gateway. Some domains (e.g., Sales CPQ, Procurement) already have implementations in both and would need to pick one. Deferred for a future ADR.

## Consequences

### Easier

- Documentation becomes truthful. New developers know what they're looking at.
- Remaining backend-improvement work (#113 soft-delete, #114 pagination, #115 docker-compose, #116 CI) can be scoped consistently across **both** backends with shared semantics, not handled twice in isolation.
- Frontend API routing becomes standard (two env vars, two base URLs).
- AI agents reading the repo stop recommending "archive b3-erp" based on partial evidence.

### Harder

- Every backend-level concern (auth, pagination, audit columns, error format, observability hook) now has to be implemented twice and kept in lockstep. An ADR or shared contract is required every time.
- Cross-backend transactions remain impossible. Any flow that spans domains in both backends must use eventual consistency (events) or be restructured to live in one backend.
- Schema migrations run in two toolchains: Django `manage.py migrate` and TypeORM `migration:run`. Deployment order matters.
- Two runtimes to patch, two dependency trees to audit, two sets of CVEs to track.

### Obligations accepted

- **Shared contracts are written down, not implicit.** Every pattern that must be consistent across backends (audit columns, soft-delete semantics, pagination defaults, error envelope, JWT claims) gets a single ADR and is implemented identically in both.
- **No new domain in Django without an ADR justifying it.** The default home for new domain features is b3-erp/NestJS; the default home for new platform features is OptiForge/Django.
- **The frontend has exactly two API base URLs.** Any service file introducing a third gets rejected in review.
- **Both backends run under `optiforge-ci.yml` or a successor unified workflow.** The existing `ci.yml` (NestJS) and `optiforge-ci.yml` (Django) stay independent for v1 but both are `required` on PRs that touch their paths.

### No-longer-possible (in v1)

- A single source of truth for domain data across all modules. (It isn't — some data lives in Django tables, some in NestJS tables.)
- A single ORM-level transaction spanning HR (NestJS) and audit records (Django). Use the platform event bus (`optiforge.platform.events`) for cross-backend effects.
- Simple "delete all data for a tenant" — must be run twice, once per backend, in the correct order.

### When to revisit

- Cross-backend eventual consistency causes production incidents or customer-visible data staleness.
- One backend's test coverage remains below 50% of the other for two consecutive quarters — suggests the neglected backend is actually dead.
- A major feature naturally straddles both backends and the coordination overhead dominates the implementation time — time to pick one.
- The v1 deployment is cut and the team has bandwidth to consolidate.

## Open questions (require owner input before `Status: Accepted`)

These are **not** blockers for the rest of the backend-improvement milestone — the milestone proceeds under this Proposed ADR. They ARE blockers before this ADR is marked `Accepted`:

1. **Q1: Is the long-term intent to consolidate, or to keep the split?** Answer drives whether we invest in a unified API gateway in front of both backends.
2. **Q2: Do Django and NestJS share a physical Postgres cluster (proposed §5) or separate databases?** Current code ambiguous.
3. **Q3: Which backend owns the `tenant_id` authority?** OptiForge has `Tenant` model with status transitions; does NestJS read from it or maintain its own copy?
4. **Q4: Is there a plan to port any NestJS module to Django (or vice versa)?** Affects whether we invest in new work on the "donor" side.
5. **Q5: Is the top-level `/frontend/` (6 .tsx files) salvageable or should it be removed?** Its package.json scripts in root `package.json` point at `b3-erp/`, so root `npm run dev` already uses b3-erp/frontend — the top-level /frontend is probably abandonable.

## References

- [`CLAUDE.md`](../../CLAUDE.md) and [`README.md`](../../README.md) — currently misleading; will be rewritten under backend-improvement issue #112.
- Backend-improvement milestone: https://github.com/KreupAI-Technologies/OptiForge/milestone/2
- Originating review: conversational A-Z review conducted 2026-04-24.
