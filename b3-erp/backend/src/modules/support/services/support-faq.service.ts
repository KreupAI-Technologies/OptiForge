import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportFaq } from '../entities/support-faq.entity';

@Injectable()
export class SupportFaqService {
  constructor(
    @InjectRepository(SupportFaq)
    private readonly repo: Repository<SupportFaq>,
  ) {}

  async findAll(
    companyId: string,
    options?: { category?: string; featured?: boolean },
  ): Promise<SupportFaq[]> {
    const where: Record<string, unknown> = { companyId };
    if (options?.category && options.category !== 'all') {
      where.category = options.category;
    }
    if (options?.featured !== undefined) where.featured = options.featured;
    return this.repo.find({
      where,
      order: { views: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupportFaq> {
    const faq = await this.repo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException(`FAQ ${id} not found`);
    return faq;
  }

  async create(
    data: Partial<SupportFaq> & { companyId: string },
  ): Promise<SupportFaq> {
    if (!data.faqId) {
      const count = await this.repo.count({
        where: { companyId: data.companyId },
      });
      data.faqId = `FAQ-${String(count + 1).padStart(3, '0')}`;
    }
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<SupportFaq>): Promise<SupportFaq> {
    const faq = await this.findOne(id);
    Object.assign(faq, data);
    return this.repo.save(faq);
  }

  async remove(id: string): Promise<void> {
    const faq = await this.findOne(id);
    await this.repo.remove(faq);
  }
}
