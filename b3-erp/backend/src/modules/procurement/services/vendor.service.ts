import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(companyId: string, data: Partial<Vendor>): Promise<Vendor> {
    const entity = this.vendorRepository.create({ ...data, companyId });
    return this.vendorRepository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; search?: string },
  ): Promise<{ data: Vendor[]; total: number }> {
    const query = this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.companyId = :companyId', { companyId })
      .orderBy('vendor.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('vendor.status = :status', { status: filters.status });
    }
    if (filters?.search) {
      query.andWhere(
        '(vendor.legalName ILIKE :search OR vendor.tradeName ILIKE :search OR vendor.vendorCode ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(companyId: string, id: string): Promise<Vendor> {
    const entity = await this.vendorRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<Vendor>,
  ): Promise<Vendor> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.vendorRepository.save(entity);
  }

  async approve(companyId: string, id: string): Promise<Vendor> {
    const entity = await this.findOne(companyId, id);
    entity.status = 'active';
    return this.vendorRepository.save(entity);
  }

  async requestDocuments(
    companyId: string,
    id: string,
    payload: {
      documents?: string[];
      message?: string;
      dueDate?: string;
      requestedBy?: string;
    },
  ): Promise<Vendor> {
    const entity = await this.findOne(companyId, id);
    const existing = Array.isArray(entity.documents) ? entity.documents : [];
    const request = {
      type: 'document_request',
      documents: payload?.documents ?? [],
      message: payload?.message ?? '',
      dueDate: payload?.dueDate ?? null,
      requestedBy: payload?.requestedBy ?? null,
      requestedAt: new Date().toISOString(),
      status: 'requested',
    };
    entity.documents = [...existing, request];
    // Move vendor into a documentation-pending state without overriding a terminal status
    if (entity.status === 'active' || entity.status === 'inactive') {
      entity.status = 'documentation_pending';
    }
    return this.vendorRepository.save(entity);
  }

  async completeOnboarding(
    companyId: string,
    id: string,
    payload?: { completedBy?: string; notes?: string },
  ): Promise<Vendor> {
    const entity = await this.findOne(companyId, id);
    entity.status = 'onboarded';
    if (!entity.registeredDate) {
      entity.registeredDate = new Date();
    }
    if (payload?.notes) {
      entity.notes = `${entity.notes ? entity.notes + '\n' : ''}Onboarding completed${
        payload.completedBy ? ' by ' + payload.completedBy : ''
      }: ${payload.notes}`;
    }
    return this.vendorRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.vendorRepository.remove(entity);
  }
}
