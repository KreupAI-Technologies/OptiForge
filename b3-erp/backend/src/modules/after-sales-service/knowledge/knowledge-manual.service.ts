import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeManual } from '../entities/knowledge-manual.entity';

@Injectable()
export class KnowledgeManualService {
  constructor(
    @InjectRepository(KnowledgeManual)
    private readonly manualRepository: Repository<KnowledgeManual>,
  ) {}

  async findAll(filters?: {
    search?: string;
    category?: string;
    format?: string;
  }): Promise<KnowledgeManual[]> {
    const qb = this.manualRepository.createQueryBuilder('manual');

    if (filters?.search) {
      qb.andWhere(
        '(manual.title ILIKE :search OR manual.productModel ILIKE :search OR manual.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters?.category) {
      qb.andWhere('manual.category = :category', { category: filters.category });
    }
    if (filters?.format) {
      qb.andWhere('manual.format = :format', { format: filters.format });
    }

    qb.orderBy('manual.datePublished', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<KnowledgeManual | null> {
    return this.manualRepository
      .createQueryBuilder('manual')
      .where('manual.id = :id', { id })
      .getOne();
  }
}
