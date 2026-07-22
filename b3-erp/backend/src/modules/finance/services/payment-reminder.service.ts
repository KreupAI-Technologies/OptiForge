import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentReminder } from '../entities/payment-reminder.entity';

@Injectable()
export class PaymentReminderService {
  constructor(
    @InjectRepository(PaymentReminder)
    private readonly repo: Repository<PaymentReminder>,
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
    const row = this.repo.create({
      status: 'sent',
      sentAt: new Date(),
      ...dto,
    });
    return this.repo.save(row);
  }
}
