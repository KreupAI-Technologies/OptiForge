import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumniComment } from '../entities/alumni-comment.entity';

@Injectable()
export class AlumniCommentService {
  constructor(
    @InjectRepository(AlumniComment)
    private readonly repo: Repository<AlumniComment>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { postId?: string; status?: string },
  ): Promise<AlumniComment[]> {
    const where: Record<string, any> = { companyId };
    if (filters?.postId) where.postId = filters.postId;
    if (filters?.status) where.status = filters.status;
    return this.repo.find({ where, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<AlumniComment> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Alumni comment ${id} not found`);
    return entity;
  }

  async create(
    data: Partial<AlumniComment> & { companyId: string; postId: string; body: string },
  ): Promise<AlumniComment> {
    return this.repo.save(this.repo.create(data));
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }
}
