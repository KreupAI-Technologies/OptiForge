import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Handover } from '../entities/handover.entity';

@Injectable()
export class HandoverService {
  constructor(
    @InjectRepository(Handover)
    private readonly repo: Repository<Handover>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    status?: string;
  }): Promise<Handover[]> {
    const where: Record<string, string> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Handover> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Handover ${id} not found`);
    return row;
  }

  async create(data: Partial<Handover>): Promise<Handover> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Handover>): Promise<Handover> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
