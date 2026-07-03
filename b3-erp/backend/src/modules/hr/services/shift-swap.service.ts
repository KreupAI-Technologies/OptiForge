import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftSwap } from '../entities/shift-swap.entity';

@Injectable()
export class ShiftSwapService {
  constructor(
    @InjectRepository(ShiftSwap)
    private readonly repo: Repository<ShiftSwap>,
  ) {}

  async findAll(companyId: string): Promise<ShiftSwap[]> {
    return this.repo.find({
      where: { companyId },
      order: { requestDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ShiftSwap> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Shift swap ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ShiftSwap> & { companyId: string },
  ): Promise<ShiftSwap> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<ShiftSwap>): Promise<ShiftSwap> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
