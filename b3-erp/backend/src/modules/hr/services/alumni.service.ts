import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumni } from '../entities/alumni.entity';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(Alumni)
    private readonly repo: Repository<Alumni>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { kind?: string; status?: string },
  ): Promise<Alumni[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.kind) where.kind = filters.kind;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Alumni> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Alumni ${id} not found`);
    return entity;
  }

  async create(data: Partial<Alumni> & { companyId: string }): Promise<Alumni> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Alumni>): Promise<Alumni> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
