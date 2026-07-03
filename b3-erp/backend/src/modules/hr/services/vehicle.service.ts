import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  async findAll(companyId: string): Promise<Vehicle[]> {
    return this.repo.find({
      where: { companyId },
      order: { vehicleNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Vehicle ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<Vehicle> & { companyId: string },
  ): Promise<Vehicle> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
