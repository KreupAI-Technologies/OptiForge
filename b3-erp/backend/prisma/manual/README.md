# Manual DDL migrations

Hand-authored DDL (`orphan_*.sql`, dated `*.sql`) that fills schema gaps not yet
covered by TypeORM migrations. Previously these were applied by hand in an
undefined order with no record of what had run — a production risk (P0-DATA-02).

## How to apply

```bash
# From b3-erp/backend
npm run db:manual:status   # list pending migrations, writes nothing
npm run db:manual          # apply all pending migrations
```

The runner ([run-manual-migrations.ts](run-manual-migrations.ts)):

- Applies files in the explicit **`MIGRATION_ORDER`** (dependency-aware: masters →
  domain modules → `pass4` column-adds → dated migrations).
- Records each applied file (name + SHA-256 checksum + timestamp) in a
  **`_manual_migrations`** ledger table, so re-runs skip already-applied work and
  the DB's exact state is auditable.
- Wraps each file in its **own transaction** — a failing file rolls back cleanly
  and aborts the run, never leaving a half-applied schema.
- Warns if any `.sql` on disk is missing from `MIGRATION_ORDER` (so new DDL is
  never silently skipped).

All files are idempotent (`CREATE TABLE ... IF NOT EXISTS`,
`ADD COLUMN ... IF NOT EXISTS`), so applying against a partially-migrated DB is safe.

## Adding a new migration

1. Add the `.sql` file here. Use `IF NOT EXISTS` guards so it is idempotent.
2. Append its filename to `MIGRATION_ORDER` in `run-manual-migrations.ts` (order
   matters if it `ALTER`s a table another file creates).
3. Run `npm run db:manual:status` to confirm it is picked up, then `npm run db:manual`.

## Rollback

These are **forward-only** — there are no automated down-migrations. **Take a
database snapshot before applying in production.** To undo, restore the snapshot,
or manually `DROP` the objects the file created and delete its row from
`_manual_migrations`.

## Long-term direction

This runner makes the manual DDL reproducible and safe today. The eventual target
(tracked in [../../../../docs/PRODUCTION_READINESS_GAPS.md](../../../../docs/PRODUCTION_READINESS_GAPS.md),
item P0-DATA-02) is to fold these into first-class TypeORM migrations under
`src/migrations/` so a fresh database can be built from migrations alone.
