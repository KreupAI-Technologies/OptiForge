import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoshComplaint } from '../entities/posh-complaint.entity';

@Injectable()
export class PoshComplaintService {
  constructor(
    @InjectRepository(PoshComplaint)
    private readonly repo: Repository<PoshComplaint>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<PoshComplaint[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PoshComplaint> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`PoshComplaint ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<PoshComplaint> & { companyId: string },
  ): Promise<PoshComplaint> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<PoshComplaint>): Promise<PoshComplaint> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
