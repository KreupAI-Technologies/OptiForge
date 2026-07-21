#!/usr/bin/env ts-node
/**
 * Manual DDL migration runner
 * ---------------------------
 * The orphan_*.sql / dated .sql files in this directory are hand-authored DDL
 * that fills gaps not yet covered by TypeORM migrations. Historically they were
 * applied by hand in an undefined order with no record of what had run — a
 * production risk (P0-DATA-02).
 *
 * This runner makes that process reproducible and safe:
 *   - Applies files in an explicit, dependency-aware order (see MIGRATION_ORDER).
 *   - Records every applied file in a `_manual_migrations` ledger table, so
 *     re-runs skip work already done and you can audit the DB's exact state.
 *   - Runs each file inside its own transaction — a failing file rolls back
 *     cleanly and aborts the run rather than leaving a half-applied schema.
 *   - Every file is idempotent (CREATE TABLE / ADD COLUMN ... IF NOT EXISTS),
 *     so applying is safe even against a partially-migrated database.
 *
 * Uses the same TypeORM connection settings as src/data-source.ts (honours the
 * kreupai_factory_os schema and DATABASE_URL), so it targets the same database
 * as the running app.
 *
 * Usage:
 *   npm run db:manual            # apply pending migrations
 *   npm run db:manual:status     # list pending, write nothing (--dry-run)
 *
 * NOTE: These are forward-only migrations. Take a database snapshot before
 * running in production — there are no automated down-migrations.
 */
import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const LEDGER_TABLE = '_manual_migrations';

/**
 * Explicit apply order. Independent "orphan" module tables come first
 * (they only CREATE their own tables), then the pass4 files which ALTER
 * pre-existing production tables, then dated feature migrations. Files not
 * listed here are applied last, in alphabetical order, with a warning.
 */
const MIGRATION_ORDER: string[] = [
    // Shared / masters first
    'orphan_common-masters.sql',
    'orphan_it-admin.sql',
    'orphan_itadmin_alert_rules.sql',
    'orphan_workflow.sql',
    'orphan_workflow_comments.sql',
    'orphan_notifications.sql',
    'orphan_attachments.sql',
    // Domain modules (independent orphan tables)
    'orphan_crm.sql',
    'orphan_crm_advanced.sql',
    'orphan_sales.sql',
    'orphan_cpq.sql',
    'orphan_cpq_advanced.sql',
    'orphan_cpq_advanced2.sql',
    'orphan_cpq_documents.sql',
    'orphan_estimation.sql',
    'orphan_estimation_send.sql',
    'orphan_procurement.sql',
    'orphan_procurement_rfq_bids.sql',
    'orphan_procurement_approvals.sql',
    'orphan_inventory.sql',
    'orphan_inventory_barcodes.sql',
    'orphan_inventory_replenishment.sql',
    'orphan_inventory_transfer_reject.sql',
    'orphan_logistics.sql',
    'orphan_logistics_notifications.sql',
    'orphan_production.sql',
    'orphan_production_execution.sql',
    'orphan_production_planning.sql',
    'orphan_project-management.sql',
    'orphan_pm_resources.sql',
    'orphan_installation.sql',
    'orphan_finance.sql',
    'orphan_finance_statutory.sql',
    'orphan_hr.sql',
    'orphan_hr_training_alumni.sql',
    'orphan_hr_compliance.sql',
    'orphan_quality.sql',
    'orphan_after_sales.sql',
    'orphan_after-sales-service.sql',
    'orphan_support.sql',
    'orphan_reports.sql',
    'orphan_collaboration.sql',
    'orphan_portal.sql',
    'orphan_iot.sql',
    'orphan_compliance.sql',
    'orphan_packaging.sql',
    'orphan_advanced-features.sql',
    'orphan_documentation.sql',
    // Column additions to existing production tables — must run after creates
    'orphan_pass4_fix.sql',
    'orphan_pass4_prodcols.sql',
    // Dated feature migrations
    '2026_07_add_payroll_loan_advance_tables.sql',
    // Projects Focus audit remediation — net-new Bucket B tables (additive, idempotent)
    'orphan_pm_mep_drawings.sql',
    'orphan_pm_cabinet_marking_tasks.sql',
    'orphan_pm_vendor_shipments.sql',
    'orphan_packaging_material_requests.sql',
    'orphan_pm_production_jobs.sql',
    'orphan_pm_drawing_verifications.sql',
    // Deferred residual backends
    'orphan_pm_report_templates.sql',
    'orphan_pm_project_categories.sql',
    'orphan_itadmin_compliance_requirements.sql',
    'orphan_sourcing_strategy.sql',
    // Net-new HR features (KPI master, training budget, review cycle)
    'orphan_hr_kpi_master.sql',
    'orphan_hr_training_budget.sql',
    'orphan_hr_review_cycle.sql',
    'orphan_it_admin_two_factor.sql',
    // Per-check Installation Checklist subsystem (net-new, additive, idempotent)
    'orphan_installation_checklists.sql',
    // Supplier Portal messages + documents (net-new, additive, idempotent)
    'orphan_supplier_portal.sql',
    // Net-new HR Training subsystem (schedules, attendance, waitlist,
    // certifications, feedback, assessments+attempts, e-learning progress)
    'orphan_hr_training_schedules.sql',
    'orphan_hr_training_attendance.sql',
    'orphan_hr_training_waitlist.sql',
    'orphan_hr_certification_tracking.sql',
    'orphan_hr_training_feedback.sql',
    'orphan_hr_training_assessments.sql',
    'orphan_hr_course_progress.sql',
    // Net-new HR Documents backend (policies + repository/compliance columns)
    'orphan_hr_policies.sql',
    'orphan_hr_documents_repo_compliance.sql',
];

function buildDataSourceOptions(): DataSourceOptions {
    const url = process.env.DATABASE_URL;
    const ssl =
        process.env.DB_SSL === 'true' || (url && url.includes('sslmode=require'))
            ? { rejectUnauthorized: false }
            : undefined;

    if (url) {
        return { type: 'postgres', url, ssl } as DataSourceOptions;
    }
    return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'b3erp',
        schema: process.env.DB_SCHEMA || 'kreupai_factory_os',
        ssl,
    } as DataSourceOptions;
}

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const ds = new DataSource(buildDataSourceOptions());
    await ds.initialize();

    try {
        await ds.query(`
            CREATE TABLE IF NOT EXISTS "${LEDGER_TABLE}" (
                filename    text PRIMARY KEY,
                checksum    text NOT NULL,
                applied_at  timestamptz NOT NULL DEFAULT now()
            );
        `);

        const appliedRows: { filename: string; checksum: string }[] = await ds.query(
            `SELECT filename, checksum FROM "${LEDGER_TABLE}"`,
        );
        const applied = new Map(appliedRows.map((r) => [r.filename, r.checksum]));

        const dir = __dirname;

        // Completeness guard: any .sql on disk that is not in MIGRATION_ORDER
        // would be silently skipped. Surface it so new DDL is never forgotten.
        const onDisk = readdirSync(dir).filter((f) => f.endsWith('.sql'));
        const unordered = onDisk.filter((f) => !MIGRATION_ORDER.includes(f));
        if (unordered.length > 0) {
            console.warn(
                `WARN: these .sql files are NOT in MIGRATION_ORDER and will be skipped:\n  ${unordered.join('\n  ')}\n` +
                `Add them to MIGRATION_ORDER in run-manual-migrations.ts.`,
            );
        }

        const pending: { file: string; sql: string; checksum: string }[] = [];
        for (const file of MIGRATION_ORDER) {
            let sql: string;
            try {
                sql = readFileSync(join(dir, file), 'utf8');
            } catch {
                console.warn(`WARN: ${file} listed in MIGRATION_ORDER but not found on disk — skipping.`);
                continue;
            }
            const checksum = createHash('sha256').update(sql).digest('hex');
            const prior = applied.get(file);
            if (prior === checksum) {
                continue; // already applied, unchanged
            }
            if (prior && prior !== checksum) {
                console.warn(`WARN: ${file} changed since it was last applied. It will be re-run (idempotent DDL).`);
            }
            pending.push({ file, sql, checksum });
        }

        if (pending.length === 0) {
            console.log('✓ Database is up to date — no manual migrations pending.');
            return;
        }

        console.log(`${pending.length} manual migration(s) pending:`);
        pending.forEach((p) => console.log(`  - ${p.file}`));

        if (dryRun) {
            console.log('\n(dry-run) No changes applied.');
            return;
        }

        for (const { file, sql, checksum } of pending) {
            process.stdout.write(`Applying ${file} ... `);
            const qr = ds.createQueryRunner();
            await qr.connect();
            await qr.startTransaction();
            try {
                await qr.query(sql);
                await qr.query(
                    `INSERT INTO "${LEDGER_TABLE}" (filename, checksum) VALUES ($1, $2)
                     ON CONFLICT (filename) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now()`,
                    [file, checksum],
                );
                await qr.commitTransaction();
                console.log('done');
            } catch (err) {
                await qr.rollbackTransaction();
                console.error(`\nFAILED on ${file} — rolled back. Aborting.\n`, err);
                await qr.release();
                process.exit(1);
            }
            await qr.release();
        }

        console.log(`\n✓ Applied ${pending.length} manual migration(s) successfully.`);
    } finally {
        await ds.destroy();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
