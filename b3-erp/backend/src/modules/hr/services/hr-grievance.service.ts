import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { HrGrievance } from '../entities/hr-grievance.entity';

@Injectable()
export class HrGrievanceService {
  constructor(
    @InjectRepository(HrGrievance)
    private readonly repo: Repository<HrGrievance>,
  ) {}

  async findAll(companyId: string, caseType?: string): Promise<HrGrievance[]> {
    const where: FindOptionsWhere<HrGrievance> = { companyId };
    if (caseType) where.caseType = caseType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<HrGrievance> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Grievance ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<HrGrievance> & { companyId: string },
  ): Promise<HrGrievance> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<HrGrievance>): Promise<HrGrievance> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
