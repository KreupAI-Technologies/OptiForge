import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricDevice } from '../entities/biometric-device.entity';

@Injectable()
export class BiometricDeviceService {
  constructor(
    @InjectRepository(BiometricDevice)
    private readonly repo: Repository<BiometricDevice>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { status?: string },
  ): Promise<BiometricDevice[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<BiometricDevice> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Biometric device ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<BiometricDevice> & { companyId: string },
  ): Promise<BiometricDevice> {
    const entity = this.repo.create({ status: 'online', ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<BiometricDevice>): Promise<BiometricDevice> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
