import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmInstallationActivityEntity } from '../entities/pm-installation-activity.entity';

@Injectable()
export class PmInstallationTrackingService {
  constructor(
    @InjectRepository(PmInstallationActivityEntity)
    private readonly repo: Repository<PmInstallationActivityEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmInstallationActivityEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmInstallationActivityEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Installation activity ${id} not found`);
    return row;
  }

  async create(data: Partial<PmInstallationActivityEntity>): Promise<PmInstallationActivityEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmInstallationActivityEntity>): Promise<PmInstallationActivityEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Installation activity ${id} not found`);
  }
}
