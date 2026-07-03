import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmDesignerTaskEntity } from '../entities/pm-designer-task.entity';

@Injectable()
export class PmDesignerTasksService {
  constructor(
    @InjectRepository(PmDesignerTaskEntity)
    private readonly repo: Repository<PmDesignerTaskEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmDesignerTaskEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmDesignerTaskEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Designer task ${id} not found`);
    return row;
  }

  async create(data: Partial<PmDesignerTaskEntity>): Promise<PmDesignerTaskEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmDesignerTaskEntity>): Promise<PmDesignerTaskEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Designer task ${id} not found`);
  }
}
