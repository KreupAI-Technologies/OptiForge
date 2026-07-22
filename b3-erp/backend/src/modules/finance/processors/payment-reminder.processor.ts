import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentReminder } from '../entities/payment-reminder.entity';
import { EmailService } from '../../notifications/services/email.service';
import { FINANCE_REMINDERS_QUEUE } from '../services/payment-reminder.service';

/**
 * PaymentReminderProcessor — delivers finance payment reminders via email.
 * Loads the reminder, sends via EmailService.sendMail, and flips status to
 * 'sent' (with sentAt) on success, 'failed' (attempts++) on error, or
 * 'no_recipient' when no recipient email is available. Never crashes the queue.
 */
@Processor(FINANCE_REMINDERS_QUEUE)
export class PaymentReminderProcessor {
  private readonly logger = new Logger(PaymentReminderProcessor.name);

  constructor(
    @InjectRepository(PaymentReminder)
    private readonly repo: Repository<PaymentReminder>,
    private readonly emailService: EmailService,
  ) {}

  @Process('send-reminder')
  async sendReminder(job: Job<{ reminderId: string }>): Promise<void> {
    const { reminderId } = job.data;
    const reminder = await this.repo.findOne({ where: { id: reminderId } });
    if (!reminder) {
      this.logger.warn(`Reminder ${reminderId} not found; skipping`);
      return;
    }

    // Idempotency: don't re-send an already-delivered reminder.
    if (reminder.status === 'sent') {
      return;
    }

    const recipient = reminder.recipientEmail?.trim();
    if (!recipient) {
      reminder.status = 'no_recipient';
      await this.repo.save(reminder);
      this.logger.warn(
        `Reminder ${reminderId} has no recipient_email; marked 'no_recipient'`,
      );
      return;
    }

    const subject = reminder.subject || 'Payment Reminder';
    const html = this.buildHtml(reminder);

    try {
      const ok = await this.emailService.sendMail(
        recipient,
        subject,
        html,
        reminder.message || undefined,
      );
      if (ok) {
        reminder.status = 'sent';
        reminder.sentAt = new Date();
        await this.repo.save(reminder);
        this.logger.log(`Reminder ${reminderId} delivered to ${recipient}`);
      } else {
        reminder.status = 'failed';
        reminder.attempts = (reminder.attempts || 0) + 1;
        await this.repo.save(reminder);
        this.logger.warn(
          `Reminder ${reminderId} delivery returned false (attempt ${reminder.attempts})`,
        );
      }
    } catch (error) {
      reminder.status = 'failed';
      reminder.attempts = (reminder.attempts || 0) + 1;
      await this.repo.save(reminder);
      this.logger.error(
        `Reminder ${reminderId} send error (attempt ${reminder.attempts}): ${error?.message}`,
      );
    }
  }

  private buildHtml(reminder: PaymentReminder): string {
    const body = (reminder.message || 'This is a payment reminder from the ERP system.')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background:#f59e0b;color:#fff;padding:16px;border-radius:8px 8px 0 0;">
      <h2 style="margin:0;">${reminder.subject || 'Payment Reminder'}</h2>
    </div>
    <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
      <p>${body}</p>
    </div>
    <div style="text-align:center;padding:16px;color:#6b7280;font-size:12px;">
      <p>Automated payment reminder from ERP System</p>
    </div>
  </div>
</body>
</html>`;
  }
}
