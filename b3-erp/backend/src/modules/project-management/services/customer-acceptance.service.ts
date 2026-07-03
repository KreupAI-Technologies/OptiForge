import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAcceptanceEntity } from '../entities/customer-acceptance.entity';

@Injectable()
export class CustomerAcceptanceService {
  constructor(
    @InjectRepository(CustomerAcceptanceEntity)
    private readonly repo: Repository<CustomerAcceptanceEntity>,
  ) {}

  async findAll(companyId = 'default', overallStatus?: string): Promise<CustomerAcceptanceEntity[]> {
    const where: any = { companyId };
    if (overallStatus) where.overallStatus = overallStatus;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CustomerAcceptanceEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Customer acceptance ${id} not found`);
    return row;
  }

  async create(data: Partial<CustomerAcceptanceEntity>): Promise<CustomerAcceptanceEntity> {
    const deliverables = Array.isArray(data.deliverables) ? data.deliverables : [];
    const acceptanceCriteria = Array.isArray(data.acceptanceCriteria) ? data.acceptanceCriteria : [];
    const documentation = Array.isArray(data.documentation) ? data.documentation : [];
    const defectsList = Array.isArray(data.defectsList) ? data.defectsList : [];
    const row = this.repo.create({
      companyId: 'default',
      ...data,
      deliverables,
      acceptanceCriteria,
      documentation,
      defectsList,
    });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<CustomerAcceptanceEntity>): Promise<CustomerAcceptanceEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Customer acceptance ${id} not found`);
  }
}
