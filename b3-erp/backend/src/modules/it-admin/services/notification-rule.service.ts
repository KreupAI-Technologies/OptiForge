import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRule } from '../entities/notification-rule.entity';

@Injectable()
export class NotificationRuleService {
  constructor(
    @InjectRepository(NotificationRule)
    private readonly repository: Repository<NotificationRule>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    eventType?: string;
    channel?: string;
    isActive?: boolean;
  }): Promise<NotificationRule[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.channel) where.channel = filters.channel;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    return this.repository.find({ where, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<NotificationRule> {
    const rule = await this.repository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Notification rule ${id} not found`);
    return rule;
  }

  async create(data: Partial<NotificationRule>): Promise<NotificationRule> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<NotificationRule>,
  ): Promise<NotificationRule> {
    const rule = await this.findOne(id);
    const { id: _ignore, ...rest } = data;
    Object.assign(rule, rest);
    return this.repository.save(rule);
  }

  // Toggle active flag; if `isActive` not supplied, flip the current value.
  async toggle(id: string, isActive?: boolean): Promise<NotificationRule> {
    const rule = await this.findOne(id);
    rule.isActive = isActive === undefined ? !rule.isActive : isActive;
    return this.repository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.repository.remove(rule);
  }
}
