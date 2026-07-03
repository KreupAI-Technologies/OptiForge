import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementCalendarEvent } from '../entities/procurement-calendar-event.entity';

export interface UpsertCalendarEventDto {
  companyId?: string;
  title: string;
  type?: string;
  eventDate: string | Date;
  time?: string;
  vendor?: string;
  description?: string;
  location?: string;
  items?: number;
  value?: number;
  status?: string;
  priority?: string;
}

@Injectable()
export class ProcurementCalendarEventService {
  constructor(
    @InjectRepository(ProcurementCalendarEvent)
    private readonly repo: Repository<ProcurementCalendarEvent>,
  ) {}

  async findAll(
    companyId: string,
    type?: string,
  ): Promise<ProcurementCalendarEvent[]> {
    const where: Record<string, any> = { companyId };
    if (type && type !== 'all') where.type = type;
    return this.repo.find({ where, order: { eventDate: 'ASC' } });
  }

  async create(dto: UpsertCalendarEventDto): Promise<ProcurementCalendarEvent> {
    const entity = this.repo.create({
      ...dto,
      companyId: dto.companyId || 'default',
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    dto: Partial<UpsertCalendarEventDto>,
  ): Promise<ProcurementCalendarEvent | null> {
    const patch: Record<string, any> = { ...dto };
    if (dto.eventDate) patch.eventDate = new Date(dto.eventDate);
    await this.repo.update(id, patch);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.repo.delete(id);
    return { deleted: (res.affected ?? 0) > 0 };
  }
}
