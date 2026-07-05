#!/usr/bin/env zsh
# Files OptiForge PRD issues into the target GitHub repo in dependency order.
# Requires: gh CLI authenticated, labels and milestone pre-created in the repo.
# Usage:
#   zsh file_issues.sh                    # files into default REPO below
#   REPO=owner/name zsh file_issues.sh    # override repo

set -euo pipefail
REPO="${REPO:-KreupAI-Technologies/OptiForge}"
MILESTONE="${MILESTONE:-}"     # optional: export MILESTONE="OptiForge v1"
ASSIGNEE="${ASSIGNEE:-}"       # optional: export ASSIGNEE="your-gh-handle"

# Key → issue number mapping, populated as issues are filed.
declare -A ISSUE_NUM

# Helper: build a --label arg list.
labels_arg() {
  local IFS=","
  echo "$*"
}

# Helper: render blocked_by as 'Blocked by: #12, #13' using the map above.
blocked_by_line() {
  local out=""
  for k in "$@"; do
    local num="${ISSUE_NUM[$k]:-}"
    if [[ -z "$num" ]]; then
      echo "ERROR: blocked_by key $k has no filed issue yet — check ordering." >&2
      exit 1
    fi
    out="${out}#${num}, "
  done
  echo "${out%, }"
}

file_issue() {
  local key="$1"; shift
  local title="$1"; shift
  local body_file="$1"; shift
  local labels="$1"; shift
  local extra_args=()
  if [[ -n "$MILESTONE" ]]; then extra_args+=(--milestone "$MILESTONE"); fi
  if [[ -n "$ASSIGNEE" ]]; then extra_args+=(--assignee "$ASSIGNEE"); fi
  local url
  url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$body_file" \
    --label "$labels" \
    "${extra_args[@]}")
  local num
  num=$(echo "$url" | grep -oE '[0-9]+$')
  ISSUE_NUM[$key]="$num"
  echo "Filed $key → #$num ($url)"
}

TMPDIR=$(mktemp -d -t optiforge-issues-XXXXXX)
trap "rm -rf $TMPDIR" EXIT

# ----- P1-01: Scaffold monorepo and wire cross-layer import lint canary -----
cat > $TMPDIR/P1-01.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** repo, CI

**PRD user stories:** #5

**Ships:** Django + DRF + Next.js scaffolding, CI pipeline, and a cross-layer import linter that fails the build on layer violations — proven by a canary test that *expects* failure.

## Acceptance criteria

- [ ] Django 4.2 backend project and Next.js 14 frontend project committed with agreed folder layout reflecting the 5 layers (platform / core / modes / compliance / packs).
- [ ] CI pipeline runs lint, typecheck, and tests on every PR.
- [ ] Cross-layer import linter rejects: core → pack imports, pack → pack imports, upward imports from platform.
- [ ] A deliberately-violating canary test exists and is expected-to-fail; if it ever passes, the build fails with a clear message.
- [ ] README documents the layer model and the 'add an extension point, don't patch core' rule.

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
file_issue "P1-01" "Scaffold monorepo and wire cross-layer import lint canary" "$TMPDIR/P1-01.md" "phase:1,type:afk,area:platform,area:ci"

# ----- P5-11: Resolve PRD open questions: Q4 (Generic SKU), Q7 (pack licensing), integration priority, named platform owner, ACERO suite ownership -----
cat > $TMPDIR/P5-11.md <<'__ISSUE_BODY__'
**Type:** HITL — Entirely human decisions; not a code ticket but gates go-live communication.

**Phase:** 5

**Layers touched:** docs

**Ships:** Written resolutions (or explicit deferrals) for each remaining PRD open question, captured in the runbook and release notes.

## Acceptance criteria

- [ ] Q4 resolution documented or explicitly deferred with owner and next-review date.
- [ ] Q7 resolution documented or explicitly deferred with owner and next-review date.
- [ ] Third-party integration v1 scope decided; impacts P2-06 connector priority retroactively.
- [ ] Named platform owner documented in runbook and on-call rotation.
- [ ] ACERO regression suite ownership assigned.

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
file_issue "P5-11" "Resolve PRD open questions: Q4 (Generic SKU), Q7 (pack licensing), integration priority, named platform owner, ACERO suite ownership" "$TMPDIR/P5-11.md" "phase:5,type:hitl,area:docs,phase-gate,risk:prd-opens"

# ----- P1-02: Tenancy foundation: tenant_id + PostgreSQL RLS + tenant-scoped repository -----
cat > $TMPDIR/P1-02.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** schema, service, tests

**PRD user stories:** #4

**Ships:** Non-nullable tenant_id on every non-reference table, PostgreSQL row-level-security policies enforced, and an ORM-layer repository that rejects any query missing tenant context.

## Acceptance criteria

- [ ] Base model enforces non-nullable tenant_id on all tenant-scoped tables; reference tables explicitly opted out.
- [ ] RLS policies enabled on all tenant-scoped tables; raw SQL without tenant context is rejected by the database.
- [ ] Tenant-scoped repository pattern raises a clear exception if called without an active tenant context.
- [ ] Cross-tenant isolation test proves tenant A cannot read tenant B entity by id (returns not-found, not access-denied).
- [ ] Tenant provisioning API creates a tenant and returns its id; provisioned tenant rows are visible only under that tenant's context.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-02.md && rm $TMPDIR/P1-02.md.bak
file_issue "P1-02" "Tenancy foundation: tenant_id + PostgreSQL RLS + tenant-scoped repository" "$TMPDIR/P1-02.md" "phase:1,type:afk,area:platform,area:security"

# ----- P1-05: Pack registry: manifest parser, schema, and loader -----
cat > $TMPDIR/P1-05.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** schema, service, tests

**PRD user stories:** #1

**Ships:** Packs are declarative YAML manifests validated against a JSON schema and registered in a pack_registry table. Bootstraps with zero packs; a fixture manifest proves validation.

## Acceptance criteria

- [ ] Pack manifest JSON schema published; includes id, name, version, depends_on (modes, compliance, core_version_range), and extends (entities, workflows, screens, seeds, reports, integrations).
- [ ] pack_registry table stores manifest + activation status per tenant.
- [ ] Manifest parser rejects invalid manifests with field-level errors.
- [ ] Fixture test manifest loads successfully; a deliberately-broken manifest fails validation with the exact offending field.
- [ ] core_version_range mismatch fails fast with a clear error before any pack code runs.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-05.md && rm $TMPDIR/P1-05.md.bak
file_issue "P1-05" "Pack registry: manifest parser, schema, and loader" "$TMPDIR/P1-05.md" "phase:1,type:afk,area:platform,area:extension-framework"

# ----- P1-07: Event bus: RabbitMQ publish-subscribe with at-least-once delivery for CustomerRequirementCreated -----
cat > $TMPDIR/P1-07.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** service, tests

**PRD user stories:** #3

**Ships:** A single event type (CustomerRequirementCreated) can be published by core and consumed by multiple pack subscribers, at-least-once. No DLQ or replay yet (those arrive in Phase 2).

## Acceptance criteria

- [ ] Producer API: publish(event_type, payload, tenant_id); payload is validated against a registered event schema.
- [ ] Subscriber API: packs register handlers by event_type at pack-load time.
- [ ] Delivery is at-least-once: a subscriber that acks is not redelivered; a subscriber that fails is retried per policy.
- [ ] Two subscribers to the same event both receive it independently; failure of one does not block the other.
- [ ] Test covers: publish succeeds, both subscribers consume, subscriber failure is retried.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-07.md && rm $TMPDIR/P1-07.md.bak
file_issue "P1-07" "Event bus: RabbitMQ publish-subscribe with at-least-once delivery for CustomerRequirementCreated" "$TMPDIR/P1-07.md" "phase:1,type:afk,area:platform,area:events"

# ----- P2-11: Localisation: i18n extraction pipeline, l10n formatters, RTL layout support, country validator hook -----
cat > $TMPDIR/P2-11.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, UI, tests

**Ships:** Localisation infrastructure ready: every UI label is extractable; l10n formatters for date/number/currency are in place; RTL CSS infrastructure ready. No second locale shipped yet; validation in Phase 5.

## Acceptance criteria

- [ ] i18n extraction run produces a labels catalogue covering every UI screen currently shipping.
- [ ] Frontend renders RTL correctly when locale direction is RTL (validated on a synthetic fixture).
- [ ] Number, date, currency formatters produce locale-appropriate output for at least en-US, en-GB, ar-AE fixtures.
- [ ] Country validator extension hook ready: future localisation packs register GST/VAT/ZATCA/etc. validators.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-11.md && rm $TMPDIR/P2-11.md.bak
file_issue "P2-11" "Localisation: i18n extraction pipeline, l10n formatters, RTL layout support, country validator hook" "$TMPDIR/P2-11.md" "phase:2,type:afk,area:platform,area:localisation"

# ----- P1-03: Identity: OIDC login with one role and tenant membership enforcement -----
cat > $TMPDIR/P1-03.md <<'__ISSUE_BODY__'
**Type:** HITL — OIDC provider selection (Keycloak / Auth0 / Azure AD / self-hosted) is an architecture decision affecting ops cost and enterprise-sales posture.

**Phase:** 1

**Layers touched:** service, API, UI, tests

**PRD user stories:** #4

**Ships:** An authenticated user can log in via OIDC, is assigned the single 'user' role for Phase 1, and their session is scoped to one tenant. No MFA, no SAML, no ABAC yet.

## Acceptance criteria

- [ ] OIDC provider choice documented in ADR; provider is configured in dev and staging.
- [ ] Successful OIDC login produces a session bound to (user_id, tenant_id); missing tenant membership rejects login.
- [ ] Session middleware populates tenant context consumed by the Phase 1-02 repository.
- [ ] Logout terminates the session and invalidates the backend token.
- [ ] Integration test: unauthenticated request to any API returns 401; cross-tenant session cannot read other tenant data.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-01" "P1-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-03.md && rm $TMPDIR/P1-03.md.bak
file_issue "P1-03" "Identity: OIDC login with one role and tenant membership enforcement" "$TMPDIR/P1-03.md" "phase:1,type:hitl,area:platform,area:identity"

# ----- P1-04: Audit: hash-chained mutation log with tamper-detection job -----
cat > $TMPDIR/P1-04.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** schema, service, tests

**PRD user stories:** #2, #17

**Ships:** Every mutation on every tenant-scoped entity writes an audit record with previous_hash + this_hash; a scheduled verification job detects any tampering in the chain.

## Acceptance criteria

- [ ] audit_record schema includes: actor, timestamp (tz-aware), tenant_id, entity_type, entity_id, operation, before_state (jsonb), after_state (jsonb), reason_for_change, previous_hash, this_hash, layer.
- [ ] ORM-level signal writes audit records on every create/update/delete within the same DB transaction as the mutation.
- [ ] Hash chain is per-entity (each entity has its own chain); tamper-detection job runs on schedule and raises an alert on first break.
- [ ] Audit query API: given entity type + id, return full chronological history in under 1 second for entities with up to 10,000 records.
- [ ] Test: mutate an audit row directly in DB; verification job reports the break on its next run.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-04.md && rm $TMPDIR/P1-04.md.bak
file_issue "P1-04" "Audit: hash-chained mutation log with tamper-detection job" "$TMPDIR/P1-04.md" "phase:1,type:afk,area:platform,area:audit"

# ----- P1-06: Extension Framework: integration connector extension point for source_type parsers -----
cat > $TMPDIR/P1-06.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** service, tests

**PRD user stories:** #1, #9, #14

**Ships:** The one extension point required by the tracer bullet: packs register parsers against CustomerRequirement.source_type values. Other nine extension points ship in Phase 2.

## Acceptance criteria

- [ ] Extension-point registry accepts pack-supplied parser callables keyed by source_type.
- [ ] Core calls the registered parser by source_type; if none is registered, returns a clear 'no parser registered' error (not a 500).
- [ ] Registering two parsers for the same source_type is rejected at pack-load time.
- [ ] Test: two fake packs register for different source_types; both invoke independently; neither leaks into the other.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-05")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-06.md && rm $TMPDIR/P1-06.md.bak
file_issue "P1-06" "Extension Framework: integration connector extension point for source_type parsers" "$TMPDIR/P1-06.md" "phase:1,type:afk,area:platform,area:extension-framework"

# ----- P2-07: Workflow Engine: JSON state machines, named insertion points, pack-registered step handlers, definition versioning -----
cat > $TMPDIR/P2-07.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** schema, service, tests

**PRD user stories:** #10, #15

**Ships:** Workflow Engine as a real platform service: state machines are JSON data (not code), packs insert steps at named insertion points, running instances complete on the definition version they started on.

## Acceptance criteria

- [ ] Workflow definitions are JSON conforming to a published schema; core ships the QuotationApproval definition with declared insertion points (e.g., 'after_initial_review').
- [ ] Packs register step-type handlers; runtime resolves handler by pack + step-type name.
- [ ] workflow_instance records the definition version; a mid-flight definition change does not mutate running instances.
- [ ] Failure of a pack-inserted step is attributed to the pack in logs, metrics, and error envelope.
- [ ] Test: activate KitchenEquipment pack (which inserts finishing_review_step); verify it appears in new instances and not in already-running instances.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-05")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-07.md && rm $TMPDIR/P2-07.md.bak
file_issue "P2-07" "Workflow Engine: JSON state machines, named insertion points, pack-registered step handlers, definition versioning" "$TMPDIR/P2-07.md" "phase:2,type:afk,area:platform,area:workflow"

# ----- P5-04: Pack-version compatibility matrix published; fail-fast on mismatch verified -----
cat > $TMPDIR/P5-04.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** docs, tests

**Ships:** Compatibility matrix of pack versions × core versions published; fail-fast rejection of mismatched versions verified end-to-end.

## Acceptance criteria

- [ ] Matrix lives in /docs/compatibility-matrix.md and is updated per release.
- [ ] Pack activation rejects pack v1.2 against core v2.1 if out of declared range, with a clear error.
- [ ] Semver discipline documented for both pack and core release processes.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-05")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-04.md && rm $TMPDIR/P5-04.md.bak
file_issue "P5-04" "Pack-version compatibility matrix published; fail-fast on mismatch verified" "$TMPDIR/P5-04.md" "phase:5,type:afk,area:docs,area:release-mgmt"

# ----- P2-04: Event bus hardening: DLQ, subscriber-initiated replay, per-subscriber observability -----
cat > $TMPDIR/P2-04.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, tests

**PRD user stories:** #3

**Ships:** The event bus from Phase 1 gets DLQ handling, replay from timestamp, and per-subscriber visibility.

## Acceptance criteria

- [ ] Subscriber retry policy: exponential backoff with configured ceiling; after budget exhausted, event routes to DLQ with alert.
- [ ] Replay API: subscriber requests replay from timestamp T; all subscribed events since T are re-delivered in original order.
- [ ] Per-subscriber observability: current lag, retry count, DLQ size.
- [ ] Chaos test: kill a subscriber mid-processing; restart; subscriber recovers via at-least-once delivery without duplicating acks.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-04.md && rm $TMPDIR/P2-04.md.bak
file_issue "P2-04" "Event bus hardening: DLQ, subscriber-initiated replay, per-subscriber observability" "$TMPDIR/P2-04.md" "phase:2,type:afk,area:platform,area:events"

# ----- P5-09: Localisation readiness: English labels fully extracted, RTL structural verified on staging -----
cat > $TMPDIR/P5-09.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** UI, tests

**Ships:** All UI labels extracted to i18n catalogue; RTL structural support validated on a staging build (no RTL locale shipped yet).

## Acceptance criteria

- [ ] Every UI label is in the extraction catalogue (automated audit).
- [ ] Staging build with locale direction=rtl renders correctly on core + KitchenEquipment screens.
- [ ] No hard-coded English strings remain in frontend render paths.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-11")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-09.md && rm $TMPDIR/P5-09.md.bak
file_issue "P5-09" "Localisation readiness: English labels fully extracted, RTL structural verified on staging" "$TMPDIR/P5-09.md" "phase:5,type:afk,area:frontend,area:localisation"

# ----- P2-01: Identity hardening: SAML, MFA for admins, full RBAC hierarchy, ABAC -----
cat > $TMPDIR/P2-01.md <<'__ISSUE_BODY__'
**Type:** HITL — RBAC role taxonomy and ABAC policy language decisions affect every downstream module; need architect sign-off.

**Phase:** 2

**Layers touched:** service, API, UI, tests

**PRD user stories:** #4

**Ships:** Identity goes from 'one role, OIDC only' to production: SAML alongside OIDC, MFA enforced for admin roles, RBAC role hierarchy, ABAC policy engine with attribute-driven rules, delegated admin.

## Acceptance criteria

- [ ] SAML SP metadata published; SAML login works against a staging IdP.
- [ ] MFA required for any role in the 'admin' hierarchy; MFA enforcement testable.
- [ ] Role hierarchy: a role inherits permissions from parents; cycles rejected at definition time.
- [ ] ABAC policy engine evaluates policies like 'user can read items only in their plant'.
- [ ] Delegated admin: a tenant admin can create users and assign roles within their tenant, not across tenants.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-03")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-01.md && rm $TMPDIR/P2-01.md.bak
file_issue "P2-01" "Identity hardening: SAML, MFA for admins, full RBAC hierarchy, ABAC" "$TMPDIR/P2-01.md" "phase:2,type:hitl,area:platform,area:identity"

# ----- P1-08: Core stub: CustomerRequirement entity with source_type + extensible_attributes -----
cat > $TMPDIR/P1-08.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** schema, service, API, tests

**PRD user stories:** #6, #9

**Ships:** The single core entity of the tracer bullet: CustomerRequirement with source_type enum, extensible_attributes JSONB, and create/list/read endpoints. Wired through tenancy, audit, and event-on-create.

## Acceptance criteria

- [ ] Schema: CustomerRequirement(id, tenant_id, source_type enum [catalog_order, configurator_order, bom_import, boq_import, rfq_spec, contract_release, forecast_plan], source_payload jsonb, extensible_attributes jsonb, lifecycle status, audit fields).
- [ ] Create endpoint invokes the registered parser for the given source_type (from P1-06) and stores parsed lines.
- [ ] Every mutation emits an audit record (via P1-04) and publishes CustomerRequirementCreated (via P1-07).
- [ ] List and read endpoints are tenant-scoped via the P1-02 repository.
- [ ] Test: create with no parser registered for source_type returns the P1-06 'no parser' error cleanly.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-02" "P1-04" "P1-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-08.md && rm $TMPDIR/P1-08.md.bak
file_issue "P1-08" "Core stub: CustomerRequirement entity with source_type + extensible_attributes" "$TMPDIR/P1-08.md" "phase:1,type:afk,area:core,module:sales"

# ----- P2-03: Audit production-grade: reader role, scheduled chain verification, retention policy, performance SLO -----
cat > $TMPDIR/P2-03.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, API, tests

**PRD user stories:** #2, #17

**Ships:** Audit moves from 'hash-chain works' to 'audit is a compliance substrate': dedicated reader role, scheduled verification, retention rules, performance SLOs.

## Acceptance criteria

- [ ] Dedicated audit-reader role distinct from tenant admin; tenant admins cannot read audit logs by default.
- [ ] Hash-chain verification job runs hourly on staging, daily in prod; alerts on first break.
- [ ] Retention policy: 5 years online, 7 years archived; archival export works.
- [ ] Audit query latency SLO: p95 under 1s for entity-scoped queries on entities with 10,000+ records.
- [ ] Reason-for-change field is queryable; empty values allowed but indexed as NULL.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-03.md && rm $TMPDIR/P2-03.md.bak
file_issue "P2-03" "Audit production-grade: reader role, scheduled chain verification, retention policy, performance SLO" "$TMPDIR/P2-03.md" "phase:2,type:afk,area:platform,area:audit"

# ----- P2-10: Extension Framework: all 10 extension points, exercised by TestIndustry pack in CI -----
cat > $TMPDIR/P2-10.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, tests

**PRD user stories:** #1, #5

**Ships:** All ten extension points from PRD live: entity attributes, workflow state/transitions, screen slots, master data seeds, workflow step types, validation rules, report templates, integration connectors, event subscriptions, permission scopes. TestIndustry pack exercises every one in CI.

## Acceptance criteria

- [ ] Each extension point has a documented API with typed registration and discovery.
- [ ] TestIndustry pack registers via every extension point; its registration is verified in CI contract tests.
- [ ] A 'leaky pack' attempt — TestIndustry writes to a core table — is rejected at the repository layer with a clear error.
- [ ] Extension-point catalogue published as internal doc; each entry links to its TestIndustry example.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-06" "P2-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-10.md && rm $TMPDIR/P2-10.md.bak
file_issue "P2-10" "Extension Framework: all 10 extension points, exercised by TestIndustry pack in CI" "$TMPDIR/P2-10.md" "phase:2,type:afk,area:platform,area:extension-framework"

# ----- P2-06: Integration Fabric: connector framework + EDI engine stubs + webhook engine + scheduled sync + per-connector DLQ -----
cat > $TMPDIR/P2-06.md <<'__ISSUE_BODY__'
**Type:** HITL — Concrete connector priority (Stripe, PayPal, FedEx, QuickBooks, Shopify) is PRD Open #3 and must be resolved before authoring real connectors.

**Phase:** 2

**Layers touched:** service, tests

**Ships:** The shape packs and future connectors plug into: a connector framework with codec hooks for X12 / EDIFACT / AS2 (stubs), webhook engine with signature verification, scheduled sync jobs, per-connector DLQ. No concrete third-party connector is authored yet.

## Acceptance criteria

- [ ] Connector framework interface documented; packs + core modules register connectors declaratively.
- [ ] EDI codec stubs for X12, EDIFACT, AS2 parse trivial fixtures; full message coverage deferred until a real integration needs it.
- [ ] Webhook engine verifies signatures on inbound; signs outbound; rejects malformed requests at the edge.
- [ ] Scheduled sync runner: jobs declared per-connector; failures route to per-connector DLQ with alert.
- [ ] A dummy connector (for the TestIndustry pack) exercises every framework capability in CI.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-06.md && rm $TMPDIR/P2-06.md.bak
file_issue "P2-06" "Integration Fabric: connector framework + EDI engine stubs + webhook engine + scheduled sync + per-connector DLQ" "$TMPDIR/P2-06.md" "phase:2,type:hitl,area:platform,area:integration-fabric"

# ----- P2-02: Tenancy lifecycle: provisioning, suspend, archive, pack activation with transactional rollback -----
cat > $TMPDIR/P2-02.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, API, tests

**PRD user stories:** #4, #13, #16

**Ships:** Tenants have a real lifecycle (provision → active → suspended → archived) and pack activation is transactional: partial failure rolls back cleanly.

## Acceptance criteria

- [ ] Tenant lifecycle state machine: provision → active → suspended → archived; suspended tenants reject all non-admin requests.
- [ ] Pack activation on a tenant is transactional: seed-data load + registry write commit together or neither commits.
- [ ] Deactivation flags pack-created data as orphaned but does not delete; a separate confirmed operation deletes.
- [ ] Pack activation and deactivation dry-run shows the list of extension points that will activate/deactivate before committing.
- [ ] Test: simulated failure during pack activation leaves tenant in previous state; no orphan seed data.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-02" "P2-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-02.md && rm $TMPDIR/P2-02.md.bak
file_issue "P2-02" "Tenancy lifecycle: provisioning, suspend, archive, pack activation with transactional rollback" "$TMPDIR/P2-02.md" "phase:2,type:afk,area:platform,area:tenancy"

# ----- P1-09: KitchenEquipment pack stub: manifest + BOQ parser hook -----
cat > $TMPDIR/P1-09.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** pack, service, tests

**PRD user stories:** #13, #14

**Ships:** The KitchenEquipment pack as a manifest + one parser: accepts a fake BOQ payload, emits two parsed lines with fascia_type + cladding_type in extensible_attributes.

## Acceptance criteria

- [ ] KitchenEquipment pack manifest declares: id, version, depends_on (mode:eto), extends.integrations (boq_import parser), extends.entities (Item: fascia_type, cladding_type as typed attributes).
- [ ] BOQ parser is a hardcoded function that, given a fake payload, returns exactly two line items with valid fascia_type and cladding_type values.
- [ ] Parser registration via P1-06 is idempotent: pack reload does not double-register.
- [ ] Integration test: create a CustomerRequirement with source_type=boq_import and a fake payload; observe two lines stored with kitchen attributes; observe audit log attributes writes to 'pack:kitchen-equipment'.
- [ ] Pack-declared typed attributes are validated on save: save without fascia_type returns a pack-defined error (not a core error).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-06" "P1-08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-09.md && rm $TMPDIR/P1-09.md.bak
file_issue "P1-09" "KitchenEquipment pack stub: manifest + BOQ parser hook" "$TMPDIR/P1-09.md" "phase:1,type:afk,area:pack,pack:kitchen-equipment"

# ----- P1-10: TestIndustry dummy pack: subscribes to CustomerRequirementCreated -----
cat > $TMPDIR/P1-10.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** pack, service, tests

**PRD user stories:** #3

**Ships:** A second pack whose only job is to prove the extension contract works for more than one consumer. Subscribes to CustomerRequirementCreated and logs receipt. Ships in the repo behind a non-activatable flag (per PRD Open #4 guidance).

## Acceptance criteria

- [ ] TestIndustry pack manifest declares: id, version, no real mode dependency, extends.integrations subscribes to CustomerRequirementCreated.
- [ ] Subscriber handler writes a structured log line: 'test-industry-pack received event for tenant X, cr_id Y'.
- [ ] Pack is flagged non-activatable-in-production via a feature flag; CI + staging can activate, production cannot.
- [ ] Test: with both KitchenEquipment and TestIndustry activated, a single CustomerRequirement creation triggers the KitchenEquipment parser AND delivers the event to TestIndustry subscriber; failure of one does not prevent the other.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-06" "P1-07" "P1-08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-10.md && rm $TMPDIR/P1-10.md.bak
file_issue "P1-10" "TestIndustry dummy pack: subscribes to CustomerRequirementCreated" "$TMPDIR/P1-10.md" "phase:1,type:afk,area:pack,pack:test-industry"

# ----- P1-11: API Gateway v1: POST /api/v1/customer-requirements with OIDC auth -----
cat > $TMPDIR/P1-11.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** API, service, tests

**PRD user stories:** #4, #14

**Ships:** The single API endpoint of the tracer bullet: versioned, OIDC-authenticated, standard error envelope, Idempotency-Key scaffolding. Rate-limiting and GraphQL arrive in Phase 2.

## Acceptance criteria

- [ ] POST /api/v1/customer-requirements accepts JSON body { source_type, source_payload }; returns the created resource.
- [ ] OIDC session required; unauthenticated returns 401 in the standard error envelope { error_code, message, details, correlation_id }.
- [ ] Idempotency-Key header: same key + same body within the idempotency window returns the original response, not a duplicate.
- [ ] Versioning: path includes /v1/; breaking changes will bump to /v2/.
- [ ] Test: happy path, unauthenticated 401, cross-tenant 404, idempotent replay returns original id.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-03" "P1-08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-11.md && rm $TMPDIR/P1-11.md.bak
file_issue "P1-11" "API Gateway v1: POST /api/v1/customer-requirements with OIDC auth" "$TMPDIR/P1-11.md" "phase:1,type:afk,area:platform,area:api-gateway"

# ----- P5-06: Disaster-recovery drill: PITR + tenancy restart + DLQ replay -----
cat > $TMPDIR/P5-06.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** tests

**Ships:** DR drill covering point-in-time restore, platform restart with tenant provisioning preserved, DLQ replay reconstructing subscriber state.

## Acceptance criteria

- [ ] PITR drill on staging: restore to T-1h; audit hash chain verifies cleanly against the restored state.
- [ ] Platform restart test: tenant configuration and pack activations persist; user sessions re-establish.
- [ ] DLQ replay test: seed DLQ with 10k events; subscriber-initiated replay consumes them in order without duplicates (beyond at-least-once).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-04" "P2-03")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-06.md && rm $TMPDIR/P5-06.md.bak
file_issue "P5-06" "Disaster-recovery drill: PITR + tenancy restart + DLQ replay" "$TMPDIR/P5-06.md" "phase:5,type:afk,area:test,area:resilience"

# ----- P3-01: BRS split exercise: map existing 14 BRSes into core vs KitchenEquipment pack -----
cat > $TMPDIR/P3-01.md <<'__ISSUE_BODY__'
**Type:** HITL — The BRS split is the foundational act of the whole re-architecture; needs architect + product review before any code.

**Phase:** 3

**Layers touched:** docs

**Ships:** A checklist-driven split of every existing BRS module into (a) thin core spec and (b) KitchenEquipment pack spec. No code; this unblocks all P3 core-module work.

## Acceptance criteria

- [ ] Every one of the 14 existing BRSes has two successor specs: thin core spec + KitchenEquipment pack delta.
- [ ] Every kitchen-specific concept (fascia, cladding, BOQ, NSF, finishing, commissioning templates, etc.) is claimed by the pack spec.
- [ ] Disposition rule is applied consistently: mode-agnostic + industry-agnostic = core; anything else = pack.
- [ ] Output lives in /docs/specs/core and /docs/specs/packs/kitchen-equipment.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-10")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-01.md && rm $TMPDIR/P3-01.md.bak
file_issue "P3-01" "BRS split exercise: map existing 14 BRSes into core vs KitchenEquipment pack" "$TMPDIR/P3-01.md" "phase:3,type:hitl,area:docs,phase-gate"

# ----- P5-14: Documentation set: architecture layer model, extension-point catalogue, pack authoring guide, compatibility matrix -----
cat > $TMPDIR/P5-14.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** docs

**Ships:** Publishable documentation set for internal use (and for eventual customer/partner consumption when OptiForge is commercially positioned).

## Acceptance criteria

- [ ] Architecture layer model doc published with the 5-layer diagram and dependency rule.
- [ ] Extension-point catalogue doc lists all 10 points with example pack uses.
- [ ] Pack authoring guide walks through manifest, hooks, testing.
- [ ] Compatibility matrix kept current on release.
- [ ] All docs live in the KreupAI internal doc site and are linked from the project README.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P5-04" "P2-10")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-14.md && rm $TMPDIR/P5-14.md.bak
file_issue "P5-14" "Documentation set: architecture layer model, extension-point catalogue, pack authoring guide, compatibility matrix" "$TMPDIR/P5-14.md" "phase:5,type:afk,area:docs"

# ----- P2-08: Document Store: versioned binary storage, check-in/out, retention, OCR indexing -----
cat > $TMPDIR/P2-08.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, API, tests

**Ships:** The binary-asset substrate for drawings, PDFs, SOPs, contracts: versioned, with check-in/out, retention rules, OCR indexing feeding Elasticsearch.

## Acceptance criteria

- [ ] Upload returns a document handle; subsequent versions create new revisions without overwriting.
- [ ] Check-in / check-out lock prevents concurrent edits; stale locks time out.
- [ ] Retention policy configurable per document class; expired documents are archived, not deleted, without explicit confirmation.
- [ ] OCR pipeline processes PDFs and images; extracted text is searchable via the Reporting Fabric query layer.
- [ ] Tenant-scoped: documents are isolated per tenant at both metadata and binary-storage layers.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-08.md && rm $TMPDIR/P2-08.md.bak
file_issue "P2-08" "Document Store: versioned binary storage, check-in/out, retention, OCR indexing" "$TMPDIR/P2-08.md" "phase:2,type:afk,area:platform,area:document-store"

# ----- P2-09: Notification service: email, SMS, push, in-app channels with templates, routing rules, opt-outs -----
cat > $TMPDIR/P2-09.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, API, tests

**Ships:** Unified notification service that every module and pack sends through; no module mails directly.

## Acceptance criteria

- [ ] Channel adapters: email (SES / SendGrid), SMS (configurable provider), push, in-app inbox.
- [ ] Template library: i18n-ready templates versioned per tenant; fallback to core template if tenant has none.
- [ ] Routing rules: notify based on event + user preferences; opt-out respected globally except for transactional mandatories.
- [ ] Delivery status observable: sent / queued / failed / bounced.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-09.md && rm $TMPDIR/P2-09.md.bak
file_issue "P2-09" "Notification service: email, SMS, push, in-app channels with templates, routing rules, opt-outs" "$TMPDIR/P2-09.md" "phase:2,type:afk,area:platform,area:notification"

# ----- P2-12: Reporting Fabric: unified query layer, scheduled reports, PDF/Excel/CSV export pipeline -----
cat > $TMPDIR/P2-12.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, API, tests

**Ships:** Reporting substrate that every module reports through; no module generates its own exports.

## Acceptance criteria

- [ ] Unified query layer: modules and packs register reportable views; reporting reads only from the view layer.
- [ ] Scheduled reports with cron-like specs; delivery via Notification service.
- [ ] Export pipeline: same report definition produces PDF, Excel, CSV consistently.
- [ ] Tenant-scoped throughout; cross-tenant isolation test covers reporting.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-12.md && rm $TMPDIR/P2-12.md.bak
file_issue "P2-12" "Reporting Fabric: unified query layer, scheduled reports, PDF/Excel/CSV export pipeline" "$TMPDIR/P2-12.md" "phase:2,type:afk,area:platform,area:reporting"

# ----- P1-12: UI: BOQ-upload page with pack-contributed KitchenSpecTab -----
cat > $TMPDIR/P1-12.md <<'__ISSUE_BODY__'
**Type:** HITL — Pack-slot rendering is a visual contract — a developer cannot self-verify that the slot renders correctly without a human eyeball on it.

**Phase:** 1

**Layers touched:** UI, tests

**PRD user stories:** #13, #14

**Ships:** One Next.js page behind OIDC auth that lets a user upload a fake BOQ file and see the parsed result, with the KitchenEquipment pack's tab rendered into a pack-slot.

## Acceptance criteria

- [ ] Page requires OIDC login; shows the authenticated user + their tenant.
- [ ] File upload control POSTs to /api/v1/customer-requirements with source_type=boq_import.
- [ ] On success, renders the parsed lines; the kitchen-specific attribute fields (fascia_type, cladding_type) render inside a tab that was contributed by the KitchenEquipment pack via a declared screen slot.
- [ ] With the KitchenEquipment pack deactivated, the tab does not render (core UI still works).
- [ ] Basic accessibility: keyboard-navigable, labelled controls; no automated WCAG gate yet (arrives in Phase 5).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-09" "P1-11")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-12.md && rm $TMPDIR/P1-12.md.bak
file_issue "P1-12" "UI: BOQ-upload page with pack-contributed KitchenSpecTab" "$TMPDIR/P1-12.md" "phase:1,type:hitl,area:frontend,pack:kitchen-equipment"

# ----- P1-14: Cross-tenant isolation test suite: parameterised baseline -----
cat > $TMPDIR/P1-14.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** tests

**PRD user stories:** #4

**Ships:** A parameterised test pattern that runs against every list/fetch endpoint, proving cross-tenant isolation. Baseline covers the Phase 1 endpoints; the same pattern is reused in every subsequent phase.

## Acceptance criteria

- [ ] Test fixture seeds 2 tenants, each with distinct CustomerRequirements.
- [ ] For every list endpoint: a session in tenant A returns only tenant A rows.
- [ ] For every fetch-by-id endpoint: a session in tenant A requesting a tenant B id returns 404 (not 403).
- [ ] New endpoints added in later phases auto-register into this suite (endpoint-discovery-driven, not hand-authored per-endpoint).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-08" "P1-11")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-14.md && rm $TMPDIR/P1-14.md.bak
file_issue "P1-14" "Cross-tenant isolation test suite: parameterised baseline" "$TMPDIR/P1-14.md" "phase:1,type:afk,area:test,area:security"

# ----- P2-05: API Gateway: GraphQL, per-tenant rate limiting, correlation IDs, standard error envelope -----
cat > $TMPDIR/P2-05.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** API, service, tests

**PRD user stories:** #4

**Ships:** API Gateway moves from 'one REST endpoint' to production: GraphQL alongside REST, per-tenant rate limits, correlation IDs on every request, standard error envelope on every endpoint.

## Acceptance criteria

- [ ] GraphQL endpoint serves the same schema as REST (generated from a shared source of truth); CRUD works.
- [ ] Per-tenant rate limiting: configurable limits; exceeding returns 429 with clear Retry-After header.
- [ ] Every request carries a correlation_id (generated or propagated from header); all logs for the request carry it.
- [ ] Standard error envelope on every endpoint: { error_code, message, details, correlation_id }.
- [ ] Idempotency-Key header supported on all write endpoints.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-11")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-05.md && rm $TMPDIR/P2-05.md.bak
file_issue "P2-05" "API Gateway: GraphQL, per-tenant rate limiting, correlation IDs, standard error envelope" "$TMPDIR/P2-05.md" "phase:2,type:afk,area:platform,area:api-gateway"

# ----- P3-02: Core module: CRM (leads, opportunities, contacts, accounts) -----
cat > $TMPDIR/P3-02.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** Fully industry-agnostic CRM. No kitchen taxonomy in core.

## Acceptance criteria

- [ ] Entities: Lead, Opportunity, Contact, Account; standard state transitions; full CRUD APIs.
- [ ] Search across all four entities via Reporting Fabric query layer.
- [ ] Opportunity → Quotation handoff to Sales module is event-driven (no direct coupling).
- [ ] kitchen-concept-finder linter confirms no references to fascia/cladding/BOQ/NSF in CRM code.
- [ ] Module-specific tests green; cross-tenant isolation test extended to CRM endpoints.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-01" "P2-10")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-02.md && rm $TMPDIR/P3-02.md.bak
file_issue "P3-02" "Core module: CRM (leads, opportunities, contacts, accounts)" "$TMPDIR/P3-02.md" "phase:3,type:afk,area:core,module:crm"

# ----- P3-06: Core module: Procurement (RFQ, PO, GRN, supplier master, approvals) -----
cat > $TMPDIR/P3-06.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** Full Procurement module with RFQ, Purchase Order, Goods Receipt Note, Supplier master, all approvals routed through Workflow Engine.

## Acceptance criteria

- [ ] Entities: Supplier, RFQ, PurchaseOrder, GoodsReceiptNote; state machines in Workflow Engine.
- [ ] PO approval workflow uses configurable thresholds; approval chain supports parallel + sequential.
- [ ] GRN creates inventory transactions (via P3-07) and emits events consumable by Finance.
- [ ] Supplier portal extension hook declared (actual portal is later scope).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-07" "P3-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-06.md && rm $TMPDIR/P3-06.md.bak
file_issue "P3-06" "Core module: Procurement (RFQ, PO, GRN, supplier master, approvals)" "$TMPDIR/P3-06.md" "phase:3,type:afk,area:core,module:procurement"

# ----- P3-07: Core module: Inventory/Stores with full lot/batch/serial genealogy -----
cat > $TMPDIR/P3-07.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**PRD user stories:** #8

**Ships:** Inventory module with Item lifecycle, stock transactions, valuation methods, UoM conversion matrix, and the full forward-and-backward traceability from supplier lot through shipment.

## Acceptance criteria

- [ ] Item Master matches PRD Story 6 schema: item_type, valuation_method, tracking_method, UoM, extensible_attributes JSONB.
- [ ] Lot, Batch, Serial entities with parent-child genealogy edges.
- [ ] Forward-trace: from supplier lot, return every WO and shipment consuming it.
- [ ] Backward-trace: from customer shipment, return full chain back to supplier lot.
- [ ] UoM conversion matrix validated against fixtures; unknown conversions return clear errors.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-07.md && rm $TMPDIR/P3-07.md.bak
file_issue "P3-07" "Core module: Inventory/Stores with full lot/batch/serial genealogy" "$TMPDIR/P3-07.md" "phase:3,type:afk,area:core,module:inventory"

# ----- P3-09: Core module: Project Management (WBS, milestones, resource allocation) -----
cat > $TMPDIR/P3-09.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** Project Management foundation that ETO mode's project-based work orders and Phase 4's Commissioning module build on.

## Acceptance criteria

- [ ] Entities: Project, WBS, Milestone, Task, ResourceAllocation.
- [ ] Project cost tracking rolls up to Finance (stub for v1; deep costing stays folded in Finance per Q8).
- [ ] Milestone billing schedule hook declared for ETO mode to extend.
- [ ] Gantt-style visualisation in UI for v1.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-09.md && rm $TMPDIR/P3-09.md.bak
file_issue "P3-09" "Core module: Project Management (WBS, milestones, resource allocation)" "$TMPDIR/P3-09.md" "phase:3,type:afk,area:core,module:project"

# ----- P3-10: Core module: Human Resources (employee master, org structure, role-to-user mapping) -----
cat > $TMPDIR/P3-10.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** HR v1 scope: employee master, org structure, role-to-user mapping consumed by Identity. Payroll, T&A, performance, LMS are deferred.

## Acceptance criteria

- [ ] Employee entity with PII fields clearly marked; GDPR right-to-erasure and right-to-access APIs wired.
- [ ] Org structure: positions, reporting lines; versioned over time.
- [ ] Role-to-user mapping populates Identity service's permission tree.
- [ ] Consent-capture placeholder field per PRD compliance section.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-01" "P3-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-10.md && rm $TMPDIR/P3-10.md.bak
file_issue "P3-10" "Core module: Human Resources (employee master, org structure, role-to-user mapping)" "$TMPDIR/P3-10.md" "phase:3,type:afk,area:core,module:hr"

# ----- P3-04: Core module: PLM (Part Master, revision control, ECR/ECO/ECN, drawing vault) -----
cat > $TMPDIR/P3-04.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** Full PLM module: Part Master with revision control, engineering-BOM vs manufacturing-BOM, ECR → ECO → ECN workflow, where-used analysis, drawing vault tied to Document Store, alternates/substitutes, variant BOM.

## Acceptance criteria

- [ ] Part Master supports revisions with effective-dates; prior revisions remain queryable.
- [ ] EBOM and MBOM are distinct structures; conversion rules documented and tested.
- [ ] ECR → ECO → ECN workflow runs through Workflow Engine; approvals configurable per tenant.
- [ ] Where-used query: given a Part id, return every BOM referencing it, with revision.
- [ ] Drawing vault integrated with Document Store (P2-08); drawing search via OCR.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-08" "P3-01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-04.md && rm $TMPDIR/P3-04.md.bak
file_issue "P3-04" "Core module: PLM (Part Master, revision control, ECR/ECO/ECN, drawing vault)" "$TMPDIR/P3-04.md" "phase:3,type:afk,area:core,module:plm"

# ----- P1-13: Tracer-bullet integration test: end-to-end BOQ → parse → audit → event → two packs -----
cat > $TMPDIR/P1-13.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 1

**Layers touched:** tests

**PRD user stories:** #3, #13, #14

**Ships:** The one test that says 'Phase 1 is done': drives the full stack from HTTP POST through parse, audit, event bus, and both pack receivers.

## Acceptance criteria

- [ ] Test runs against a seeded database with 2 tenants and KitchenEquipment + TestIndustry packs activated.
- [ ] Authenticated POST to /api/v1/customer-requirements with boq_import payload succeeds.
- [ ] Post-conditions verified: 2 parsed lines stored with fascia_type and cladding_type; audit log has entries for core writes AND pack-parser writes with correct layer attribution; TestIndustry subscriber received the event; cross-tenant read of the new CR returns 404.
- [ ] Test runs in CI on every PR; failure blocks merge.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P1-09" "P1-10" "P1-11" "P1-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P1-13.md && rm $TMPDIR/P1-13.md.bak
file_issue "P1-13" "Tracer-bullet integration test: end-to-end BOQ → parse → audit → event → two packs" "$TMPDIR/P1-13.md" "phase:1,type:afk,area:test,phase-gate"

# ----- P2-13: Observability: structured logs with layer attribution, metrics, tracing, alert rules -----
cat > $TMPDIR/P2-13.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 2

**Layers touched:** service, tests

**Ships:** Every service emits structured logs with layer attribution; per-module metrics expose operation counts and latencies; distributed tracing crosses Celery boundaries; alert rules fire on the PRD-named conditions.

## Acceptance criteria

- [ ] Every log line carries: timestamp, correlation_id, tenant_id, actor_id, operation, layer (platform/core/mode/compliance/pack), module, duration_ms, outcome.
- [ ] Metrics: per-module operation counters + latency histograms; pack-specific metrics namespaced by pack id.
- [ ] Distributed tracing propagates correlation context across HTTP and Celery boundaries.
- [ ] Alert rules configured for: DLQ depth > threshold, hash-chain verification failure, cross-tenant query attempt, pack activation rollback, p95 latency SLO breach, pack-attributed error rate SLO breach (separate from core).
- [ ] Chaos test: trigger each alert deliberately; verify alert fires within its SLO.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-04" "P2-05" "P2-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P2-13.md && rm $TMPDIR/P2-13.md.bak
file_issue "P2-13" "Observability: structured logs with layer attribution, metrics, tracing, alert rules" "$TMPDIR/P2-13.md" "phase:2,type:afk,area:platform,area:observability"

# ----- P5-10: Security hardening: pen test, red-team on top-3 threats, OAuth2 rotation, encryption verification -----
cat > $TMPDIR/P5-10.md <<'__ISSUE_BODY__'
**Type:** HITL — Pen test results and red-team findings require human triage and mitigation decisions.

**Phase:** 5

**Layers touched:** tests

**Ships:** Third-party penetration test pass; top-3 PRD threats verified by red-team; OAuth2 credentials rotation tested; encryption at rest + in transit verified.

## Acceptance criteria

- [ ] Pen test performed by agreed third party; all critical findings remediated.
- [ ] Red-team exercise on cross-tenant leak, leaky-pack core write, audit tampering (PRD top-3); each mitigation proven.
- [ ] OAuth2 client-credentials rotation drill completes without downtime.
- [ ] Encryption at rest (AES-256) + in transit (TLS 1.2+, 1.3 preferred) verified.
- [ ] MFA enforcement on admin roles re-verified post-hardening.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-01" "P2-03" "P2-05")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-10.md && rm $TMPDIR/P5-10.md.bak
file_issue "P5-10" "Security hardening: pen test, red-team on top-3 threats, OAuth2 rotation, encryption verification" "$TMPDIR/P5-10.md" "phase:5,type:hitl,area:security,phase-gate"

# ----- P3-03: Core module: Sales with CPQ folded in, full source_type handling, mode-aware behaviour -----
cat > $TMPDIR/P3-03.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**PRD user stories:** #6, #9, #14

**Ships:** Sales module with Quotation, SalesOrder, and CPQ (folded in per PRD Q8). Handles full source_type enum; behaviour branches on manufacturing_mode.

## Acceptance criteria

- [ ] Entities: Quotation, SalesOrder, CPQ configuration (embedded in Sales for v1).
- [ ] CustomerRequirement full source_type set wired: boq_import invokes KitchenEquipment pack parser; others handled in core.
- [ ] QuotationApproval workflow runs through Workflow Engine; KitchenEquipment's finishing_review_step shows up at the named insertion point when pack is active.
- [ ] Mode-aware: ETO-mode quotations have Design Lock affordance after commit; non-ETO modes do not.
- [ ] Cross-tenant and kitchen-concept-finder linters green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-02" "P2-10")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-03.md && rm $TMPDIR/P3-03.md.bak
file_issue "P3-03" "Core module: Sales with CPQ folded in, full source_type handling, mode-aware behaviour" "$TMPDIR/P3-03.md" "phase:3,type:afk,area:core,module:sales"

# ----- P4-M01: Migration: CRM (current → layered architecture with 30-day reverse path) -----
cat > $TMPDIR/P4-M01.md <<'__ISSUE_BODY__'
**Type:** HITL — Production cutover window requires operations sign-off; parallel-run duration needs B3 MACBIS agreement.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** CRM data moves from current shape to layered-architecture CRM. Staging validated, parallel-run window, cutover, 30-day reverse path open.

## Acceptance criteria

- [ ] Staging migration runs without data loss against a copy of production.
- [ ] Regression harness (P3-15) green post-migration in staging.
- [ ] Parallel-run window agreed with B3 MACBIS; cutover scheduled.
- [ ] Reverse-migration script tested in staging; remains runnable for 30 days post-cutover.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M01.md && rm $TMPDIR/P4-M01.md.bak
file_issue "P4-M01" "Migration: CRM (current → layered architecture with 30-day reverse path)" "$TMPDIR/P4-M01.md" "phase:4,type:hitl,area:migration,module:crm"

# ----- P3-08: Core module: Warehouse Management with bin-level locations and RF workflows -----
cat > $TMPDIR/P3-08.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, tests

**Ships:** WMS depth: bin-level locations, putaway/pick strategies (wave / zone / batch / cluster), cycle counting, cross-docking, FEFO, kitting, RF/handheld workflow endpoints, yard management.

## Acceptance criteria

- [ ] Hierarchical location model: warehouse → zone → aisle → rack → bin.
- [ ] Putaway strategies and pick strategies are configurable per zone.
- [ ] FEFO enforcement: for lot-tracked items, oldest-expiry picks first unless overridden with reason code.
- [ ] RF endpoints return minimal-payload responses suitable for handheld scanners (native app scope is PRD-out).
- [ ] Cycle counting plan generator + execution + reconciliation flow.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-08.md && rm $TMPDIR/P3-08.md.bak
file_issue "P3-08" "Core module: Warehouse Management with bin-level locations and RF workflows" "$TMPDIR/P3-08.md" "phase:3,type:afk,area:core,module:wms"

# ----- P4-04: Core module: Asset/CMMS/EAM (asset register, PM, PdM, maintenance WO, MTBF/MTTR/OEE, PTW) -----
cat > $TMPDIR/P4-04.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** CMMS module replacing the current ppg-maintenance stub: asset register with hierarchy/criticality, PM (time/meter/condition), PdM hooks for IoT, maintenance work orders, spare parts tie-in, MTBF/MTTR/OEE, Permit-to-Work.

## Acceptance criteria

- [ ] Asset hierarchy + criticality class; parent-child rollups for downtime.
- [ ] PM schedules: time-based, meter-based, condition-based; generate maintenance WOs automatically.
- [ ] PdM extension hooks for IoT telemetry ingestion via Integration Fabric.
- [ ] Spare parts consumption from Inventory (P3-07); MTBF/MTTR calculated from event stream.
- [ ] Permit-to-Work workflow gates risky maintenance operations.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-04.md && rm $TMPDIR/P4-04.md.bak
file_issue "P4-04" "Core module: Asset/CMMS/EAM (asset register, PM, PdM, maintenance WO, MTBF/MTTR/OEE, PTW)" "$TMPDIR/P4-04.md" "phase:4,type:afk,area:core,module:cmms"

# ----- P3-11: Core module: IT & Admin Services (tenant admin surfaces, user admin) -----
cat > $TMPDIR/P3-11.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** service, API, UI, tests

**PRD user stories:** #16

**Ships:** Admin UI that consumes platform Identity + Tenancy: tenant admin can manage users, assign roles, activate/deactivate packs on their tenant.

## Acceptance criteria

- [ ] Tenant admin can: invite user, assign role, revoke access, view audit for their tenant.
- [ ] Pack activation UI shows extension-point dry-run summary before committing (per P2-02 AC).
- [ ] Cross-tenant admin is impossible: even a platform 'super-admin' must explicitly assume a tenant context, logged in audit.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-10" "P2-02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-11.md && rm $TMPDIR/P3-11.md.bak
file_issue "P3-11" "Core module: IT & Admin Services (tenant admin surfaces, user admin)" "$TMPDIR/P3-11.md" "phase:3,type:afk,area:core,module:it-admin"

# ----- P5-12: Operator runbook: pack activation, tenant provisioning, incident response, restore, migration reversal -----
cat > $TMPDIR/P5-12.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** docs

**Ships:** Complete operator runbook covering every operational procedure with named owner per section.

## Acceptance criteria

- [ ] Sections exist for: pack activation/deactivation, tenant provisioning, alert-by-alert response, restore-from-backup, migration reversal.
- [ ] Each section has a named owner.
- [ ] Runbook tested in a tabletop exercise with the ops team.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-02" "P2-13" "P5-06")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-12.md && rm $TMPDIR/P5-12.md.bak
file_issue "P5-12" "Operator runbook: pack activation, tenant provisioning, incident response, restore, migration reversal" "$TMPDIR/P5-12.md" "phase:5,type:afk,area:docs,area:ops"

# ----- P3-05: Core module: S&OP & Demand Planning (statistical forecasting, MPS, RCCP, ATP/CTP, consensus cycle) -----
cat > $TMPDIR/P3-05.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**Ships:** S&OP module at v1 scope: statistical forecasting only (ML forecasting is PRD-out-of-scope), MPS, RCCP, ATP/CTP, consensus-cycle workflow. Deep MRP lives in Phase 4's Production Planning.

## Acceptance criteria

- [ ] Forecast model library: moving average, exponential smoothing, linear regression — no ML.
- [ ] MPS generates master schedules; RCCP validates against work-center capacity.
- [ ] ATP / CTP queries return promise dates against current inventory + MPS.
- [ ] S&OP consensus cycle workflow drives periodic review involving demand, supply, and finance views.
- [ ] All export formats (Reporting Fabric) covered.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-03")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-05.md && rm $TMPDIR/P3-05.md.bak
file_issue "P3-05" "Core module: S&OP & Demand Planning (statistical forecasting, MPS, RCCP, ATP/CTP, consensus cycle)" "$TMPDIR/P3-05.md" "phase:3,type:afk,area:core,module:sop"

# ----- P3-12: Mode extension: ETO (Design Lock, Change Order with cost impact, project-WO, milestone billing, retention, LD, site survey) -----
cat > $TMPDIR/P3-12.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** schema, service, API, UI, tests

**PRD user stories:** #11, #12

**Ships:** The real ETO mode extension: all ETO-specific masters and workflows live here, not in core.

## Acceptance criteria

- [ ] Design Lock: after a sales order commits, core entities referenced by the SO are flagged locked; changes require ECO.
- [ ] Change Order: captures scope/time/cost impact; routes through ECO workflow; Finance receives impact events.
- [ ] Project-based Work Order: WorkOrder references a Project; lifecycle gated on project milestones.
- [ ] Milestone billing schema lives in the ETO mode extension, not core Finance; Finance consumes via event.
- [ ] Retention, Liquidated Damages, Site Survey entities shipped and integration-tested with Sales + Project.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-03" "P3-09" "P2-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-12.md && rm $TMPDIR/P3-12.md.bak
file_issue "P3-12" "Mode extension: ETO (Design Lock, Change Order with cost impact, project-WO, milestone billing, retention, LD, site survey)" "$TMPDIR/P3-12.md" "phase:3,type:afk,area:mode,mode:eto"

# ----- P4-05: Core module: EHS (incidents, HIRA/JSA, PTW, PPE, hazmat/SDS, env monitoring, training, MoC) -----
cat > $TMPDIR/P4-05.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** EHS module covering incident management, hazard analysis, PTW (coordinated with CMMS PTW), PPE, hazmat/SDS, environmental monitoring, safety training, Management of Change.

## Acceptance criteria

- [ ] Incident lifecycle: report → investigate → corrective actions → close; links to QMS CAPA.
- [ ] HIRA / JSA templates per work type; reviewed periodically.
- [ ] Hazmat / SDS registry with expiry alerts.
- [ ] Training records per employee per hazard; expiry drives Notification.
- [ ] Management of Change workflow for plant / process changes affecting safety.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-05.md && rm $TMPDIR/P4-05.md.bak
file_issue "P4-05" "Core module: EHS (incidents, HIRA/JSA, PTW, PPE, hazmat/SDS, env monitoring, training, MoC)" "$TMPDIR/P4-05.md" "phase:4,type:afk,area:core,module:ehs"

# ----- P5-13: Rollback drill: reverse-migrate one module in staging within committed time budget -----
cat > $TMPDIR/P5-13.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** tests

**Ships:** A deliberate rollback of one already-migrated module in staging using the PRD's reverse-migration path; confirms no data loss and time budget.

## Acceptance criteria

- [ ] Pick one migrated module (e.g., Procurement); execute reverse migration in staging.
- [ ] Zero data loss verified via reconciliation.
- [ ] Elapsed time within the B3 MACBIS-agreed rollback budget.
- [ ] Findings, if any, fed back into P5-12 runbook.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P5-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-13.md && rm $TMPDIR/P5-13.md.bak
file_issue "P5-13" "Rollback drill: reverse-migrate one module in staging within committed time budget" "$TMPDIR/P5-13.md" "phase:5,type:afk,area:test,area:migration"

# ----- P4-01: Core module: Production Planning with MRP deep-run and Routing folded in -----
cat > $TMPDIR/P4-01.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**PRD user stories:** #7, #11

**Ships:** Production Planning: full MRP deep-run, Routing (folded in per Q8), capacity planning against routings, work order release. Integrates with S&OP from Phase 3.

## Acceptance criteria

- [ ] Routing entity with operations, work-centers, setup/run/labor/tools/QC-gates per PRD Story 7.
- [ ] MRP run on a 10,000-item catalogue completes under 60 seconds per the NFR.
- [ ] Capacity planning consumes routings; CRP output feeds back to S&OP.
- [ ] Work order release creates MES-ready work orders (consumed by P4-02).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-05" "P3-07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-01.md && rm $TMPDIR/P4-01.md.bak
file_issue "P4-01" "Core module: Production Planning with MRP deep-run and Routing folded in" "$TMPDIR/P4-01.md" "phase:4,type:afk,area:core,module:production-planning"

# ----- P3-13: Mode registry: scaffold Process, Job-Shop, Repetitive, mixed with rejection path -----
cat > $TMPDIR/P3-13.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** service, API, tests

**PRD user stories:** #11

**Ships:** Scaffolded modes exist in the mode registry; attempts to activate return the PRD-specified error and link to the compatibility matrix.

## Acceptance criteria

- [ ] Enum values present: eto, discrete, process, job_shop, repetitive, mixed.
- [ ] Activation of process / job_shop / repetitive / mixed returns 'mode not available in this release' with a link to the docs page.
- [ ] UI does not offer scaffolded modes as selectable options on config screens.
- [ ] Rejection is uniform across API, UI, and tenant-provisioning surfaces.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-13.md && rm $TMPDIR/P3-13.md.bak
file_issue "P3-13" "Mode registry: scaffold Process, Job-Shop, Repetitive, mixed with rejection path" "$TMPDIR/P3-13.md" "phase:3,type:afk,area:mode,area:scaffolding"

# ----- P3-14: KitchenEquipment pack: demand & design half parity (BOQ parser, taxonomy seeds, finishing-review step, Item tabs, NSF validators) -----
cat > $TMPDIR/P3-14.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 3

**Layers touched:** pack, service, API, UI, tests

**PRD user stories:** #13, #14

**Ships:** KitchenEquipment grows from Phase 1 stub to demand+design parity: real BOQ parser, seeded taxonomy, seeded BOQ templates, finishing-cost calculator, Item.detail KitchenSpecTab, QuotationApproval finishing_review_step, NSF validators (pack-internal, not Layer 4).

## Acceptance criteria

- [ ] Real BOQ parser handles a documented file format with row/column error reporting.
- [ ] Taxonomy seeded per tenant on activation: cooking / refrigeration / food_prep / washing / ventilation / storage.
- [ ] BOQ templates seeded: restaurant / hospital / food_court / corporate.
- [ ] Finishing-cost calculator registers into costing roll-up (core Finance calls pack-registered calculator).
- [ ] Item.detail KitchenSpecTab renders for kitchen-scoped items only; absent when pack deactivated.
- [ ] NSF-ANSI compliance rules run as pack-internal validators on save of kitchen-scoped items and quotations.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-03" "P3-07" "P3-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-14.md && rm $TMPDIR/P3-14.md.bak
file_issue "P3-14" "KitchenEquipment pack: demand & design half parity (BOQ parser, taxonomy seeds, finishing-review step, Item tabs, NSF validators)" "$TMPDIR/P3-14.md" "phase:3,type:afk,area:pack,pack:kitchen-equipment"

# ----- P4-08: Core module: Finance (GL, AP, AR, bank rec, cost centers, multi-currency, tax-engine hook, IFRS 15/ASC 606 for milestone billing) -----
cat > $TMPDIR/P4-08.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Finance core: GL, AP, AR, bank reconciliation, cost centers, profit centers. Costing + Estimation stay folded in per Q8. Multi-currency basics. Tax-engine extension hook for future localisation packs. IFRS 15 / ASC 606 revenue recognition tied to ETO mode's milestone billing.

## Acceptance criteria

- [ ] GL with period-end close workflow; AP with 3-way match; AR with aging; bank reconciliation.
- [ ] Multi-currency: daily rates, revaluation at period end, gain/loss posted correctly.
- [ ] Tax engine exposes extension hook; no country-specific rules baked in (localisation packs author them later).
- [ ] Revenue recognition engine handles milestone-based contracts from ETO mode; five-step IFRS 15 model implemented.
- [ ] Finishing-cost calculator (P3-14) is invoked during costing roll-up via pack registration, not direct import.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-06" "P3-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-08.md && rm $TMPDIR/P4-08.md.bak
file_issue "P4-08" "Core module: Finance (GL, AP, AR, bank rec, cost centers, multi-currency, tax-engine hook, IFRS 15/ASC 606 for milestone billing)" "$TMPDIR/P4-08.md" "phase:4,type:afk,area:core,module:finance"

# ----- P4-02: Core module: Manufacturing Execution (MES) with OEE, ANDON, PLC/SCADA protocols -----
cat > $TMPDIR/P4-02.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** MES module: operator clock-in on operation, job dispatch list, scrap/rework/yield capture, ANDON, OEE, downtime reason codes, EBR scaffolding (Process mode), eDHR scaffolding (medical devices), OPC-UA / MQTT / Modbus connectors via Integration Fabric.

## Acceptance criteria

- [ ] Operator clock-in / clock-out tied to operation instance; labor time rolls up to costing.
- [ ] Real-time dispatch list for a work center; updates when orders change.
- [ ] Scrap, rework, yield captured per operation; feeds OEE calculation.
- [ ] OPC-UA / MQTT / Modbus connector stubs register via Integration Fabric; dummy device fixture drives an end-to-end test.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-01" "P2-06")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-02.md && rm $TMPDIR/P4-02.md.bak
file_issue "P4-02" "Core module: Manufacturing Execution (MES) with OEE, ANDON, PLC/SCADA protocols" "$TMPDIR/P4-02.md" "phase:4,type:afk,area:core,module:mes"

# ----- P5-01: Scaffolded-mode rejection: automated tests across API, UI, provisioning -----
cat > $TMPDIR/P5-01.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** tests

**PRD user stories:** #11

**Ships:** Automated verification per scaffolded mode that 'mode not available in this release' fires uniformly at every surface.

## Acceptance criteria

- [ ] Per mode (process / job_shop / repetitive / mixed): API activation attempt returns the PRD-defined error with compatibility-matrix link.
- [ ] UI does not offer the scaffolded mode as a selectable option.
- [ ] Tenant provisioning rejects activation of scaffolded modes with the same error.
- [ ] Tests run in CI.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-13")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-01.md && rm $TMPDIR/P5-01.md.bak
file_issue "P5-01" "Scaffolded-mode rejection: automated tests across API, UI, provisioning" "$TMPDIR/P5-01.md" "phase:5,type:afk,area:test,area:scaffolding"

# ----- P5-05: Mode-pair migration playbook (ETO+Discrete → add Process) with staging dry-run -----
cat > $TMPDIR/P5-05.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** docs, tests

**Ships:** A written playbook for how a future customer adds Process mode on top of existing ETO+Discrete data, dry-run on staging.

## Acceptance criteria

- [ ] Playbook documents the migration sequence: mode activation → schema migration → lazy attribute backfill.
- [ ] Dry-run succeeds on staging data; before/after state captured.
- [ ] Playbook linked from the /docs/migration/ index.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-13")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-05.md && rm $TMPDIR/P5-05.md.bak
file_issue "P5-05" "Mode-pair migration playbook (ETO+Discrete → add Process) with staging dry-run" "$TMPDIR/P5-05.md" "phase:5,type:afk,area:docs,area:migration"

# ----- P3-15: ACERO regression harness: author or adapt existing, wire for demand-half coverage -----
cat > $TMPDIR/P3-15.md <<'__ISSUE_BODY__'
**Type:** HITL — PRD Open #6 — we do not yet know if the suite exists. If it does, it needs adaptation; if not, authoring is a substantial undertaking.

**Phase:** 3

**Layers touched:** tests

**Ships:** The B3 MACBIS ACERO 8-phase / 65-step / 6-gate / 8-KPI regression suite adapted (or authored) to run against the new shape, covering the demand-half happy path end-to-end.

## Acceptance criteria

- [ ] Checklist of the 8 phases, 65 steps, 6 gates, 8 KPIs agreed with B3 MACBIS ops.
- [ ] Test cases for every demand-half step exist and are green on the new layered architecture.
- [ ] Suite runs in CI on a schedule (nightly) and on release candidates.
- [ ] Failure diagnostics name the exact ACERO step that broke and link to the related module / pack.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-14")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P3-15.md && rm $TMPDIR/P3-15.md.bak
file_issue "P3-15" "ACERO regression harness: author or adapt existing, wire for demand-half coverage" "$TMPDIR/P3-15.md" "phase:3,type:hitl,area:test,phase-gate,risk:prd-open-6"

# ----- P4-M02: Migration: Sales -----
cat > $TMPDIR/P4-M02.md <<'__ISSUE_BODY__'
**Type:** HITL — Same as P4-M01 — cutover window + parallel-run needs ops agreement.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Sales data (quotations, sales orders) moves to layered shape; kitchen-specific fields land in pack extensible_attributes.

## Acceptance criteria

- [ ] Kitchen-specific attributes in existing Sales records correctly relocated to KitchenEquipment pack's extensible_attributes.
- [ ] Existing BOQ-sourced records stay queryable with source_type=boq_import.
- [ ] Regression harness green; reverse path tested.
- [ ] 30-day reverse window maintained.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-03" "P3-14" "P4-M01")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M02.md && rm $TMPDIR/P4-M02.md.bak
file_issue "P4-M02" "Migration: Sales" "$TMPDIR/P4-M02.md" "phase:4,type:hitl,area:migration,module:sales"

# ----- P4-03: Core module: QMS (IQC/IPQC/OQC, NCR, CAPA, SCAR, SPC, calibration, audit, document control, change control) -----
cat > $TMPDIR/P4-03.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Full QMS module. Document control integrates with Document Store; change control integrates with PLM.

## Acceptance criteria

- [ ] Inspection plans run at IQC/IPQC/OQC gates; results drive workflow transitions.
- [ ] NCR → CAPA → SCAR chain with full audit trail; electronic-signature readiness flags (P1-04 reason_for_change).
- [ ] SPC charts for configured metrics; out-of-control signals raise events.
- [ ] Calibration tracker per equipment with expiry alerts through Notification service.
- [ ] Document control routes SOP updates through approval; integrates with Document Store versioning.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-02" "P3-04" "P2-08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-03.md && rm $TMPDIR/P4-03.md.bak
file_issue "P4-03" "Core module: QMS (IQC/IPQC/OQC, NCR, CAPA, SCAR, SPC, calibration, audit, document control, change control)" "$TMPDIR/P4-03.md" "phase:4,type:afk,area:core,module:qms"

# ----- P4-11: Core module: Analytics & BI (unified warehouse, semantic layer, per-module dashboards, embedded hooks) -----
cat > $TMPDIR/P4-11.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, UI, tests

**Ships:** Analytics module promoted from feature to first-class module: unified data warehouse / semantic layer, role-specific pre-built dashboards for each core module, embedded analytics hooks.

## Acceptance criteria

- [ ] ETL/ELT pipeline materialises a reporting-shape schema from OLTP with configured lag.
- [ ] Semantic layer exposes dimensions + measures used by dashboards.
- [ ] Dashboards per role: Sales, Production, Quality, Finance, Field Service — each tenant-scoped.
- [ ] Embedded analytics hook: any core screen can embed a dashboard via a declared slot.
- [ ] NL query and predictive analytics are explicitly out (PRD).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-01" "P4-02" "P4-08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-11.md && rm $TMPDIR/P4-11.md.bak
file_issue "P4-11" "Core module: Analytics & BI (unified warehouse, semantic layer, per-module dashboards, embedded hooks)" "$TMPDIR/P4-11.md" "phase:4,type:afk,area:core,module:analytics"

# ----- P4-M03: Migration: Estimation & Costing (into Finance per Q8) -----
cat > $TMPDIR/P4-M03.md <<'__ISSUE_BODY__'
**Type:** HITL — Cost data migrations are high-risk; Finance ops sign-off required.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Estimation & Costing data lands in Finance (Costing folded in per Q8); finishing-cost calculations re-attached via pack.

## Acceptance criteria

- [ ] All historical cost records preserved and reconcile against Finance GL.
- [ ] Finishing-cost calculator invocations produce equivalent results to current Estimation output on fixture data.
- [ ] Regression harness green; reverse path tested.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-08" "P4-M02")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M03.md && rm $TMPDIR/P4-M03.md.bak
file_issue "P4-M03" "Migration: Estimation & Costing (into Finance per Q8)" "$TMPDIR/P4-M03.md" "phase:4,type:hitl,area:migration,module:finance"

# ----- P4-06: Core module: Field Service / Aftermarket (installed base, warranty, AMC/SLA, dispatch, RMA) -----
cat > $TMPDIR/P4-06.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Field Service module: installed base, warranty, AMC/SLA contracts, dispatch with skills/location, technician-mobile surface with offline support, parts-in-truck, depot repair, aftermarket parts sales, RMA integrated with warranty.

## Acceptance criteria

- [ ] Installed Base entity; populated at handover from Commissioning module (P4-07).
- [ ] AMC / warranty contracts with SLA clocks; SLA breach raises Notification.
- [ ] Dispatch algorithm considers skill match + location + availability.
- [ ] Technician mobile API is offline-sync-friendly (native app is out-of-scope per PRD).
- [ ] RMA flow integrates with warranty eligibility.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-03" "P3-09")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-06.md && rm $TMPDIR/P4-06.md.bak
file_issue "P4-06" "Core module: Field Service / Aftermarket (installed base, warranty, AMC/SLA, dispatch, RMA)" "$TMPDIR/P4-06.md" "phase:4,type:afk,area:core,module:field-service"

# ----- P5-02: Compliance-pack extension hooks verified via throwaway CI pack -----
cat > $TMPDIR/P5-02.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** tests

**PRD user stories:** #17

**Ships:** A throwaway compliance pack built and installed in CI only, exercising document-control / e-signature-gate / validation-lifecycle / training-record / regulatory-reporting hooks. No compliance pack ships to customers.

## Acceptance criteria

- [ ] Throwaway pack uses each of the five compliance-pack hook points without modifying core.
- [ ] CI runs the pack on every release candidate; failure blocks release.
- [ ] Pack is marked explicitly non-shippable; no production-activation path exists.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-10" "P4-03")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-02.md && rm $TMPDIR/P5-02.md.bak
file_issue "P5-02" "Compliance-pack extension hooks verified via throwaway CI pack" "$TMPDIR/P5-02.md" "phase:5,type:afk,area:test,area:compliance"

# ----- P4-M04: Migration: PPG / Production (to Production Planning + MES + CMMS) -----
cat > $TMPDIR/P4-M04.md <<'__ISSUE_BODY__'
**Type:** HITL — Shop-floor cutover risk is high; ops agreement on parallel-run duration is critical.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Production data splits across Production Planning, MES, and CMMS as appropriate; ppg-maintenance stub retires.

## Acceptance criteria

- [ ] Active WOs continue in new shape without interruption.
- [ ] Maintenance records relocate to CMMS.
- [ ] Regression harness green; reverse path tested.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-01" "P4-02" "P4-04" "P4-M03")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M04.md && rm $TMPDIR/P4-M04.md.bak
file_issue "P4-M04" "Migration: PPG / Production (to Production Planning + MES + CMMS)" "$TMPDIR/P4-M04.md" "phase:4,type:hitl,area:migration,module:production"

# ----- P4-07: Core module: Commissioning & Installation (on-site workflow, handover, installed-base creation) -----
cat > $TMPDIR/P4-07.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Commissioning module: on-site commissioning workflow, handover document pack, installed-base creation at handover, warranty/AMC clock start.

## Acceptance criteria

- [ ] Commissioning workflow runs per project milestone; produces handover document pack via Document Store.
- [ ] Handover action creates Installed Base record and triggers warranty/AMC clock in Field Service.
- [ ] KitchenEquipment pack inserts cooking/refrigeration/food-prep/washing/ventilation/storage test protocols at named insertion points (wired in P4-13).

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-06" "P3-09")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-07.md && rm $TMPDIR/P4-07.md.bak
file_issue "P4-07" "Core module: Commissioning & Installation (on-site workflow, handover, installed-base creation)" "$TMPDIR/P4-07.md" "phase:4,type:afk,area:core,module:commissioning"

# ----- P4-09: Core module: Logistics (inward, outward, reverse, carrier connector hooks) -----
cat > $TMPDIR/P4-09.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Logistics module: inward, outward, reverse; carrier-connector extension points (concrete connectors like FedEx depend on PRD Open #3).

## Acceptance criteria

- [ ] Shipment entity + lifecycle covering inward, outward, and reverse flows.
- [ ] Reverse logistics integrated with Field Service RMA.
- [ ] Carrier connector extension point declared; pluggable via Integration Fabric.
- [ ] Documents (waybills, BOLs) generated via Document Store + Reporting Fabric.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-08" "P4-06")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-09.md && rm $TMPDIR/P4-09.md.bak
file_issue "P4-09" "Core module: Logistics (inward, outward, reverse, carrier connector hooks)" "$TMPDIR/P4-09.md" "phase:4,type:afk,area:core,module:logistics"

# ----- P4-10: Core module: Support (customer tickets, KB, Field Service integration) -----
cat > $TMPDIR/P4-10.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** schema, service, API, UI, tests

**Ships:** Support module: customer support tickets, knowledge base, integrated with Field Service for aftermarket issues.

## Acceptance criteria

- [ ] Ticket lifecycle with SLA tracking, routing, escalation through Workflow Engine.
- [ ] Integration with Field Service: aftermarket ticket escalates to a dispatched technician.
- [ ] Knowledge base is a Document Store category with versioning + search.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-06")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-10.md && rm $TMPDIR/P4-10.md.bak
file_issue "P4-10" "Core module: Support (customer tickets, KB, Field Service integration)" "$TMPDIR/P4-10.md" "phase:4,type:afk,area:core,module:support"

# ----- P4-M05: Migration: Procurement -----
cat > $TMPDIR/P4-M05.md <<'__ISSUE_BODY__'
**Type:** HITL — Open POs / GRNs in flight at cutover.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Procurement data moves with in-flight POs preserved.

## Acceptance criteria

- [ ] Open POs continue through their lifecycle without state loss.
- [ ] Supplier master deduplicated.
- [ ] Regression harness green; reverse path tested.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-06" "P4-M04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M05.md && rm $TMPDIR/P4-M05.md.bak
file_issue "P4-M05" "Migration: Procurement" "$TMPDIR/P4-M05.md" "phase:4,type:hitl,area:migration,module:procurement"

# ----- P4-M07: Migration: Projects (PPC) → Project Management + ETO mode -----
cat > $TMPDIR/P4-M07.md <<'__ISSUE_BODY__'
**Type:** HITL — Live projects in flight; milestone state preservation critical.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Projects data splits across Project Management core and ETO mode extensions (milestone billing, retention, LD).

## Acceptance criteria

- [ ] Active projects continue; milestone billing schedules preserved.
- [ ] Retention and LD records migrated into ETO mode entities.
- [ ] Regression harness green; reverse path tested.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-09" "P3-12" "P4-M04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M07.md && rm $TMPDIR/P4-M07.md.bak
file_issue "P4-M07" "Migration: Projects (PPC) → Project Management + ETO mode" "$TMPDIR/P4-M07.md" "phase:4,type:hitl,area:migration,module:project"

# ----- P4-M10: Migration: HRM -----
cat > $TMPDIR/P4-M10.md <<'__ISSUE_BODY__'
**Type:** HITL — Employee PII migration requires privacy review.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** HR data migrates with PII handling reviewed and consent records preserved.

## Acceptance criteria

- [ ] PII fields migrate with GDPR/DPDP handling reviewed.
- [ ] Role assignments populate Identity permission tree correctly.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-10" "P4-M04")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M10.md && rm $TMPDIR/P4-M10.md.bak
file_issue "P4-M10" "Migration: HRM" "$TMPDIR/P4-M10.md" "phase:4,type:hitl,area:migration,module:hr"

# ----- P4-12: KitchenEquipment pack: execution-half parity (FinishingQCPanel, SiteSurveyCapture, QC gates, commissioning protocols, NSF execution rules, warranty report) -----
cat > $TMPDIR/P4-12.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** pack, service, API, UI, tests

**PRD user stories:** #13, #15

**Ships:** KitchenEquipment completes to full B3 MACBIS parity: WorkOrder.floor FinishingQCPanel, Project.site SiteSurveyCapture, WorkOrder finishing_qc_gate + installation_handover_gate, commissioning protocols seeded, restaurant/hospital/food_court/corporate site-survey templates, warranty-registration report, NSF-ANSI execution-half rules.

## Acceptance criteria

- [ ] WorkOrder.floor FinishingQCPanel renders only when pack is active.
- [ ] Project.site SiteSurveyCapture integrated into Commissioning workflow via declared insertion points.
- [ ] finishing_qc_gate and installation_handover_gate inserted into WorkOrder workflow; each has pass/fail/rework paths per pack spec.
- [ ] Commissioning protocols seeded: cooking/refrigeration/food_prep/washing/ventilation/storage.
- [ ] Warranty registration report generates via Reporting Fabric; delivered via Notification.
- [ ] NSF-ANSI execution-half validators fire on finishing QC and commissioning events.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-02" "P4-03" "P4-07" "P3-14")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-12.md && rm $TMPDIR/P4-12.md.bak
file_issue "P4-12" "KitchenEquipment pack: execution-half parity (FinishingQCPanel, SiteSurveyCapture, QC gates, commissioning protocols, NSF execution rules, warranty report)" "$TMPDIR/P4-12.md" "phase:4,type:afk,area:pack,pack:kitchen-equipment"

# ----- P4-M06: Migration: Stores / Warehouse (PPS) → Inventory + WMS -----
cat > $TMPDIR/P4-M06.md <<'__ISSUE_BODY__'
**Type:** HITL — Physical-inventory reconciliation at cutover.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Stores/PPS data splits into Inventory (core) + WMS (depth). Bin-level locations seeded from current shape where available.

## Acceptance criteria

- [ ] Stock balances reconcile to-the-unit against current shape at cutover.
- [ ] Lot/batch/serial history preserved.
- [ ] Regression harness green; reverse path tested.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-07" "P3-08" "P4-M05")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M06.md && rm $TMPDIR/P4-M06.md.bak
file_issue "P4-M06" "Migration: Stores / Warehouse (PPS) → Inventory + WMS" "$TMPDIR/P4-M06.md" "phase:4,type:hitl,area:migration,module:inventory"

# ----- P4-M12: Migration: IT-Admin -----
cat > $TMPDIR/P4-M12.md <<'__ISSUE_BODY__'
**Type:** HITL — Admin/user surface migration affects every user at cutover.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** IT-Admin surfaces replaced with the new Identity + Tenancy-driven admin UI.

## Acceptance criteria

- [ ] All users can log in post-cutover using existing credentials or a documented transition.
- [ ] Roles preserved.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-11" "P4-M10")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M12.md && rm $TMPDIR/P4-M12.md.bak
file_issue "P4-M12" "Migration: IT-Admin" "$TMPDIR/P4-M12.md" "phase:4,type:hitl,area:migration,module:it-admin"

# ----- P4-M09: Migration: Commissioning -----
cat > $TMPDIR/P4-M09.md <<'__ISSUE_BODY__'
**Type:** HITL — On-site commissioning in flight at cutover.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Commissioning data migrates; KitchenEquipment pack's cooking/refrigeration/etc. protocols rehydrate.

## Acceptance criteria

- [ ] On-site commissioning projects in flight continue without data loss.
- [ ] Installed Base correctly populated from historical handovers.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-07" "P4-12" "P4-M07")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M09.md && rm $TMPDIR/P4-M09.md.bak
file_issue "P4-M09" "Migration: Commissioning" "$TMPDIR/P4-M09.md" "phase:4,type:hitl,area:migration,module:commissioning"

# ----- P5-08: Accessibility: WCAG 2.1 AA audit + merge-blocking CI check -----
cat > $TMPDIR/P5-08.md <<'__ISSUE_BODY__'
**Type:** HITL — Accessibility audit needs a human walkthrough with assistive tech; cannot be fully automated.

**Phase:** 5

**Layers touched:** UI, tests

**Ships:** WCAG 2.1 AA audit of every core and KitchenEquipment pack screen; accessibility CI check (axe-core or equivalent) becomes merge-blocking.

## Acceptance criteria

- [ ] External or internal auditor completes WCAG 2.1 AA pass-through; findings triaged.
- [ ] Keyboard-nav and screen-reader paths verified on critical flows (BOQ upload, Design Lock, QC gate, commissioning).
- [ ] CI runs accessibility checks on every PR; failures block merge.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P3-14" "P4-12")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-08.md && rm $TMPDIR/P5-08.md.bak
file_issue "P5-08" "Accessibility: WCAG 2.1 AA audit + merge-blocking CI check" "$TMPDIR/P5-08.md" "phase:5,type:hitl,area:frontend,area:accessibility"

# ----- P4-M08: Migration: Logistics -----
cat > $TMPDIR/P4-M08.md <<'__ISSUE_BODY__'
**Type:** HITL — In-flight shipments.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Logistics data migrates with in-flight shipments preserved.

## Acceptance criteria

- [ ] Active shipments continue in their lifecycle.
- [ ] Reverse-logistics state tied to Field Service RMAs is preserved.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-09" "P4-M06")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M08.md && rm $TMPDIR/P4-M08.md.bak
file_issue "P4-M08" "Migration: Logistics" "$TMPDIR/P4-M08.md" "phase:4,type:hitl,area:migration,module:logistics"

# ----- P4-M11: Migration: Support -----
cat > $TMPDIR/P4-M11.md <<'__ISSUE_BODY__'
**Type:** HITL — Open tickets at cutover.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Support tickets migrate; KB documents move into Document Store.

## Acceptance criteria

- [ ] Open tickets continue in their lifecycle.
- [ ] KB docs searchable via new Document Store + OCR.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-10" "P4-M09")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M11.md && rm $TMPDIR/P4-M11.md.bak
file_issue "P4-M11" "Migration: Support" "$TMPDIR/P4-M11.md" "phase:4,type:hitl,area:migration,module:support"

# ----- P4-M13: Migration: Finance -----
cat > $TMPDIR/P4-M13.md <<'__ISSUE_BODY__'
**Type:** HITL — GL cutover requires accounting sign-off; period-close alignment critical.

**Phase:** 4

**Layers touched:** migration, tests

**Ships:** Finance cutover: GL balances reconcile, AP/AR open items preserved, bank statements continue without reconciliation gap.

## Acceptance criteria

- [ ] Trial balance reconciles across the cutover.
- [ ] Open AP/AR items preserved with aging intact.
- [ ] Period-close workflow completes correctly on the post-cutover period.
- [ ] Regression harness green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-08" "P4-M03" "P4-M05" "P4-M08")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M13.md && rm $TMPDIR/P4-M13.md.bak
file_issue "P4-M13" "Migration: Finance" "$TMPDIR/P4-M13.md" "phase:4,type:hitl,area:migration,module:finance,risk:high"

# ----- P4-M14: Migration: Workflow (definitions + running instances policy) -----
cat > $TMPDIR/P4-M14.md <<'__ISSUE_BODY__'
**Type:** HITL — Running instance preservation policy must be agreed before cutover.

**Phase:** 4

**Layers touched:** migration, tests

**PRD user stories:** #10

**Ships:** Workflow definitions migrate to the new engine's JSON format; running instances complete on their original definition version per PRD policy.

## Acceptance criteria

- [ ] Every active workflow instance completes on the definition version it started with.
- [ ] New workflow starts use the new engine's definitions.
- [ ] Regression harness covering all approval chains green.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P2-07" "P4-M13")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-M14.md && rm $TMPDIR/P4-M14.md.bak
file_issue "P4-M14" "Migration: Workflow (definitions + running instances policy)" "$TMPDIR/P4-M14.md" "phase:4,type:hitl,area:migration,module:workflow"

# ----- P4-FULL-REG: ACERO full regression (execution-half + end-to-end happy path) green -----
cat > $TMPDIR/P4-FULL-REG.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 4

**Layers touched:** tests

**Ships:** The ACERO regression suite from P3-15 extended to cover the full 8-phase / 65-step / 6-gate / 8-KPI path, green on release-candidate builds.

## Acceptance criteria

- [ ] Every ACERO phase/step/gate/KPI has a test case; 100% pass on the release candidate.
- [ ] Full PRD Section 11 happy-path E2E green: lead → CRM → BOQ quotation → configurator → costing → approval → SO → design lock → MRP → WO → MES → QMS → WMS → logistics → commissioning → installed base.
- [ ] Suite runs nightly and on every RC.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-12" "P4-M14")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P4-FULL-REG.md && rm $TMPDIR/P4-FULL-REG.md.bak
file_issue "P4-FULL-REG" "ACERO full regression (execution-half + end-to-end happy path) green" "$TMPDIR/P4-FULL-REG.md" "phase:4,type:afk,area:test,phase-gate"

# ----- P5-03: Second-pack readiness drill: non-kitchen dummy industry pack -----
cat > $TMPDIR/P5-03.md <<'__ISSUE_BODY__'
**Type:** HITL — The drill output is the single most important evidence that the architecture commitment held — needs architect review of the findings.

**Phase:** 5

**Layers touched:** tests, docs

**PRD user stories:** #5

**Ships:** A non-kitchen dummy industry pack (distinct from TestIndustry) authored end-to-end against the current core, proving platform + core do not need changes to accept a second industry. Drill timed and documented.

## Acceptance criteria

- [ ] Dummy industry pack (e.g., 'DemoMachining') composes Discrete mode + its own taxonomy + its own attribute extensions.
- [ ] Pack authored without any change to core or platform code; if a change is needed, it is logged as an architecture finding.
- [ ] Drill completion time measured and recorded.
- [ ] Architecture findings (if any) triaged; blocking findings become new issues.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-FULL-REG")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-03.md && rm $TMPDIR/P5-03.md.bak
file_issue "P5-03" "Second-pack readiness drill: non-kitchen dummy industry pack" "$TMPDIR/P5-03.md" "phase:5,type:hitl,area:test,risk:seam,phase-gate"

# ----- P5-07: Performance + scalability validation against PRD NFRs under realistic load -----
cat > $TMPDIR/P5-07.md <<'__ISSUE_BODY__'
**Type:** AFK

**Phase:** 5

**Layers touched:** tests

**Ships:** Realistic-load validation of every NFR from the PRD: p95 latency, MRP runtime, BOQ parse time, audit write overhead, concurrent tenants, document storage.

## Acceptance criteria

- [ ] Core CRUD p95 < 300ms at 100 concurrent tenant users (PRD NFR).
- [ ] BOQ parse of a 500-line doc < 10s.
- [ ] MRP on 10k-item catalogue < 60s.
- [ ] Audit write adds < 20ms to any mutation.
- [ ] Results captured in /docs/performance/ and form the v1 baseline.

## Blocked by

__BLOCKED_BY_PLACEHOLDER__

_Generated from PRD `./prds/optiforge-layered-multi-industry-architecture.md` and plan `./plans/optiforge-layered-multi-industry-architecture.md`._
__ISSUE_BODY__
BLOCKED_BY_LINE=$(blocked_by_line "P4-FULL-REG")
sed -i.bak "s|__BLOCKED_BY_PLACEHOLDER__|$BLOCKED_BY_LINE|" $TMPDIR/P5-07.md && rm $TMPDIR/P5-07.md.bak
file_issue "P5-07" "Performance + scalability validation against PRD NFRs under realistic load" "$TMPDIR/P5-07.md" "phase:5,type:afk,area:test,area:performance"

echo
echo "All 83 issues filed into $REPO."
