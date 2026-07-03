import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementNotification } from '../entities/procurement-notification.entity';

export interface CreateNotificationDto {
  companyId: string;
  type?: string;
  priority?: string;
  title: string;
  message?: string;
  read?: boolean;
  action?: string;
  actionUrl?: string;
}

@Injectable()
export class ProcurementNotificationService {
  constructor(
    @InjectRepository(ProcurementNotification)
    private readonly repo: Repository<ProcurementNotification>,
  ) {}

  async findAll(
    companyId: string,
    read?: string,
  ): Promise<ProcurementNotification[]> {
    const where: Record<string, any> = { companyId };
    if (read === 'true') where.read = true;
    if (read === 'false') where.read = false;
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateNotificationDto): Promise<ProcurementNotification> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async markRead(id: string): Promise<ProcurementNotification | null> {
    await this.repo.update(id, { read: true });
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.repo.delete(id);
    return { deleted: (res.affected ?? 0) > 0 };
  }
}
