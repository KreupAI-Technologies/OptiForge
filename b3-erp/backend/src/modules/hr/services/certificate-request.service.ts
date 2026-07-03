import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CertificateRequest } from '../entities/certificate-request.entity';

@Injectable()
export class CertificateRequestService {
  constructor(
    @InjectRepository(CertificateRequest)
    private readonly repo: Repository<CertificateRequest>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<CertificateRequest[]> {
    const where: FindOptionsWhere<CertificateRequest> = { companyId } as FindOptionsWhere<CertificateRequest>;
    if (filter) (where as Record<string, string>).recordType = filter;
    return this.repo.find({ where, order: { requestDate: 'DESC' } as any });
  }

  async findOne(id: string): Promise<CertificateRequest> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<CertificateRequest> });
    if (!entity) throw new NotFoundException(`Certificate request ${id} not found`);
    return entity;
  }

  async create(data: Partial<CertificateRequest> & { companyId: string }): Promise<CertificateRequest> {
    return this.repo.save(this.repo.create(data as CertificateRequest));
  }

  async update(id: string, data: Partial<CertificateRequest>): Promise<CertificateRequest> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
