import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from '../entities/notification-setting.entity';

@Injectable()
export class NotificationSettingService {
  constructor(
    @InjectRepository(NotificationSetting)
    private readonly repository: Repository<NotificationSetting>,
  ) {}

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
