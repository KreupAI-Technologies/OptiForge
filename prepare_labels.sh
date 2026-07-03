#!/usr/bin/env zsh
# Pre-create all labels this issue batch needs, in the target repo.
# Safe to re-run: `gh label create` fails if the label already exists, so we use --force.
set -euo pipefail
REPO="${REPO:-KreupAI-Technologies/OptiForge}"

gh label create "area:accessibility" --repo "$REPO" --color "6b7280" --force
gh label create "area:api-gateway" --repo "$REPO" --color "6b7280" --force
gh label create "area:audit" --repo "$REPO" --color "6b7280" --force
gh label create "area:ci" --repo "$REPO" --color "6b7280" --force
gh label create "area:compliance" --repo "$REPO" --color "6b7280" --force
gh label create "area:core" --repo "$REPO" --color "6b7280" --force
gh label create "area:docs" --repo "$REPO" --color "6b7280" --force
gh label create "area:document-store" --repo "$REPO" --color "6b7280" --force
gh label create "area:events" --repo "$REPO" --color "6b7280" --force
gh label create "area:extension-framework" --repo "$REPO" --color "6b7280" --force
gh label create "area:frontend" --repo "$REPO" --color "6b7280" --force
gh label create "area:identity" --repo "$REPO" --color "6b7280" --force
gh label create "area:integration-fabric" --repo "$REPO" --color "6b7280" --force
gh label create "area:localisation" --repo "$REPO" --color "6b7280" --force
gh label create "area:migration" --repo "$REPO" --color "6b7280" --force
gh label create "area:mode" --repo "$REPO" --color "6b7280" --force
gh label create "area:notification" --repo "$REPO" --color "6b7280" --force
gh label create "area:observability" --repo "$REPO" --color "6b7280" --force
gh label create "area:ops" --repo "$REPO" --color "6b7280" --force
gh label create "area:pack" --repo "$REPO" --color "6b7280" --force
gh label create "area:performance" --repo "$REPO" --color "6b7280" --force
gh label create "area:platform" --repo "$REPO" --color "6b7280" --force
gh label create "area:release-mgmt" --repo "$REPO" --color "6b7280" --force
gh label create "area:reporting" --repo "$REPO" --color "6b7280" --force
gh label create "area:resilience" --repo "$REPO" --color "6b7280" --force
gh label create "area:scaffolding" --repo "$REPO" --color "6b7280" --force
gh label create "area:security" --repo "$REPO" --color "6b7280" --force
gh label create "area:tenancy" --repo "$REPO" --color "6b7280" --force
gh label create "area:test" --repo "$REPO" --color "6b7280" --force
gh label create "area:workflow" --repo "$REPO" --color "6b7280" --force
gh label create "mode:eto" --repo "$REPO" --color "0891b2" --force
gh label create "module:analytics" --repo "$REPO" --color "a855f7" --force
gh label create "module:cmms" --repo "$REPO" --color "a855f7" --force
gh label create "module:commissioning" --repo "$REPO" --color "a855f7" --force
gh label create "module:crm" --repo "$REPO" --color "a855f7" --force
gh label create "module:ehs" --repo "$REPO" --color "a855f7" --force
gh label create "module:field-service" --repo "$REPO" --color "a855f7" --force
gh label create "module:finance" --repo "$REPO" --color "a855f7" --force
gh label create "module:hr" --repo "$REPO" --color "a855f7" --force
gh label create "module:inventory" --repo "$REPO" --color "a855f7" --force
gh label create "module:it-admin" --repo "$REPO" --color "a855f7" --force
gh label create "module:logistics" --repo "$REPO" --color "a855f7" --force
gh label create "module:mes" --repo "$REPO" --color "a855f7" --force
gh label create "module:plm" --repo "$REPO" --color "a855f7" --force
gh label create "module:procurement" --repo "$REPO" --color "a855f7" --force
gh label create "module:production" --repo "$REPO" --color "a855f7" --force
gh label create "module:production-planning" --repo "$REPO" --color "a855f7" --force
gh label create "module:project" --repo "$REPO" --color "a855f7" --force
gh label create "module:qms" --repo "$REPO" --color "a855f7" --force
gh label create "module:sales" --repo "$REPO" --color "a855f7" --force
gh label create "module:sop" --repo "$REPO" --color "a855f7" --force
gh label create "module:support" --repo "$REPO" --color "a855f7" --force
gh label create "module:wms" --repo "$REPO" --color "a855f7" --force
gh label create "module:workflow" --repo "$REPO" --color "a855f7" --force
gh label create "pack:kitchen-equipment" --repo "$REPO" --color "f59e0b" --force
gh label create "pack:test-industry" --repo "$REPO" --color "f59e0b" --force
gh label create "phase-gate" --repo "$REPO" --color "7c3aed" --force
gh label create "phase:1" --repo "$REPO" --color "0366d6" --force
gh label create "phase:2" --repo "$REPO" --color "0366d6" --force
gh label create "phase:3" --repo "$REPO" --color "0366d6" --force
gh label create "phase:4" --repo "$REPO" --color "0366d6" --force
gh label create "phase:5" --repo "$REPO" --color "0366d6" --force
gh label create "risk:high" --repo "$REPO" --color "dc2626" --force
gh label create "risk:prd-open-6" --repo "$REPO" --color "dc2626" --force
gh label create "risk:prd-opens" --repo "$REPO" --color "dc2626" --force
gh label create "risk:seam" --repo "$REPO" --color "dc2626" --force
gh label create "type:afk" --repo "$REPO" --color "16a34a" --force
gh label create "type:hitl" --repo "$REPO" --color "e11d48" --force

echo "Created/updated 68 labels in $REPO."
