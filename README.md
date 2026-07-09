# OptiForge / ManufacturingOS

**A layered multi-industry manufacturing ERP.** OptiForge is structured as five layers — Platform → Core → Modes → Compliance → Industry Packs — with a strict core/pack seam: every layer depends only on layers below it, and industry-specific logic lives exclusively in packs. B3 MACBIS kitchen equipment is the first customer and the KitchenEquipment pack is the only industry pack shipping in v1.

This repo holds the monorepo. The running system has **two backends**:

- **OptiForge (Django + DRF + PostgreSQL 15)** at [`/backend/`](backend/) — platform services (tenancy, identity, audit, extensions, events, workflow, notifications, reporting, documents, integration, api_gateway, observability, localisation), plus the OptiForge layered Core/Modes/Compliance/Packs stack. Celery + RabbitMQ + Redis for background work.
- **b3-erp (NestJS 10 + TypeORM)** at [`/b3-erp/backend/`](b3-erp/backend/) — 29 domain services (HR, CRM, Sales, Procurement, Inventory, Finance, Production, Logistics, Project-mgmt, Quality, Approvals, …).

The feature-complete frontend is **[`/b3-erp/frontend/`](b3-erp/frontend/)** (Next.js 14 + TypeScript + shadcn, 1,719 pages). It routes to both backends via two base URLs (`NEXT_PUBLIC_PLATFORM_API_URL`, `NEXT_PUBLIC_DOMAIN_API_URL`). See [ADR-0004](docs/adr/0004-dual-backend-django-and-nestjs.md) and [`docs/architecture-dual-backend.md`](docs/architecture-dual-backend.md) for the full ownership split and live-system diagram.

---

## For a new developer: read these, in order

1. [`docs/architecture-dual-backend.md`](./docs/architecture-dual-backend.md) — live-system diagram, which backend owns what, routing rules. **Start here.**
2. [`docs/adr/0004-dual-backend-django-and-nestjs.md`](./docs/adr/0004-dual-backend-django-and-nestjs.md) — why two backends, what decisions are settled, what's still open.
3. [`docs/README.md`](./docs/README.md) — index of all project documentation.
4. [`docs/brainstorms/2026-04-23-optiforge-layered-multi-industry.md`](./docs/brainstorms/2026-04-23-optiforge-layered-multi-industry.md) — why the OptiForge architecture is layered, what was rejected, open questions resolved.
5. [`docs/prds/optiforge-layered-multi-industry-architecture.md`](./docs/prds/optiforge-layered-multi-industry-architecture.md) — the Product Requirements Document. The source of truth every issue references.
6. [`docs/plans/optiforge-layered-multi-industry-architecture.md`](./docs/plans/optiforge-layered-multi-industry-architecture.md) — the phased build plan.
7. [`docs/adr/README.md`](./docs/adr/README.md) — decisions log. Read before making an architectural choice; add an ADR before committing one.
8. [`docs/runbooks/phase-1-kickoff-checklist.md`](./docs/runbooks/phase-1-kickoff-checklist.md) — what must be decided and done before anyone picks up issue P1-01.

The GitHub issues (labelled `phase:1`..`phase:5`) are the unit of work. Issues reference the PRD and plan; the PRD and plan reference the brainstorm. Nothing references code paths or file locations because those go stale.

---

## The Five-Layer Architecture

OptiForge is structured as **five explicit layers**, each depending only on layers below it:

1. **Layer 1: Platform** — Identity, Tenancy, Audit, API Gateway, Extensions Framework.
2. **Layer 2: Core Modules** — 21 industry-agnostic modules across 12 domains.
3. **Layer 3: Mode Extensions** — Discrete, Process, Job-Shop, ETO, Repetitive modes.
4. **Layer 4: Compliance Packs** — 21 CFR Part 11, IATF 16949, AS9100.
5. **Layer 5: Industry Packs** — KitchenEquipment, Pharma, Automotive, etc.

### The Strict Seam Rule
The load-bearing architectural contract is: **add an extension point, don't patch core.**
A pack may *read* core entities, *extend* them via declared extension points, and *observe* core events — but it may not write directly to core tables, override core logic, or fork core code. If a pack needs something core doesn't expose, you must add an extension point to core.

Cross-layer import violations are strictly forbidden and enforced by CI linters.
- Core cannot import from Packs
- Packs cannot import from other Packs
- Platform cannot import from Core, Modes, Compliance, or Packs

---

## Getting started

Preferred path: docker-compose brings up both backends + frontend + Postgres + Redis + RabbitMQ in the right topology.

```bash
# Clone
git clone https://github.com/KreupAI-Technologies/OptiForge.git
cd ManufacturingOS

# Configure env
cp .env.example .env          # edit as needed

# Full stack
docker-compose up -d

# Frontend:  http://localhost:3000
# Django:    http://localhost:8000/api/v1
# NestJS:    http://localhost:3001
```

### Run the whole stack from the repo root (no Docker)

A root `package.json` orchestrates all three services with `concurrently`:

```bash
# One-time install (root + both backends + frontend deps)
npm run install:all
# (Django deps: cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt)

# Start all three: Django (8000) + NestJS (3001) + Next.js (3000)
npm run dev

# Node-only (skip Django) — just NestJS + frontend
npm run dev:node

# Or a single service
npm run dev:platform   # Django  — port 8000
npm run dev:domain     # NestJS  — port 3001
npm run dev:web        # Next.js — port 3000
```

`npm run build` builds the NestJS + Next.js projects. `npm run db:manual` /
`db:manual:status` proxy the domain backend's Neon manual-migration scripts.
The Django `dev:platform` script uses the existing `backend/.venv` interpreter.

To run components fully by hand:

```bash
# Django backend (OptiForge platform) — port 8000
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # then set DATABASE_* to the shared Neon creds
                             # (same cluster as b3-erp/backend/.env, per ADR-0004)
                             # without this, Django defaults to test/test@localhost and fails
python manage.py migrate
python manage.py runserver

# NestJS backend (b3-erp domain services) — port 3001
cd b3-erp/backend
npm ci
npm run start:dev

# Frontend — port 3000
cd b3-erp/frontend
npm ci
npm run dev
```

---

## Where to ask questions

- **Architectural question:** open a GitHub Discussion under the "Architecture" category, or an ADR draft in `docs/adr/`.
- **Bug in an existing module:** file a GitHub issue with the relevant `module:*` or `pack:*` label.
- **Scope dispute on an existing issue:** comment on the issue. If the dispute is about cutting scope from Phase 1, the default answer is "no, add it to Phase 2+."

---

## Status

| Phase | Status |
|---|---|
| **Phase 1 (Tracer Bullet)** | ✅ Merged ([#106](https://github.com/KreupAI-Technologies/OptiForge/pull/106)) |
| **Phase 2 (Platform Depth)** | ✅ Merged ([#107](https://github.com/KreupAI-Technologies/OptiForge/pull/107)) |
| **Phase 3 (Demand + Design Half)** | ✅ Merged ([#108](https://github.com/KreupAI-Technologies/OptiForge/pull/108)) |
| **Phase 4 (Execution Half + Migration)** | ✅ Merged ([#109](https://github.com/KreupAI-Technologies/OptiForge/pull/109)) |
| **Phase 5 (Hardening + Go-Live)** | ✅ Merged ([#110](https://github.com/KreupAI-Technologies/OptiForge/pull/110)) |
| **Phase 6 (Celery publisher + BOQ upload UI)** | ✅ Merged ([#111](https://github.com/KreupAI-Technologies/OptiForge/pull/111)) |
| **Backend-improvement milestone** | 🔄 In progress ([milestone 2](https://github.com/KreupAI-Technologies/OptiForge/milestone/2)) — docs, soft-delete/audit, pagination, compose, CI across both backends |
