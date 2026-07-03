import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverableEntity } from '../entities/deliverable.entity';

@Injectable()
export class DeliverablesService {
  constructor(
    @InjectRepository(DeliverableEntity)
    private readonly repo: Repository<DeliverableEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<DeliverableEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DeliverableEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Deliverable ${id} not found`);
    return row;
  }

  async create(data: Partial<DeliverableEntity>): Promise<DeliverableEntity> {
    const dependencies = Array.isArray(data.dependencies) ? data.dependencies : [];
    const row = this.repo.create({ companyId: 'default', ...data, dependencies });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<DeliverableEntity>): Promise<DeliverableEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Deliverable ${id} not found`);
  }
}
