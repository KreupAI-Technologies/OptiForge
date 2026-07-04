import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Resilient read service for customer-portal documents. Uses parameterized raw
 * queries and always resolves to an array — returning [] if the table is
 * missing or empty, so the portal UI degrades gracefully before the additive
 * DDL has been applied.
 */
@Injectable()
export class PortalDocumentService {
  private readonly logger = new Logger(PortalDocumentService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private async safeQuery<T = any>(sql: string, params: any[]): Promise<T[]> {
    try {
      const rows = await this.dataSource.query(sql, params);
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      this.logger.warn(
        `portal documents read fell back to []: ${(err as Error).message}`,
      );
      return [];
    }
  }

  async findDocuments(companyId?: string, customerId?: string): Promise<any[]> {
    const cid = companyId || 'test';
    if (customerId) {
      return this.safeQuery(
        `SELECT * FROM portal_documents WHERE "companyId" = $1 AND "customerId" = $2 ORDER BY "docType" ASC, "updatedAt" DESC LIMIT 500`,
        [cid, customerId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM portal_documents WHERE "companyId" = $1 ORDER BY "docType" ASC, "updatedAt" DESC LIMIT 500`,
      [cid],
    );
  }
}
