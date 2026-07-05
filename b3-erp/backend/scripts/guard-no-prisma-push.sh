#!/usr/bin/env bash
# Guard: fail if a `prisma db push` (or `prisma migrate ...`) command has been
# introduced anywhere in tracked config/scripts/CI/docs.
#
# Rationale: TypeORM owns the schema in this project; `prisma db push` would
# clobber it (see prisma/schema.prisma header, docs/architecture-dual-backend.md).
# This is a cheap tripwire — it does not stop someone typing the command in a
# terminal, but it stops it from being committed into automation.
set -euo pipefail

# Search the b3-erp/backend tree (run from that dir in CI). Exclude node_modules,
# build output, and this guard script itself.
matches=$(grep -rInE 'prisma[[:space:]]+(db[[:space:]]+push|migrate[[:space:]]+(deploy|dev|reset))' \
  --include='*.json' --include='*.yml' --include='*.yaml' \
  --include='*.sh' --include='*.ts' --include='*.js' --include='*.md' \
  . 2>/dev/null \
  | grep -v 'node_modules' \
  | grep -v 'dist/' \
  | grep -v 'guard-no-prisma-push' || true)

if [[ -n "$matches" ]]; then
  echo "✖ Forbidden Prisma schema-write command found (TypeORM owns the schema):"
  echo "$matches"
  echo ""
  echo "Use TypeORM migrations (src/migrations) or the manual runner (npm run db:manual)."
  exit 1
fi

echo "✓ No 'prisma db push' / 'prisma migrate' commands in tracked files."
