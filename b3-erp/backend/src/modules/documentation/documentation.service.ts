import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_COMPANY = 'default-company-id';

/**
 * Read-side service for in-app documentation / help-center articles.
 * Backed by the additive `doc_articles` table (Prisma read model).
 * Resolves to an array and degrades gracefully to [] if the table is
 * missing (before the additive DDL in orphan_documentation.sql is applied).
 */
@Injectable()
export class DocumentationService {
  private readonly logger = new Logger(DocumentationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findArticles(companyId?: string, category?: string, search?: string) {
    try {
      return await this.prisma.docArticle.findMany({
        where: {
          company_id: companyId || DEFAULT_COMPANY,
          ...(category && category !== 'all' ? { category } : {}),
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { body: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: [{ category: 'asc' }, { title: 'asc' }],
      });
    } catch (err) {
      this.logger.warn(
        `documentation read fell back to []: ${(err as Error).message}`,
      );
      return [];
    }
  }

  async findBySlug(slug: string, companyId?: string) {
    const row = await this.prisma.docArticle.findFirst({
      where: { slug, company_id: companyId || DEFAULT_COMPANY },
    });
    if (!row) throw new NotFoundException(`Article ${slug} not found`);
    return row;
  }
}
