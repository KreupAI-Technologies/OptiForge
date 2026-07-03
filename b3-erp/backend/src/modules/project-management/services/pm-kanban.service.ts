import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmKanbanCardEntity } from '../entities/pm-kanban-card.entity';

@Injectable()
export class PmKanbanService {
  constructor(
    @InjectRepository(PmKanbanCardEntity)
    private readonly repo: Repository<PmKanbanCardEntity>,
  ) {}

  async findAll(companyId = 'default', column?: string): Promise<PmKanbanCardEntity[]> {
    const where: any = { companyId };
    if (column) where.column = column;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmKanbanCardEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Kanban card ${id} not found`);
    return row;
  }

  async create(data: Partial<PmKanbanCardEntity>): Promise<PmKanbanCardEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmKanbanCardEntity>): Promise<PmKanbanCardEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Kanban card ${id} not found`);
  }
}
