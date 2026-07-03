import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeFaq } from '../entities/knowledge-faq.entity';

@Injectable()
export class KnowledgeFaqService {
  constructor(
    @InjectRepository(KnowledgeFaq)
    private readonly faqRepository: Repository<KnowledgeFaq>,
  ) {}

  async findAll(filters?: {
    search?: string;
    category?: string;
  }): Promise<KnowledgeFaq[]> {
    const qb = this.faqRepository.createQueryBuilder('faq');

    if (filters?.search) {
      qb.andWhere(
        '(faq.question ILIKE :search OR faq.answer ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.category) {
      qb.andWhere('faq.category = :category', { category: filters.category });
    }

    qb.orderBy('faq.helpful', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<KnowledgeFaq | null> {
    return this.faqRepository
      .createQueryBuilder('faq')
      .where('faq.id = :id', { id })
      .getOne();
  }
}
