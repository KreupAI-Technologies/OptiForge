import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmScheduleTaskEntity } from '../entities/pm-schedule-task.entity';

@Injectable()
export class PmScheduleService {
  constructor(
    @InjectRepository(PmScheduleTaskEntity)
    private readonly repo: Repository<PmScheduleTaskEntity>,
  ) {}

  async findAll(companyId = 'default', status?: string): Promise<PmScheduleTaskEntity[]> {
    const where: any = { companyId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<PmScheduleTaskEntity> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Schedule task ${id} not found`);
    return row;
  }

  async create(data: Partial<PmScheduleTaskEntity>): Promise<PmScheduleTaskEntity> {
    const row = this.repo.create({ companyId: 'default', ...data });
    return this.repo.save(row);
  }

  async update(id: string, data: Partial<PmScheduleTaskEntity>): Promise<PmScheduleTaskEntity> {
    const row = await this.findOne(id);
    const { id: _id, createdAt, updatedAt, ...rest } = data as any;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Schedule task ${id} not found`);
  }

  /**
   * Aggregate schedule tasks into phase-level progress rollups.
   * Backs the phase-progress / workflow / phase-2 pages. Read-only derivation
   * over pm_schedule_tasks — no separate phases table required.
   */
  async getPhases(companyId = 'default'): Promise<
    Array<{
      phase: string;
      taskCount: number;
      progress: number;
      status: string;
      startDate: string | null;
      endDate: string | null;
      tasks: Array<{ id: string; name: string; status: string; progress: number; assignee: string | null }>;
    }>
  > {
    const rows = await this.repo.find({
      where: { companyId },
      order: { phase: 'ASC', createdAt: 'ASC' },
    });

    const byPhase = new Map<string, PmScheduleTaskEntity[]>();
    for (const row of rows) {
      const key = (row.phase && String(row.phase).trim()) || 'Unassigned';
      if (!byPhase.has(key)) byPhase.set(key, []);
      byPhase.get(key)!.push(row);
    }

    const result: Array<{
      phase: string;
      taskCount: number;
      progress: number;
      status: string;
      startDate: string | null;
      endDate: string | null;
      tasks: Array<{ id: string; name: string; status: string; progress: number; assignee: string | null }>;
    }> = [];

    for (const [phase, tasks] of byPhase.entries()) {
      const taskCount = tasks.length;
      const progress =
        taskCount === 0
          ? 0
          : Math.round(tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / taskCount);

      let status: string;
      if (progress >= 100) status = 'completed';
      else if (tasks.some((t) => String(t.status).toLowerCase().includes('block'))) status = 'blocked';
      else if (progress > 0 || tasks.some((t) => String(t.status).toLowerCase().includes('progress')))
        status = 'in-progress';
      else status = 'pending';

      const startDates = tasks.map((t) => t.startDate).filter(Boolean).sort();
      const endDates = tasks.map((t) => t.endDate).filter(Boolean).sort();

      result.push({
        phase,
        taskCount,
        progress,
        status,
        startDate: startDates.length ? startDates[0] : null,
        endDate: endDates.length ? endDates[endDates.length - 1] : null,
        tasks: tasks.map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          progress: Number(t.progress) || 0,
          assignee: t.assignee || null,
        })),
      });
    }

    return result;
  }
}
