import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewMeeting } from '../entities/review-meeting.entity';

@Injectable()
export class ReviewMeetingService {
  constructor(
    @InjectRepository(ReviewMeeting)
    private readonly repo: Repository<ReviewMeeting>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { reviewId?: string; employeeId?: string; status?: string },
  ): Promise<ReviewMeeting[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.reviewId) where.reviewId = filters.reviewId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ReviewMeeting> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Review meeting ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<ReviewMeeting> & { companyId: string },
  ): Promise<ReviewMeeting> {
    const entity = this.repo.create({ status: 'scheduled', ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<ReviewMeeting>): Promise<ReviewMeeting> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /** Reschedule — move date/time and re-set status to scheduled. */
  async reschedule(
    id: string,
    data: { scheduledDate?: string; scheduledTime?: string; location?: string },
  ): Promise<ReviewMeeting> {
    const entity = await this.findOne(id);
    if (data.scheduledDate !== undefined) entity.scheduledDate = data.scheduledDate;
    if (data.scheduledTime !== undefined) entity.scheduledTime = data.scheduledTime;
    if (data.location !== undefined) entity.location = data.location;
    entity.status = 'scheduled';
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
