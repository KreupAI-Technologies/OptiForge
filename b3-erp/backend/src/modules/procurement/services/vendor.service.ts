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

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.vendorRepository.remove(entity);
  }
}
