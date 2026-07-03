import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportDataset } from '../entities/export-dataset.entity';

@Injectable()
export class ExportDatasetService {
  constructor(
    @InjectRepository(ExportDataset)
    private readonly repository: Repository<ExportDataset>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
  }): Promise<ExportDataset[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    return this.repository.find({ where, order: { category: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string): Promise<ExportDataset> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Export dataset ${id} not found`);
    return item;
  }

  async create(data: Partial<ExportDataset>): Promise<ExportDataset> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<ExportDataset>): Promise<ExportDataset> {
    const item = await this.findOne(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
