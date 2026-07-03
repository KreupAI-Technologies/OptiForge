import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomFieldDef } from '../entities/custom-field.entity';

@Injectable()
export class CustomFieldService {
  constructor(
    @InjectRepository(CustomFieldDef)
    private readonly repository: Repository<CustomFieldDef>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    module?: string;
  }): Promise<CustomFieldDef[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.module && filters.module !== 'all')
      where.module = filters.module;
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CustomFieldDef> {
    const field = await this.repository.findOne({ where: { id } });
    if (!field) throw new NotFoundException(`Custom field ${id} not found`);
    return field;
  }

  async create(data: Partial<CustomFieldDef>): Promise<CustomFieldDef> {
    const field = this.repository.create(data);
    return this.repository.save(field);
  }

  async update(
    id: string,
    data: Partial<CustomFieldDef>,
  ): Promise<CustomFieldDef> {
    const field = await this.findOne(id);
    Object.assign(field, data);
    return this.repository.save(field);
  }

  async remove(id: string): Promise<void> {
    const field = await this.findOne(id);
    await this.repository.remove(field);
  }
}
