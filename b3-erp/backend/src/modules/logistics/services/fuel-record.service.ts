import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelRecord } from '../entities/fuel-record.entity';

@Injectable()
export class FuelRecordService {
  constructor(
    @InjectRepository(FuelRecord)
    private readonly repo: Repository<FuelRecord>,
  ) {}

  async create(data: Partial<FuelRecord>): Promise<FuelRecord> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findAll(filters?: {
    status?: string;
    fuelType?: string;
    vehicleNumber?: string;
  }): Promise<FuelRecord[]> {
    const query = this.repo.createQueryBuilder('fuel');

    if (filters?.status) {
      query.andWhere('fuel.status = :status', { status: filters.status });
    }
    if (filters?.fuelType) {
      query.andWhere('fuel.fuelType = :ft', { ft: filters.fuelType });
    }
    if (filters?.vehicleNumber) {
      query.andWhere('fuel.vehicleNumber = :vn', {
        vn: filters.vehicleNumber,
      });
    }

    query.orderBy('fuel.filledDate', 'DESC');
    return query.getMany();
  }

  async findOne(id: string): Promise<FuelRecord> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Fuel record with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, data: Partial<FuelRecord>): Promise<FuelRecord> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
