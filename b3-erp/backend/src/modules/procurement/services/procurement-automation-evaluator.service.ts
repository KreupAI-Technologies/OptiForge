import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementAutomationRule } from '../entities/procurement-automation-rule.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { EmailService } from '../../notifications/services/email.service';

/**
 * ProcurementAutomationEvaluatorService — scheduled evaluation of automation rules.
 * Every 30 min it loads active rules, performs a bounded, defensive evaluation of
 * the rule's trigger + conditions (jsonb), and on a match executes the action:
 * emailing the recipients listed in the rule's actions jsonb via EmailService.
 * Scope is intentionally scheduled evaluation only — no deep domain-event hooks.
 */
@Injectable()
export class ProcurementAutomationEvaluatorService {
  private readonly logger = new Logger(ProcurementAutomationEvaluatorService.name);

  constructor(
    @InjectRepository(ProcurementAutomationRule)
    private readonly ruleRepo: Repository<ProcurementAutomationRule>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async evaluateRules(): Promise<void> {
    let rules: ProcurementAutomationRule[];
    try {
      rules = await this.ruleRepo.find({ where: { isActive: true }, take: 200 });
    } catch (error) {
      this.logger.error(`Automation evaluator scan failed: ${error?.message}`);
      return;
    }

    if (rules.length === 0) return;
    this.logger.log(`Automation evaluator: evaluating ${rules.length} active rule(s)`);

    for (const rule of rules) {
      try {
        const matched = await this.evaluateRule(rule);
        if (matched.matched) {
          await this.executeAction(rule, matched.summary);
        }
      } catch (error) {
        this.logger.error(
          `Automation rule ${rule.id} (${rule.name}) evaluation failed: ${error?.message}`,
        );
      } finally {
        // Always stamp last_evaluated_at, even on non-match, for observability.
        try {
          rule.lastEvaluatedAt = new Date();
          await this.ruleRepo.save(rule);
        } catch (saveErr) {
          this.logger.warn(
            `Could not persist lastEvaluatedAt for rule ${rule.id}: ${saveErr?.message}`,
          );
        }
      }
    }
  }

  /**
   * Bounded, defensive evaluation. Supported triggers (extend as needed):
   *   - 'threshold_breach' / 'po_value_threshold': matches when open POs total
   *     exceeds conditions.amount (real, queryable).
   *   - 'open_po_count': matches when count of open POs >= conditions.count.
   *   - anything else: no-op (returns matched:false) — never fabricates a match.
   */
  private async evaluateRule(
    rule: ProcurementAutomationRule,
  ): Promise<{ matched: boolean; summary: string }> {
    const conditions = this.asObject(rule.conditions);
    const trigger = (rule.trigger || '').toLowerCase();

    if (trigger === 'threshold_breach' || trigger === 'po_value_threshold') {
      const threshold = this.asNumber(conditions.amount ?? conditions.threshold);
      if (threshold === null) return { matched: false, summary: '' };

      const raw = await this.poRepo
        .createQueryBuilder('po')
        .select('COALESCE(SUM(po.totalAmount), 0)', 'total')
        .where('po.status IN (:...statuses)', {
          statuses: ['draft', 'pending', 'approved', 'issued', 'open'],
        })
        .getRawOne();
      const total = Number(raw?.total ?? 0);
      if (total > threshold) {
        return {
          matched: true,
          summary: `Open purchase order value ${total} exceeded threshold ${threshold}.`,
        };
      }
      return { matched: false, summary: '' };
    }

    if (trigger === 'open_po_count') {
      const min = this.asNumber(conditions.count ?? conditions.min);
      if (min === null) return { matched: false, summary: '' };

      const count = await this.poRepo
        .createQueryBuilder('po')
        .where('po.status IN (:...statuses)', {
          statuses: ['draft', 'pending', 'approved', 'issued', 'open'],
        })
        .getCount();
      if (count >= min) {
        return {
          matched: true,
          summary: `Open purchase order count ${count} reached threshold ${min}.`,
        };
      }
      return { matched: false, summary: '' };
    }

    // Unknown trigger — do not fabricate a match.
    return { matched: false, summary: '' };
  }

  private async executeAction(
    rule: ProcurementAutomationRule,
    summary: string,
  ): Promise<void> {
    const actions = this.asObject(rule.actions);
    const recipients = this.resolveRecipients(actions);

    if (recipients.length === 0) {
      this.logger.warn(
        `Automation rule ${rule.id} (${rule.name}) matched but has no action recipients`,
      );
      return;
    }

    const subject =
      this.asString(actions.subject) || `Automation Alert: ${rule.name}`;
    const message =
      this.asString(actions.message) ||
      `Automation rule "${rule.name}" was triggered.\n\n${summary}`;
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color:#333;">
  <h2>${this.htmlEscape(rule.name)}</h2>
  <p>${this.htmlEscape(message)}</p>
  <p style="color:#6b7280;font-size:12px;">Automated procurement alert from ERP System.</p>
</body>
</html>`;

    for (const to of recipients) {
      await this.emailService.sendMail(to, subject, html, message);
    }
    this.logger.log(
      `Automation rule "${rule.name}" fired; alerted ${recipients.length} recipient(s)`,
    );
  }

  private resolveRecipients(actions: Record<string, any>): string[] {
    const raw =
      actions.recipients ?? actions.emails ?? actions.notify ?? actions.to;
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((r) => String(r).trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    }
    return [];
  }

  private asObject(value: any): Record<string, any> {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  }

  private asNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  private asString(value: any): string | null {
    if (typeof value === 'string' && value.trim()) return value;
    return null;
  }

  private htmlEscape(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
