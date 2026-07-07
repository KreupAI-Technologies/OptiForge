import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CPQApprovalItem } from '../entities/cpq-approval-item.entity';

export interface CPQApprovalComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

@Injectable()
export class CPQApprovalItemService {
  constructor(
    @InjectRepository(CPQApprovalItem)
    private readonly approvalItemRepository: Repository<CPQApprovalItem>,
  ) {}

  async findAll(
    companyId: string,
    filters?: { category?: string; status?: string },
  ): Promise<CPQApprovalItem[]> {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }

    const query = this.approvalItemRepository
      .createQueryBuilder('item')
      .where('item.companyId = :companyId', { companyId })
      .orderBy('item.createdAt', 'DESC');

    if (filters?.category) {
      query.andWhere('item.category = :category', {
        category: filters.category,
      });
    }
    if (filters?.status) {
      query.andWhere('item.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<CPQApprovalItem> {
    const item = await this.approvalItemRepository.findOne({
      where: { id, companyId },
    });
    if (!item) {
      throw new NotFoundException(`Approval item with ID ${id} not found`);
    }
    return item;
  }

  async create(
    companyId: string,
    data: Partial<CPQApprovalItem>,
  ): Promise<CPQApprovalItem> {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
    const item = this.approvalItemRepository.create({ ...data, companyId });
    return this.approvalItemRepository.save(item);
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<CPQApprovalItem>,
  ): Promise<CPQApprovalItem> {
    const item = await this.findOne(companyId, id);
    Object.assign(item, data);
    return this.approvalItemRepository.save(item);
  }

  async decide(
    companyId: string,
    id: string,
    status: CPQApprovalItem['status'],
  ): Promise<CPQApprovalItem> {
    const item = await this.findOne(companyId, id);
    item.status = status;
    return this.approvalItemRepository.save(item);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const item = await this.findOne(companyId, id);
    await this.approvalItemRepository.remove(item);
  }

  /**
   * Append a comment to an approval item. Comments live in the flexible
   * `payload.comments` array so no schema change is required.
   */
  async addComment(
    companyId: string,
    id: string,
    input: { text: string; author?: string },
  ): Promise<CPQApprovalItem> {
    if (!input?.text || !input.text.trim()) {
      throw new BadRequestException('Comment text is required');
    }
    const item = await this.findOne(companyId, id);
    const payload = (item.payload ?? {}) as Record<string, unknown>;
    const comments: CPQApprovalComment[] = Array.isArray(payload.comments)
      ? (payload.comments as CPQApprovalComment[])
      : [];
    comments.push({
      id: randomUUID(),
      author: input.author?.trim() || 'You',
      text: input.text.trim(),
      createdAt: new Date().toISOString(),
    });
    item.payload = { ...payload, comments };
    return this.approvalItemRepository.save(item);
  }
}
