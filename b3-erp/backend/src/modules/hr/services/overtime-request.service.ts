import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OvertimeRequest } from '../entities/overtime-request.entity';

@Injectable()
export class OvertimeRequestService {
  constructor(
    @InjectRepository(OvertimeRequest)
    private readonly repo: Repository<OvertimeRequest>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<OvertimeRequest[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<OvertimeRequest> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Overtime request ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<OvertimeRequest> & { companyId: string },
  ): Promise<OvertimeRequest> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<OvertimeRequest>,
  ): Promise<OvertimeRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
