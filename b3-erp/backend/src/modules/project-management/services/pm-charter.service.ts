import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmCharterEntity } from '../entities/pm-charter.entity';

@Injectable()
export class PmCharterService {
  constructor(
    @InjectRepository(PmCharterEntity)
    private readonly repo: Repository<PmCharterEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmCharterEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmCharterEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Charter ${id} not found`);
    return row;
  }

  async create(data: Partial<PmCharterEntity>): Promise<PmCharterEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmCharterEntity>): Promise<PmCharterEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Charter ${id} not found`);
  }
}
