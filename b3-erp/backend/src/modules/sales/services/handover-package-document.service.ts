import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HandoverPackageDocument } from '../entities/handover-package-document.entity';

@Injectable()
export class HandoverPackageDocumentService {
  constructor(
    @InjectRepository(HandoverPackageDocument)
    private readonly repo: Repository<HandoverPackageDocument>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    projectId?: string;
    status?: string;
  }): Promise<HandoverPackageDocument[]> {
    const where: Record<string, string> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<HandoverPackageDocument> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Package document ${id} not found`);
    return row;
  }

  async create(
    data: Partial<HandoverPackageDocument>,
  ): Promise<HandoverPackageDocument> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<HandoverPackageDocument>,
  ): Promise<HandoverPackageDocument> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
