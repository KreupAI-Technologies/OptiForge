import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LayoutBriefingEntity } from '../entities/layout-briefing.entity';

@Injectable()
export class BriefingsService {
  constructor(
    @InjectRepository(LayoutBriefingEntity)
    private readonly repo: Repository<LayoutBriefingEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<LayoutBriefingEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LayoutBriefingEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Briefing ${id} not found`);
    return row;
  }

  async create(data: Partial<LayoutBriefingEntity>): Promise<LayoutBriefingEntity> {
    const attendees = Array.isArray(data.attendees) ? data.attendees : [];
    const attachments = Array.isArray(data.attachments) ? data.attachments : [];
    const row = this.repo.create({ companyId: 'default', ...data, attendees, attachments });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<LayoutBriefingEntity>): Promise<LayoutBriefingEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Briefing ${id} not found`);
  }
}
