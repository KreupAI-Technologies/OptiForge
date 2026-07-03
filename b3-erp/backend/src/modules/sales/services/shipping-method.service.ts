import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from '../entities/shipping-method.entity';

@Injectable()
export class ShippingMethodService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly repo: Repository<ShippingMethod>,
  ) {}

  async findAll(companyId?: string): Promise<ShippingMethod[]> {
    const where = companyId ? { companyId } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ShippingMethod> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Shipping method ${id} not found`);
    return row;
  }

  async create(data: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { deleted: true };
  }
}
