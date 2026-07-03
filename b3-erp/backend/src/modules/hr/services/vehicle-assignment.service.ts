import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';

@Injectable()
export class VehicleAssignmentService {
  constructor(
    @InjectRepository(VehicleAssignment)
    private readonly repo: Repository<VehicleAssignment>,
  ) {}

  async findAll(companyId: string, filter?: string): Promise<VehicleAssignment[]> {
    const where: FindOptionsWhere<VehicleAssignment> = { companyId } as FindOptionsWhere<VehicleAssignment>;
    if (filter) (where as Record<string, string>).status = filter;
    return this.repo.find({ where, order: { assignmentDate: 'DESC' } as any });
  }

  async findOne(id: string): Promise<VehicleAssignment> {
    const entity = await this.repo.findOne({ where: { id } as FindOptionsWhere<VehicleAssignment> });
    if (!entity) throw new NotFoundException(`Vehicle assignment ${id} not found`);
    return entity;
  }

  async create(data: Partial<VehicleAssignment> & { companyId: string }): Promise<VehicleAssignment> {
    return this.repo.save(this.repo.create(data as VehicleAssignment));
  }

  async update(id: string, data: Partial<VehicleAssignment>): Promise<VehicleAssignment> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
