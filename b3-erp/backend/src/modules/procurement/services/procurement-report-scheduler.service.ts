import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ProcurementReportTemplate } from '../entities/procurement-report-template.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { Vendor } from '../entities/vendor.entity';
import { EmailService } from '../../notifications/services/email.service';

/**
 * ProcurementReportSchedulerService — runs active scheduled report templates.
 * Hourly it finds templates due (next_run_at <= now, or schedule set with no
 * next_run_at), generates a bounded CSV summary from queryable procurement data,
 * emails it to the template recipients, and advances last_run_at / next_run_at.
 * Fully defensive: SMTP/DB errors are caught and logged, never thrown.
 */
@Injectable()
export class ProcurementReportSchedulerService {
  private readonly logger = new Logger(ProcurementReportSchedulerService.name);

  constructor(
    @InjectRepository(ProcurementReportTemplate)
    private readonly templateRepo: Repository<ProcurementReportTemplate>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runDueReports(): Promise<void> {
    let due: ProcurementReportTemplate[];
    try {
      const now = new Date();
      // Due = active AND (next_run_at <= now). Templates that have a schedule but
      // never ran (next_run_at is null) are seeded on first pass below.
      due = await this.templateRepo.find({
        where: { isActive: true, nextRunAt: LessThanOrEqual(now) },
        take: 100,
      });

      // First-run seeding: active templates with a schedule but no next_run_at.
      const unseeded = await this.templateRepo
        .createQueryBuilder('t')
        .where('t.isActive = :active', { active: true })
        .andWhere('t.schedule IS NOT NULL')
        .andWhere('t.nextRunAt IS NULL')
        .take(100)
        .getMany();
      for (const t of unseeded) {
        if (!due.find((d) => d.id === t.id)) due.push(t);
      }
    } catch (error) {
      this.logger.error(`Report scheduler scan failed: ${error?.message}`);
      return;
    }

    if (due.length === 0) return;
    this.logger.log(`Report scheduler: ${due.length} template(s) due`);

    for (const template of due) {
      try {
        await this.executeTemplate(template);
      } catch (error) {
        this.logger.error(
          `Report template ${template.id} (${template.name}) failed: ${error?.message}`,
        );
      }
    }
  }

  private async executeTemplate(template: ProcurementReportTemplate): Promise<void> {
    const csv = await this.generateReport(template);
    const recipients = this.resolveRecipients(template);

    if (recipients.length === 0) {
      this.logger.warn(
        `Report template ${template.id} (${template.name}) has no recipients; skipping email`,
      );
    } else {
      const subject = `Scheduled Report: ${template.name}`;
      const html = this.wrapHtml(template, csv);
      for (const to of recipients) {
        // sendMail is itself defensive (returns boolean); await individually so
        // one bad address does not block the rest.
        await this.emailService.sendMail(to, subject, html, csv);
      }
      this.logger.log(
        `Report "${template.name}" emailed to ${recipients.length} recipient(s)`,
      );
    }

    const now = new Date();
    template.lastRunAt = now;
    template.nextRunAt = this.computeNextRun(template.schedule, now);
    await this.templateRepo.save(template);
  }

  /**
   * Builds a real, bounded CSV from queryable procurement data. No fabricated
   * business numbers — only counts/sums that actually exist in the DB plus a
   * generated-at header.
   */
  private async generateReport(template: ProcurementReportTemplate): Promise<string> {
    const generatedAt = new Date().toISOString();
    const lines: string[] = [];
    lines.push(`Report,${this.csvEscape(template.name)}`);
    lines.push(`Report Type,${this.csvEscape(template.reportType || 'summary')}`);
    lines.push(`Generated At,${generatedAt}`);
    lines.push('');

    try {
      // Purchase orders grouped by status (PO entity has no companyId — global).
      const poByStatus = await this.poRepo
        .createQueryBuilder('po')
        .select('po.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(po.totalAmount), 0)', 'total')
        .groupBy('po.status')
        .getRawMany();

      lines.push('Purchase Orders by Status');
      lines.push('Status,Count,Total Amount');
      if (poByStatus.length === 0) {
        lines.push('(none),0,0');
      } else {
        for (const row of poByStatus) {
          lines.push(
            `${this.csvEscape(row.status ?? 'unknown')},${row.count},${row.total}`,
          );
        }
      }
      lines.push('');

      // Vendors grouped by status, scoped to company when known.
      const vendorQb = this.vendorRepo
        .createQueryBuilder('v')
        .select('v.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('v.status');
      if (template.companyId) {
        vendorQb.where('v.companyId = :cid', { cid: template.companyId });
      }
      const vendorByStatus = await vendorQb.getRawMany();

      lines.push('Vendors by Status');
      lines.push('Status,Count');
      if (vendorByStatus.length === 0) {
        lines.push('(none),0');
      } else {
        for (const row of vendorByStatus) {
          lines.push(`${this.csvEscape(row.status ?? 'unknown')},${row.count}`);
        }
      }
    } catch (error) {
      lines.push(`Data query error,${this.csvEscape(error?.message ?? 'unknown')}`);
    }

    return lines.join('\n');
  }

  private resolveRecipients(template: ProcurementReportTemplate): string[] {
    const raw = template.recipients;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((r) => String(r).trim()).filter(Boolean);
    }
    // Tolerate a comma-separated string stored in jsonb/text.
    if (typeof raw === 'string') {
      return (raw as string)
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Computes the next run time from a human schedule keyword. Cron strings are
   * left unmanaged here (advance by 1 day as a safe floor so they don't spin).
   */
  private computeNextRun(schedule: string | null | undefined, from: Date): Date {
    const next = new Date(from);
    switch ((schedule || '').toLowerCase()) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        // Unknown / cron expression: advance a day to avoid tight re-runs.
        next.setDate(next.getDate() + 1);
    }
    return next;
  }

  private wrapHtml(template: ProcurementReportTemplate, csv: string): string {
    const safe = csv.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color:#333;">
  <h2>${this.htmlEscape(template.name)}</h2>
  <p>Scheduled procurement report generated by the ERP system.</p>
  <pre style="background:#f4f4f5;padding:16px;border-radius:6px;overflow:auto;">${safe}</pre>
</body>
</html>`;
  }

  private csvEscape(value: string): string {
    const s = String(value ?? '');
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  private htmlEscape(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
