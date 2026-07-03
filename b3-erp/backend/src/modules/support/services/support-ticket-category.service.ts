import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicketCategory } from '../entities/support-ticket-category.entity';

@Injectable()
export class SupportTicketCategoryService {
  constructor(
    @InjectRepository(SupportTicketCategory)
    private readonly repo: Repository<SupportTicketCategory>,
  ) {}

  async findAll(companyId: string): Promise<SupportTicketCategory[]> {
    return this.repo.find({
      where: { companyId },
      order: { ticketCount: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportTicketCategory> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(
    data: Partial<SupportTicketCategory> & { companyId: string },
  ): Promise<SupportTicketCategory> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<SupportTicketCategory>,
  ): Promise<SupportTicketCategory> {
    const category = await this.findOne(id);
    Object.assign(category, data);
    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.remove(category);
  }
}
