import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateComment } from '../entities/estimate-comment.entity';

@Injectable()
export class EstimateCommentService {
  constructor(
    @InjectRepository(EstimateComment)
    private estimateCommentRepository: Repository<EstimateComment>,
  ) {}

  async create(
    companyId: string,
    data: Partial<EstimateComment>,
  ): Promise<EstimateComment> {
    const entity = this.estimateCommentRepository.create({ ...data, companyId });
    return this.estimateCommentRepository.save(entity);
  }

  async findByEstimate(
    companyId: string,
    estimateId: string,
  ): Promise<EstimateComment[]> {
    return this.estimateCommentRepository.find({
      where: { companyId, estimateId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<EstimateComment> {
    const entity = await this.estimateCommentRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<EstimateComment>,
  ): Promise<EstimateComment> {
    const entity = await this.findOne(companyId, id);
    Object.assign(entity, data);
    return this.estimateCommentRepository.save(entity);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const entity = await this.findOne(companyId, id);
    await this.estimateCommentRepository.remove(entity);
  }
}
