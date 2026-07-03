import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet.entity';

@Injectable()
export class TimesheetService {
  constructor(
    @InjectRepository(Timesheet)
    private readonly repo: Repository<Timesheet>,
  ) {}

  async findAll(companyId: string, status?: string): Promise<Timesheet[]> {
    const where: Record<string, any> = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Timesheet> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Timesheet ${id} not found`);
    return entity;
  }

  async create(data: Partial<Timesheet> & { companyId: string }): Promise<Timesheet> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Timesheet>): Promise<Timesheet> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
