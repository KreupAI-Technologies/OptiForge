import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingApprovalItem } from '../entities/pending-approval-item.entity';

@Injectable()
export class PendingApprovalItemService {
  constructor(
    @InjectRepository(PendingApprovalItem)
    private readonly pendingApprovalRepository: Repository<PendingApprovalItem>,
  ) {}

  async create(
    companyId: string,
    data: Partial<PendingApprovalItem>,
  ): Promise<PendingApprovalItem> {
    const item = this.pendingApprovalRepository.create({ ...data, companyId });
    return this.pendingApprovalRepository.save(item);
  }

  async findAll(
    companyId: string,
    filters?: { status?: string; priority?: string },
  ): Promise<PendingApprovalItem[]> {
    const query = this.pendingApprovalRepository
      .createQueryBuilder('item')
      .where('item.companyId = :companyId', { companyId })
      .orderBy('item.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('item.status = :status', { status: filters.status });
    }
    if (filters?.priority) {
      query.andWhere('item.priority = :priority', {
        priority: filters.priority,
      });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<PendingApprovalItem> {
    const item = await this.pendingApprovalRepository.findOne({
      where: { id, companyId },
    });
    if (!item) {
      throw new NotFoundException(`Pending approval with ID ${id} not found`);
    }
    return item;
  }

  async update(
    companyId: string,
    id: string,
    data: Partial<PendingApprovalItem>,
  ): Promise<PendingApprovalItem> {
    const item = await this.findOne(companyId, id);
    Object.assign(item, data);
    return this.pendingApprovalRepository.save(item);
  }

  async delete(companyId: string, id: string): Promise<void> {
    const item = await this.findOne(companyId, id);
    await this.pendingApprovalRepository.remove(item);
  }
}
