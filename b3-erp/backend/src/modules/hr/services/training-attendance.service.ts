import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingAttendance } from '../entities/training-attendance.entity';

@Injectable()
export class TrainingAttendanceService {
  constructor(
    @InjectRepository(TrainingAttendance)
    private readonly repo: Repository<TrainingAttendance>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { scheduleId?: string; enrollmentId?: string; date?: string },
  ): Promise<TrainingAttendance[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.scheduleId) where.scheduleId = filters.scheduleId;
    if (filters?.enrollmentId) where.enrollmentId = filters.enrollmentId;
    if (filters?.date) where.date = filters.date;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<TrainingAttendance> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException(`Training attendance ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<TrainingAttendance> & { companyId: string },
  ): Promise<TrainingAttendance> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<TrainingAttendance>,
  ): Promise<TrainingAttendance> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /** Append or set a note on an attendance record (FE addAttendanceNote). */
  async addNote(id: string, note: string): Promise<TrainingAttendance> {
    const entity = await this.findOne(id);
    entity.note = note;
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
