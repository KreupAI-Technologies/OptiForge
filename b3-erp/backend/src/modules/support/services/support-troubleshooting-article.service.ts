import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTroubleshootingArticle } from '../entities/support-troubleshooting-article.entity';

@Injectable()
export class SupportTroubleshootingArticleService {
  constructor(
    @InjectRepository(SupportTroubleshootingArticle)
    private readonly repo: Repository<SupportTroubleshootingArticle>,
  ) {}

  findAll(companyId: string): Promise<SupportTroubleshootingArticle[]> {
    return this.repo.find({
      where: { companyId },
      order: { views: 'DESC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SupportTroubleshootingArticle> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Article ${id} not found`);
    return found;
  }

  create(
    data: Partial<SupportTroubleshootingArticle> & { companyId: string },
  ): Promise<SupportTroubleshootingArticle> {
    return this.repo.save(this.repo.create(data));
  }

  async update(
    id: string,
    data: Partial<SupportTroubleshootingArticle>,
  ): Promise<SupportTroubleshootingArticle> {
    const found = await this.findOne(id);
    Object.assign(found, data);
    return this.repo.save(found);
  }

  async remove(id: string): Promise<void> {
    const found = await this.findOne(id);
    await this.repo.remove(found);
  }
}
