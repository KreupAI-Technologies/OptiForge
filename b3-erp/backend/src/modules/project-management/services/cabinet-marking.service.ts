import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CabinetMarkingTask } from '../entities/cabinet-marking-task.entity';

@Injectable()
export class CabinetMarkingService {
  constructor(
    @InjectRepository(CabinetMarkingTask)
    private readonly repo: Repository<CabinetMarkingTask>,
  ) {}

  async list(projectId?: string): Promise<CabinetMarkingTask[]> {
    if (projectId) {
      const rows = await this.repo.find({
        where: { projectId },
        order: { createdAt: 'DESC' },
      });
      // Demo fallback: if the requested project has no tasks yet, surface the
      // seeded demo tasks so the page is never empty on a fresh database.
      if (rows.length === 0) {
        return this.repo.find({
          where: { projectId: 'DEMO-PROJECT' },
          order: { createdAt: 'DESC' },
        });
      }
      return rows;
    }
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<CabinetMarkingTask>): Promise<CabinetMarkingTask> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<CabinetMarkingTask>,
  ): Promise<CabinetMarkingTask> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Cabinet marking task ${id} not found`);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Cabinet marking task ${id} not found`);
    await this.repo.remove(row);
  }
}
