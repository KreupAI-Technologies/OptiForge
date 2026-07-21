import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificationTracking } from '../entities/certification-tracking.entity';

@Injectable()
export class CertificationTrackingService {
  constructor(
    @InjectRepository(CertificationTracking)
    private readonly repo: Repository<CertificationTracking>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { employeeId?: string; status?: string },
  ): Promise<CertificationTracking[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CertificationTracking> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Certification ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<CertificationTracking> & { companyId: string },
  ): Promise<CertificationTracking> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CertificationTracking>,
  ): Promise<CertificationTracking> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /** Renew a certification: bump expiry, reactivate, append a renewal record. */
  async renew(
    id: string,
    data: { newExpiryDate: string; cost?: number; remarks?: string },
  ): Promise<CertificationTracking> {
    const entity = await this.findOne(id);
    entity.expiryDate = data.newExpiryDate;
    entity.status = 'active';
    const history = Array.isArray(entity.renewalHistory)
      ? entity.renewalHistory
      : [];
    history.push({
      renewalDate: new Date().toISOString().split('T')[0],
      newExpiryDate: data.newExpiryDate,
      cost: data.cost,
      remarks: data.remarks,
    });
    entity.renewalHistory = history;
    return this.repo.save(entity);
  }

  /** Attach an uploaded certificate file URL (FE uploadCertificate). */
  async uploadCertificate(
    id: string,
    fileUrl: string,
  ): Promise<CertificationTracking> {
    const entity = await this.findOne(id);
    entity.fileUrl = fileUrl;
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
