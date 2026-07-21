import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { HrDocument } from '../entities/hr-document.entity';

/**
 * Document Repository — a VIEW/index over the existing `hr_documents` table.
 * Does NOT own its own table; reuses the HrDocument entity/repository. Browsing,
 * search and archiving are all expressed as queries/updates over hr_documents.
 */
@Injectable()
export class DocumentRepositoryService {
  constructor(
    @InjectRepository(HrDocument)
    private readonly repo: Repository<HrDocument>,
  ) {}

  async browse(
    companyId: string,
    filters?: { category?: string; documentType?: string; status?: string },
  ): Promise<HrDocument[]> {
    const qb = this.repo
      .createQueryBuilder('d')
      .where('d.companyId = :companyId', { companyId })
      .andWhere('d.archived = :archived', { archived: false });
    if (filters?.category)
      qb.andWhere('d.docCategory = :category', { category: filters.category });
    if (filters?.documentType)
      qb.andWhere('d.documentType = :documentType', {
        documentType: filters.documentType,
      });
    if (filters?.status)
      qb.andWhere('d.status = :status', { status: filters.status });
    return qb.orderBy('d.createdAt', 'DESC').getMany();
  }

  async search(companyId: string, q: string): Promise<HrDocument[]> {
    if (!q) return this.browse(companyId);
    const like = `%${q.toLowerCase()}%`;
    return this.repo
      .createQueryBuilder('d')
      .where('d.companyId = :companyId', { companyId })
      .andWhere('d.archived = :archived', { archived: false })
      .andWhere(
        new Brackets((w) => {
          w.where('LOWER(d.title) LIKE :like', { like })
            .orWhere('LOWER(d.documentType) LIKE :like', { like })
            .orWhere('LOWER(d.fileName) LIKE :like', { like })
            .orWhere('LOWER(d.remarks) LIKE :like', { like });
        }),
      )
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async listArchived(companyId: string): Promise<HrDocument[]> {
    return this.repo.find({
      where: { companyId, archived: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async archive(id: string): Promise<HrDocument> {
    const entity = await this.findOne(id);
    entity.archived = true;
    entity.status = 'archived';
    return this.repo.save(entity);
  }

  async unarchive(id: string): Promise<HrDocument> {
    const entity = await this.findOne(id);
    entity.archived = false;
    if (entity.status === 'archived') entity.status = 'pending';
    return this.repo.save(entity);
  }

  async upload(
    data: Partial<HrDocument> & { companyId: string },
  ): Promise<HrDocument> {
    return this.repo.save(
      this.repo.create({ ...data, companyId: data.companyId || 'company-1' }),
    );
  }

  /**
   * Returns the stored fileUrl if present, otherwise a clear "not available"
   * response. We NEVER fabricate a file; actual blob storage is a residual TODO.
   */
  async download(
    id: string,
  ): Promise<{ available: boolean; fileUrl?: string; fileName?: string }> {
    const entity = await this.findOne(id);
    if (entity.fileUrl) {
      return {
        available: true,
        fileUrl: entity.fileUrl,
        fileName: entity.fileName,
      };
    }
    return { available: false, fileName: entity.fileName };
  }

  private async findOne(id: string): Promise<HrDocument> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Document ${id} not found`);
    return entity;
  }
}
