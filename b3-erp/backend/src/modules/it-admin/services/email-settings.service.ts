import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTestLog } from '../entities/email-test-log.entity';
import { Notification } from '../entities/notification.entity';
import {
  ConfigCategory,
  ConfigDataType,
} from '../entities/system-config.entity';
import { SystemConfigService } from './system-config.service';

const EMAIL_CONFIG_KEY = 'it.system.email';

@Injectable()
export class EmailSettingsService {
  constructor(
    @InjectRepository(EmailTestLog)
    private readonly testLogRepo: Repository<EmailTestLog>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  // Settings are stored as a single key/value SystemConfig entry (it.system.email).
  async getSettings(): Promise<{ key: string; value: any }> {
    const value = await this.systemConfigService.getValue(EMAIL_CONFIG_KEY, null);
    return { key: EMAIL_CONFIG_KEY, value };
  }

  async saveSettings(
    value: any,
    updatedBy?: string,
  ): Promise<{ key: string; value: any }> {
    // upsert the config key: create if missing, else setValue.
    try {
      await this.systemConfigService.findByKey(EMAIL_CONFIG_KEY);
      await this.systemConfigService.setValue(EMAIL_CONFIG_KEY, value, updatedBy);
    } catch {
      await this.systemConfigService.create(
        {
          key: EMAIL_CONFIG_KEY,
          name: 'Email Settings',
          value: JSON.stringify(value),
          dataType: ConfigDataType.JSON,
          category: ConfigCategory.EMAIL,
          module: 'it-admin',
          description: 'SMTP + email template + rate-limit settings',
          isEditable: true,
        },
        updatedBy,
      );
    }
    return { key: EMAIL_CONFIG_KEY, value };
  }

  // Email delivery statistics COMPUTED from the it_notifications table using the
  // Email channel. Returns zeros where no data exists — never fabricated.
  async stats(companyId?: string): Promise<{
    sent24h: number;
    sentThisMonth: number;
    failed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Only notifications delivered through the Email channel count as "sent".
    const base = this.notificationRepo
      .createQueryBuilder('n')
      .where(":email = ANY(n.channels)", { email: 'Email' });
    if (companyId) {
      // Notifications have no companyId column; scope is per-user. Ignore filter.
    }

    let sent24h = 0;
    let sentThisMonth = 0;
    let failed = 0;
    try {
      sent24h = await base
        .clone()
        .andWhere('n.createdAt >= :dayAgo', { dayAgo })
        .getCount();
      sentThisMonth = await base
        .clone()
        .andWhere('n.createdAt >= :monthStart', { monthStart })
        .getCount();
      // "Error" typed notifications on the email channel represent failures.
      failed = await base
        .clone()
        .andWhere("n.type = :err", { err: 'Error' })
        .andWhere('n.createdAt >= :monthStart', { monthStart })
        .getCount();
    } catch {
      // table may not exist yet — return zeros
    }

    const totalMonth = sentThisMonth + failed;
    const deliveryRate =
      totalMonth > 0 ? Math.round((sentThisMonth / totalMonth) * 1000) / 10 : 0;
    const bounceRate =
      totalMonth > 0 ? Math.round((failed / totalMonth) * 1000) / 10 : 0;

    return {
      sent24h,
      sentThisMonth,
      failed,
      deliveryRate,
      // Open/click tracking is not instrumented — reported as 0 (no source).
      openRate: 0,
      clickRate: 0,
      bounceRate,
    };
  }

  // Records a test attempt. NO real SMTP send is performed (no new dependency).
  // Success is reported when a non-empty recipient + SMTP host are configured.
  async sendTest(input: {
    toAddress?: string;
    smtpHost?: string;
    companyId?: string;
  }): Promise<{ success: boolean; message: string; loggedAt: string }> {
    const toAddress = (input.toAddress ?? '').trim();
    const smtpHost = (input.smtpHost ?? '').trim();
    const valid = /.+@.+\..+/.test(toAddress) && smtpHost.length > 0;
    const message = valid
      ? `Test email recorded for ${toAddress} via ${smtpHost}. No message was actually sent.`
      : 'Invalid recipient or missing SMTP host — nothing recorded as sent.';

    const log = this.testLogRepo.create({
      companyId: input.companyId,
      toAddress: toAddress || 'unknown',
      smtpHost: smtpHost || undefined,
      success: valid,
      message,
    });
    const saved = await this.testLogRepo.save(log);
    return { success: valid, message, loggedAt: saved.createdAt.toISOString() };
  }
}
