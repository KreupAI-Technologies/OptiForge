# ManufacturingOS — Claude Code Configuration

This project has Claude Code capabilities configured for AI-assisted development. **Read [`docs/architecture-dual-backend.md`](docs/architecture-dual-backend.md) before making changes** — the system has two backends, and routing work to the wrong one is a common onboarding mistake.

## Project Overview

**ManufacturingOS** is a full-stack ERP system for manufacturing operations, with a layered multi-industry architecture. The first customer is B3 MACBIS (kitchen equipment).

## Tech Stack (dual-backend)

The system runs **two backends** concurrently, with one frontend that routes to both. See [ADR-0004](docs/adr/0004-dual-backend-django-and-nestjs.md) for the detailed ownership split.

### OptiForge platform — Django
- **Path:** [`/backend/`](backend/)
- **Stack:** Django 4.2 + DRF + PostgreSQL 15 + Celery + RabbitMQ + Redis
- **Owns:** Tenancy, Identity, Audit, Extensions, Events, Workflow, Notifications, Reporting, Documents, Integration, API Gateway, Observability, Localisation, OptiForge Core (21 modules), Modes (ETO, Discrete), Compliance packs, Industry packs (KitchenEquipment)
- **Port:** 8000
- **Architecture:** five-layer (Platform → Core → Modes → Compliance → Packs), enforced by `lint-imports`. See [`docs/architecture.md`](docs/architecture.md) and [ADR-0001](docs/adr/0001-five-layer-architecture.md).

### b3-erp domain services — NestJS
- **Path:** [`/b3-erp/backend/`](b3-erp/backend/)
- **Stack:** NestJS 10 + TypeORM + PostgreSQL 15
- **Owns:** HR (statutory, training, loans, bonuses, skills), CRM, Sales (MACBIS flow), CPQ, Procurement, Inventory, Logistics, Finance, Production, Project management, Quality, Approvals, Workflow (MACBIS-specific), Common-masters, Accounts, After-sales, CMS, Estimation, IT-admin, Proposals, Reports, Support
- **Port:** 3001

### Frontend — Next.js
- **Path:** [`/b3-erp/frontend/`](b3-erp/frontend/) — the live, feature-complete UI (1,719 pages, 2,389 `.tsx` files)
- **Stack:** Next.js 14 + React 18 + TypeScript + TailwindCSS + shadcn + Radix UI
- **API routing:** two base URLs via env vars:
  - `NEXT_PUBLIC_PLATFORM_API_URL` → Django (port 8000, `/api/v1`)
  - `NEXT_PUBLIC_DOMAIN_API_URL` → NestJS (port 3001)
- **Auth:** JWT issued by Keycloak (see [ADR-0003](docs/adr/0003-oidc-provider-keycloak.md)); both backends validate the same token.

### Scaffolds (do not develop against)
- [`/frontend/`](frontend/) — 6 `.tsx` files, appears to be a boilerplate scaffold. Do not add features here without consulting ADR-0004 question Q5.
- [`/b3-erp/backend/prisma/`](b3-erp/backend/prisma/) — Prisma module coexists with TypeORM. Default to TypeORM for new entities unless the module is already Prisma.

## Development Commands

Preferred path: docker-compose (brings up both backends + Postgres + Redis + RabbitMQ in the right topology — see [`docker-compose.yml`](docker-compose.yml)).

```bash
# Full stack via docker-compose
cp .env.example .env         # edit as needed
docker-compose up -d

# --- or run components individually ---

# Django backend (OptiForge platform)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # :8000

# NestJS backend (b3-erp domain services)
cd b3-erp/backend
npm ci
npm run start:dev            # :3001

# Frontend (the real UI)
cd b3-erp/frontend
npm ci
npm run dev                  # :3000
```

## Key Directories

**Django (OptiForge platform)**
- [`/backend/optiforge/platform/`](backend/optiforge/platform/) — 13 platform services (tenancy, identity, audit, extensions, events, workflow, notifications, reporting, documents, integration, api_gateway, observability, localisation)
- [`/backend/optiforge/core/`](backend/optiforge/core/) — 21 core modules (CRM, Sales, Procurement, Inventory, WMS, Project, HR, PLM, IT-Admin, S&OP, CMMS, EHS, Production Planning, MES, Finance, QMS, Analytics, Field Service, Commissioning, Logistics, Support)
- [`/backend/optiforge/modes/`](backend/optiforge/modes/) — Mode extensions (ETO, Discrete; scaffolded: Process, Job-Shop, Repetitive, Mixed)
- [`/backend/optiforge/compliance/`](backend/optiforge/compliance/) — Compliance layer scaffolding
- [`/backend/optiforge/packs/`](backend/optiforge/packs/) — Industry packs (KitchenEquipment)
- [`/backend/tests/`](backend/tests/) — 14 pytest modules across canary/contract/performance/dr_drill/second_pack/acero/scaffolded_mode

**NestJS (b3-erp domain services)**
- [`/b3-erp/backend/src/modules/`](b3-erp/backend/src/modules/) — 29 domain modules
- [`/b3-erp/backend/src/common/`](b3-erp/backend/src/common/) — Cross-cutting decorators, filters, interceptors, guards
- [`/b3-erp/backend/test/unit/`](b3-erp/backend/test/unit/) — Jest unit specs

**Frontend**
- [`/b3-erp/frontend/src/app/`](b3-erp/frontend/src/app/) — Next.js App Router pages (1,719 pages)
- [`/b3-erp/frontend/src/components/`](b3-erp/frontend/src/components/) — React components
- [`/b3-erp/frontend/src/services/`](b3-erp/frontend/src/services/) — Typed API clients; each file picks **exactly one** of the two backend base URLs
- [`/b3-erp/frontend/src/lib/api-client.ts`](b3-erp/frontend/src/lib/api-client.ts) — Axios instance for Django platform
- [`/b3-erp/frontend/src/context/AuthContext.tsx`](b3-erp/frontend/src/context/AuthContext.tsx) — JWT/Keycloak flow

## Where Things Live — Quick Rules

- **New platform feature (auth, audit, workflow, tenancy, extensions):** Django. Add an app under `optiforge/platform/` and update settings.
- **New OptiForge core module (demand planning, MES, CPQ flows, scheduling, etc.):** Django, under `optiforge/core/<module>/`.
- **New MACBIS/domain feature (HR sub-flow, CRM process, estimation rule, etc.):** NestJS, under `b3-erp/backend/src/modules/<module>/`.
- **Cross-cutting concerns that must stay identical in both backends** (audit columns, soft delete, pagination, error envelope, JWT claims): document in [`docs/architecture-dual-backend.md`](docs/architecture-dual-backend.md) under "Data contracts" and implement in both.

## Enabled Capabilities

The following Claude capabilities are configured for this project:

| Capability | Description |
|------------|-------------|
| `workflow-manager` | Workflow engine design, state machines, approval processes |
| `ai-automation` | AI features, ML models, predictive analytics |
| `platform-capabilities` | Platform features, modules, user journeys |
| `developer-guidelines` | Coding standards, API conventions, security |
| `business-ops-marketing-manager` | Demos, sales materials, marketing content |
| `linkedin-expert` | Social media content, blog articles |
| `kreupai-solution-architect` | RFP analysis, solution architecture, proposals |
| `landing-page-developer` | High-converting landing pages |
| `backend-engineer` | Database schemas, APIs, frontend-backend wiring |
| `quality-assurance-engineer` | Testing, QA processes, automation |

Detailed capability documentation lives in [`.claude/capabilities/`](.claude/capabilities/).

## Status

Phases 1–6 have merged into `main`. See the PR list for detail: [`feat(phase-1)` … `feat(phase-6)`](https://github.com/KreupAI-Technologies/OptiForge/pulls?q=is%3Apr+phase+merged%3Atrue). The README "Status" table is the source of truth for phase-level progress.

## Further Reading

- [README.md](README.md) — overview + getting-started
- [ADR-0004: Dual-backend architecture](docs/adr/0004-dual-backend-django-and-nestjs.md) — why two backends, what owns what
- [docs/architecture-dual-backend.md](docs/architecture-dual-backend.md) — live-system diagram, routing rules, shared contracts
- [docs/architecture.md](docs/architecture.md) — OptiForge layered architecture (Django-internal)
- [docs/README.md](docs/README.md) — index of all project documentation
