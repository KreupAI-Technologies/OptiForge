import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcurementComplianceRecord } from '../entities/procurement-compliance-record.entity';

@Injectable()
export class ProcurementComplianceRecordService {
  constructor(
    @InjectRepository(ProcurementComplianceRecord)
    private readonly repository: Repository<ProcurementComplianceRecord>,
  ) {}

  async create(
    companyId: string,
    data: Partial<ProcurementComplianceRecord>,
  ): Promise<ProcurementComplianceRecord> {
    const entity = this.repository.create({ ...data, companyId });
    return this.repository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; supplierId?: string },
  ): Promise<ProcurementComplianceRecord[]> {
    const query = this.repository
      .createQueryBuilder('record')
      .where('record.companyId = :companyId', { companyId })
      .orderBy('record.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('record.status = :status', { status: filters.status });
    }
    if (filters?.supplierId) {
      query.andWhere('record.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<ProcurementComplianceRecord> {
    const entity = await this.repository.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Compliance Record with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<ProcurementComplianceRecord>,
  ): Promise<ProcurementComplianceRecord> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repository.remove(entity);
  }
}
