import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleFuel } from '../entities/vehicle-fuel.entity';

@Injectable()
export class VehicleFuelService {
  constructor(
    @InjectRepository(VehicleFuel)
    private readonly repo: Repository<VehicleFuel>,
  ) {}

  async findAll(companyId: string): Promise<VehicleFuel[]> {
    return this.repo.find({
      where: { companyId },
      order: { fuelDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<VehicleFuel> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Fuel record ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<VehicleFuel> & { companyId: string },
  ): Promise<VehicleFuel> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<VehicleFuel>): Promise<VehicleFuel> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
