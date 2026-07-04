import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotDevice } from '../entities/iot-device.entity';

@Injectable()
export class IotDeviceService {
  constructor(
    @InjectRepository(IotDevice)
    private readonly repo: Repository<IotDevice>,
  ) {}

  async findAll(
    companyId: string,
    options?: { status?: string; type?: string },
  ): Promise<IotDevice[]> {
    try {
      const where: Record<string, unknown> = { companyId };
      if (options?.status && options.status !== 'All') {
        where.status = options.status;
      }
      if (options?.type && options.type !== 'All') where.type = options.type;
      return await this.repo.find({
        where,
        order: { name: 'ASC', createdAt: 'DESC' },
      });
    } catch {
      // Table not yet created / empty — degrade gracefully.
      return [];
    }
  }

  async findOne(id: string): Promise<IotDevice> {
    const device = await this.repo.findOne({ where: { id } });
    if (!device) throw new NotFoundException(`IoT device ${id} not found`);
    return device;
  }

  async create(
    data: Partial<IotDevice> & { companyId: string },
  ): Promise<IotDevice> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<IotDevice>): Promise<IotDevice> {
    const device = await this.findOne(id);
    Object.assign(device, data);
    return this.repo.save(device);
  }

  async remove(id: string): Promise<void> {
    const device = await this.findOne(id);
    await this.repo.remove(device);
  }
}
