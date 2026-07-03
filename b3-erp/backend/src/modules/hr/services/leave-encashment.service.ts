import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveEncashment } from '../entities/leave-encashment.entity';

@Injectable()
export class LeaveEncashmentService {
  constructor(
    @InjectRepository(LeaveEncashment)
    private readonly repo: Repository<LeaveEncashment>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<LeaveEncashment[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<LeaveEncashment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`LeaveEncashment ${id} not found`);
    return entity;
  }

  async create(data: Partial<LeaveEncashment> & { companyId: string }): Promise<LeaveEncashment> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<LeaveEncashment>): Promise<LeaveEncashment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
