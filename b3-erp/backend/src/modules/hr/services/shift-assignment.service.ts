import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftAssignment } from '../entities/shift-assignment.entity';

@Injectable()
export class ShiftAssignmentService {
  constructor(
    @InjectRepository(ShiftAssignment)
    private readonly repo: Repository<ShiftAssignment>,
  ) {}

  async findAll(companyId: string): Promise<ShiftAssignment[]> {
    return this.repo.find({
      where: { companyId },
      order: { effectiveFrom: 'DESC', employeeName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ShiftAssignment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Shift assignment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ShiftAssignment> & { companyId: string },
  ): Promise<ShiftAssignment> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ShiftAssignment>,
  ): Promise<ShiftAssignment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
