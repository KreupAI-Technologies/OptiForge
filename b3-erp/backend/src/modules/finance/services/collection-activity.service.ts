import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionActivity } from '../entities/collection-activity.entity';

@Injectable()
export class CollectionActivityService {
  constructor(
    @InjectRepository(CollectionActivity)
    private readonly repo: Repository<CollectionActivity>,
  ) {}

  async findAll(): Promise<CollectionActivity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByReceivable(receivableId: string): Promise<CollectionActivity[]> {
    return this.repo.find({
      where: { receivableId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CollectionActivity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Collection activity ${id} not found`);
    }
    return row;
  }

  async create(dto: Partial<CollectionActivity>): Promise<CollectionActivity> {
    const row = this.repo.create(dto);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { success: true };
  }
}
