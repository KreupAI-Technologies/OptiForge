import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierDiversityProgram } from '../entities/supplier-diversity-program.entity';

@Injectable()
export class SupplierDiversityProgramService {
  constructor(
    @InjectRepository(SupplierDiversityProgram)
    private readonly repository: Repository<SupplierDiversityProgram>,
  ) {}

  async create(
    companyId: string,
    data: Partial<SupplierDiversityProgram>,
  ): Promise<SupplierDiversityProgram> {
    const entity = this.repository.create({ ...data, companyId });
    return this.repository.save(entity);
  }

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string; supplierId?: string },
  ): Promise<SupplierDiversityProgram[]> {
    const query = this.repository
      .createQueryBuilder('program')
      .where('program.companyId = :companyId', { companyId })
      .orderBy('program.createdAt', 'DESC');

    if (filters?.category) {
      query.andWhere('program.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.status) {
      query.andWhere('program.status = :status', { status: filters.status });
    }
    if (filters?.supplierId) {
      query.andWhere('program.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }
    return query.getMany();
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<SupplierDiversityProgram> {
    const entity = await this.repository.findOne({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException(`Diversity Program with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<SupplierDiversityProgram>,
  ): Promise<SupplierDiversityProgram> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.repository.remove(entity);
  }
}
