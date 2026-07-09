import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmResourceRequest } from '../entities/pm-resource-request.entity';
import {
  CreatePmResourceRequestDto,
  UpdatePmResourceRequestDto,
} from '../dto/pm-resource-request.dto';

@Injectable()
export class PmResourceRequestsService {
  constructor(
    @InjectRepository(PmResourceRequest)
    private readonly repo: Repository<PmResourceRequest>,
  ) {}

  async create(dto: CreatePmResourceRequestDto): Promise<PmResourceRequest> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(filters?: {
    projectId?: string;
    status?: string;
  }): Promise<PmResourceRequest[]> {
    const where: Record<string, any> = {};
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmResourceRequest> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Resource request ${id} not found`);
    return row;
  }

  async update(
    id: string,
    dto: UpdatePmResourceRequestDto,
  ): Promise<PmResourceRequest> {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
  }
}
