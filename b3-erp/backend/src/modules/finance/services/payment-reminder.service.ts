import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { In } from 'typeorm';
import { PaymentReminder } from '../entities/payment-reminder.entity';

export const FINANCE_REMINDERS_QUEUE = 'finance-reminders';
const MAX_ATTEMPTS = 3;

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(
    @InjectRepository(PaymentReminder)
    private readonly repo: Repository<PaymentReminder>,
    @InjectQueue(FINANCE_REMINDERS_QUEUE)
    private readonly queue: Queue,
  ) {}

  async findAll(targetType?: string, targetId?: string): Promise<PaymentReminder[]> {
    const where: Partial<PaymentReminder> = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PaymentReminder> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Payment reminder ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<PaymentReminder>): Promise<PaymentReminder> {
    // Persist as 'queued'; the Bull processor performs actual delivery and flips
    // status to 'sent' / 'failed' / 'no_recipient'. Never set sentAt here.
    const { status: _ignore, sentAt: _ignore2, ...rest } = dto;
    const row = this.repo.create({
      status: 'queued',
      attempts: 0,
      ...rest,
    });
    const saved = await this.repo.save(row);

    // Best-effort enqueue: if Redis is down, keep the row in 'queued' so the
    // @Cron sweep re-enqueues it later. Never crash the create request.
    try {
      await this.queue.add('send-reminder', { reminderId: saved.id });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue reminder ${saved.id} (will retry via sweep): ${error?.message}`,
      );
    }

    return saved;
  }

  /**
   * Sweep: re-enqueue reminders stuck in 'queued'/'failed' with attempts < MAX_ATTEMPTS.
   * Covers Redis outages at create time and transient send failures.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async sweepStuckReminders(): Promise<void> {
    try {
      const stuck = await this.repo.find({
        where: {
          status: In(['queued', 'failed']),
          attempts: LessThan(MAX_ATTEMPTS),
        },
        take: 200,
      });
      if (stuck.length === 0) return;

      this.logger.log(`Reminder sweep: re-enqueuing ${stuck.length} stuck reminder(s)`);
      for (const r of stuck) {
        try {
          await this.queue.add('send-reminder', { reminderId: r.id });
        } catch (error) {
          this.logger.warn(`Sweep enqueue failed for ${r.id}: ${error?.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Reminder sweep failed: ${error?.message}`);
    }
  }
}
