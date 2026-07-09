import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRecord } from '../entities/activity-record.entity';
import { CrmActivityLike } from '../entities/crm-activity-like.entity';

@Injectable()
export class ActivityRecordService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly repo: Repository<ActivityRecord>,
    @InjectRepository(CrmActivityLike)
    private readonly likeRepo: Repository<CrmActivityLike>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    type?: string;
    status?: string;
  }): Promise<ActivityRecord[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ActivityRecord> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Activity ${id} not found`);
    return row;
  }

  async create(data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.likeRepo.delete({ activityId: id });
    await this.repo.remove(row);
  }

  /** User IDs that have liked a given activity. */
  async getLikers(id: string): Promise<string[]> {
    const likes = await this.likeRepo.find({ where: { activityId: id } });
    return likes.map((l) => l.userId);
  }

  /**
   * Toggle a like for a user on an activity. Inserts the like if absent,
   * removes it if present, then re-syncs the cached `likeCount`.
   */
  async toggleLike(
    id: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number; likes: string[] }> {
    const activity = await this.findOne(id);
    const existing = await this.likeRepo.findOne({
      where: { activityId: id, userId },
    });
    let liked: boolean;
    if (existing) {
      await this.likeRepo.remove(existing);
      liked = false;
    } else {
      await this.likeRepo.save(this.likeRepo.create({ activityId: id, userId }));
      liked = true;
    }
    const likes = await this.getLikers(id);
    activity.likeCount = likes.length;
    await this.repo.save(activity);
    return { liked, likeCount: likes.length, likes };
  }
}
