import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaborEntryEntity } from '../entities/labor-entry.entity';

@Injectable()
export class LaborTrackingService {
  constructor(
    @InjectRepository(LaborEntryEntity)
    private readonly repo: Repository<LaborEntryEntity>,
  ) {}

  async findAll(companyId = 'default', laborCategory?: string): Promise<LaborEntryEntity[]> {
    const where: any = { companyId };
    if (laborCategory) where.laborCategory = laborCategory;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LaborEntryEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Labor entry ${id} not found`);
    return row;
  }

  async create(data: Partial<LaborEntryEntity>): Promise<LaborEntryEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<LaborEntryEntity>): Promise<LaborEntryEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Labor entry ${id} not found`);
  }
}
