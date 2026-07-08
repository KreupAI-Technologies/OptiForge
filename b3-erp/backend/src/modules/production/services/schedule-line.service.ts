import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleLine } from '../entities/schedule-line.entity';

@Injectable()
export class ScheduleLineService {
  constructor(
    @InjectRepository(ScheduleLine)
    private readonly repo: Repository<ScheduleLine>,
  ) {}

  async create(createDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(filters?: { status?: string; workCenter?: string }): Promise<ScheduleLine[]> {
    const query = this.repo.createQueryBuilder('s');
    if (filters?.status) {
      query.andWhere('s.status = :status', { status: filters.status });
    }
    if (filters?.workCenter) {
      query.andWhere('s.workCenter = :workCenter', { workCenter: filters.workCenter });
    }
    query.orderBy('s.plannedStart', 'ASC');
    return query.getMany();
  }

  async findOne(id: string): Promise<ScheduleLine> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Schedule line with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Partial<ScheduleLine>): Promise<ScheduleLine> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /**
   * Publish a batch of schedule lines. If `ids` is supplied, only those lines
   * are published; otherwise every line still in 'scheduled' status is
   * published. Transitions status -> 'published' and stamps publishedAt.
   */
  async publish(ids?: string[]): Promise<{ published: number; lines: ScheduleLine[] }> {
    const query = this.repo.createQueryBuilder('s');
    if (ids && ids.length > 0) {
      query.where('s.id IN (:...ids)', { ids });
    } else {
      query.where('s.status = :status', { status: 'scheduled' });
    }
    const lines = await query.getMany();

    const now = new Date();
    for (const line of lines) {
      line.status = 'published';
      line.publishedAt = now;
    }
    const saved = await this.repo.save(lines);
    return { published: saved.length, lines: saved };
  }

  /**
   * Deterministic optimize / level-load pass. Groups lines by work center and
   * orders each group by priority (high>medium>low) then planned start, then
   * assigns a stable sequence number. No external solver — pure reorder.
   */
  async optimize(workCenter?: string): Promise<{ optimized: number; lines: ScheduleLine[] }> {
    const query = this.repo.createQueryBuilder('s');
    if (workCenter) {
      query.where('s.workCenter = :workCenter', { workCenter });
    }
    query.andWhere('s.status IN (:...statuses)', {
      statuses: ['scheduled', 'published'],
    });
    const lines = await query.getMany();

    const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const groups = new Map<string, ScheduleLine[]>();
    for (const line of lines) {
      const key = line.workCenter ?? '__unassigned__';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(line);
    }

    const updated: ScheduleLine[] = [];
    for (const group of groups.values()) {
      group.sort((a, b) => {
        const pa = priorityRank[a.priority] ?? 1;
        const pb = priorityRank[b.priority] ?? 1;
        if (pa !== pb) return pa - pb;
        const sa = a.plannedStart ? new Date(a.plannedStart).getTime() : 0;
        const sb = b.plannedStart ? new Date(b.plannedStart).getTime() : 0;
        return sa - sb;
      });
      group.forEach((line, idx) => {
        line.sequenceNo = idx + 1;
        updated.push(line);
      });
    }

    const saved = await this.repo.save(updated);
    return { optimized: saved.length, lines: saved };
  }
}
