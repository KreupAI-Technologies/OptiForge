import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recognition } from '../entities/recognition.entity';
import { RecognitionComment } from '../entities/recognition-comment.entity';

@Injectable()
export class RecognitionService {
  constructor(
    @InjectRepository(Recognition)
    private readonly repo: Repository<Recognition>,
    @InjectRepository(RecognitionComment)
    private readonly commentRepo: Repository<RecognitionComment>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { toEmployeeId?: string; fromEmployeeId?: string },
  ): Promise<Recognition[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.toEmployeeId) where.toEmployeeId = filters.toEmployeeId;
    if (filters?.fromEmployeeId) where.fromEmployeeId = filters.fromEmployeeId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Recognition> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Recognition ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<Recognition> & { companyId: string },
  ): Promise<Recognition> {
    const entity = this.repo.create({ likes: 0, likedBy: [], ...data });
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Recognition>): Promise<Recognition> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /** Idempotent like — a repeat like by the same employee is a no-op. */
  async like(id: string, employeeId: string): Promise<Recognition> {
    const entity = await this.findOne(id);
    const likedBy = entity.likedBy ?? [];
    if (employeeId && !likedBy.includes(employeeId)) {
      likedBy.push(employeeId);
      entity.likedBy = likedBy;
      entity.likes = likedBy.length;
      return this.repo.save(entity);
    }
    return entity;
  }

  async findComments(recognitionId: string): Promise<RecognitionComment[]> {
    return this.commentRepo.find({
      where: { recognitionId },
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(
    recognitionId: string,
    data: Partial<RecognitionComment>,
  ): Promise<RecognitionComment> {
    await this.findOne(recognitionId); // 404 if the recognition doesn't exist
    const comment = this.commentRepo.create({ ...data, recognitionId });
    return this.commentRepo.save(comment);
  }
}
