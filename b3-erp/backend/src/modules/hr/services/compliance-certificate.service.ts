import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceCertificate } from '../entities/compliance-certificate.entity';

@Injectable()
export class ComplianceCertificateService {
  constructor(
    @InjectRepository(ComplianceCertificate)
    private readonly repo: Repository<ComplianceCertificate>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<ComplianceCertificate[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ComplianceCertificate> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`ComplianceCertificate ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ComplianceCertificate> & { companyId: string },
  ): Promise<ComplianceCertificate> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ComplianceCertificate>): Promise<ComplianceCertificate> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
