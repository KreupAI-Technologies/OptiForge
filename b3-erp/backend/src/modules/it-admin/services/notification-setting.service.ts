import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from '../entities/notification-setting.entity';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationSettingService {
  constructor(
    @InjectRepository(NotificationSetting)
    private readonly repository: Repository<NotificationSetting>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // Delivery metrics COMPUTED from the it_notifications table (real source).
  // Counts total notifications and per-channel delivery over the last 30 days,
  // plus configured setting counts. Returns zeros where no data exists.
  async metrics(companyId?: string): Promise<{
    totalNotifications: number;
    last30Days: number;
    byChannel: Record<string, number>;
    byPriority: Record<string, number>;
    configuredSettings: number;
    criticalSettings: number;
  }> {
    const settings = await this.findAll({ companyId });
    const configuredSettings = settings.length;
    const criticalSettings = settings.filter(
      (s) => (s.priority || '').toLowerCase() === 'critical',
    ).length;

    const byChannel: Record<string, number> = {
      Email: 0,
      SMS: 0,
      Push: 0,
      'In-App': 0,
    };
    const byPriority: Record<string, number> = {};
    let totalNotifications = 0;
    let last30Days = 0;

    try {
      totalNotifications = await this.notificationRepo.count();
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      last30Days = await this.notificationRepo
        .createQueryBuilder('n')
        .where('n.createdAt >= :since', { since })
        .getCount();
      for (const channel of Object.keys(byChannel)) {
        byChannel[channel] = await this.notificationRepo
          .createQueryBuilder('n')
          .where(':ch = ANY(n.channels)', { ch: channel })
          .getCount();
      }
      const priorityRows: Array<{ priority: string; count: string }> =
        await this.notificationRepo
          .createQueryBuilder('n')
          .select('n.priority', 'priority')
          .addSelect('COUNT(*)', 'count')
          .groupBy('n.priority')
          .getRawMany();
      for (const row of priorityRows) {
        byPriority[row.priority] = parseInt(row.count, 10) || 0;
      }
    } catch {
      // table may not exist yet — return zeros
    }

    return {
      totalNotifications,
      last30Days,
      byChannel,
      byPriority,
      configuredSettings,
      criticalSettings,
    };
  }

  async findAll(filters?: {
    companyId?: string;
    category?: string;
  }): Promise<NotificationSetting[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<NotificationSetting> {
    const setting = await this.repository.findOne({ where: { id } });
    if (!setting)
      throw new NotFoundException(`Notification setting ${id} not found`);
    return setting;
  }

  async create(
    data: Partial<NotificationSetting>,
  ): Promise<NotificationSetting> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    data: Partial<NotificationSetting>,
  ): Promise<NotificationSetting> {
    const setting = await this.findOne(id);
    Object.assign(setting, data);
    return this.repository.save(setting);
  }

  // Bulk upsert of a full settings list (used by the "save all" action).
  async bulkUpsert(
    items: Array<Partial<NotificationSetting>>,
  ): Promise<NotificationSetting[]> {
    const saved: NotificationSetting[] = [];
    for (const item of items) {
      if (item.id) {
        const existing = await this.repository.findOne({
          where: { id: item.id },
        });
        if (existing) {
          Object.assign(existing, item);
          saved.push(await this.repository.save(existing));
          continue;
        }
      }
      const { id: _ignore, ...rest } = item;
      saved.push(await this.repository.save(this.repository.create(rest)));
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const setting = await this.findOne(id);
    await this.repository.remove(setting);
  }
}
