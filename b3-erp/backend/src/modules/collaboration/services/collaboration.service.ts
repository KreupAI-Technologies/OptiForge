import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Resilient read service for collaboration features (files, folders, channels,
 * messages). Uses parameterized raw queries against the additive tables and
 * always resolves to an array — returning [] if a table is missing or empty,
 * so the UI degrades gracefully before the additive DDL has been applied.
 */
@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private async safeQuery<T = any>(sql: string, params: any[]): Promise<T[]> {
    try {
      const rows = await this.dataSource.query(sql, params);
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      this.logger.warn(
        `collaboration read fell back to []: ${(err as Error).message}`,
      );
      return [];
    }
  }

  async findFolders(companyId?: string): Promise<any[]> {
    const cid = companyId || 'test';
    return this.safeQuery(
      `SELECT * FROM collab_folders WHERE "companyId" = $1 ORDER BY "updatedAt" DESC LIMIT 500`,
      [cid],
    );
  }

  async findFiles(companyId?: string): Promise<any[]> {
    const cid = companyId || 'test';
    return this.safeQuery(
      `SELECT * FROM collab_files WHERE "companyId" = $1 ORDER BY "updatedAt" DESC LIMIT 500`,
      [cid],
    );
  }

  async findChannels(companyId?: string): Promise<any[]> {
    const cid = companyId || 'test';
    return this.safeQuery(
      `SELECT * FROM collab_channels WHERE "companyId" = $1 ORDER BY "lastMessageAt" DESC NULLS LAST, "updatedAt" DESC LIMIT 500`,
      [cid],
    );
  }

  async findMessages(companyId?: string, channelId?: string): Promise<any[]> {
    const cid = companyId || 'test';
    if (channelId) {
      return this.safeQuery(
        `SELECT * FROM collab_messages WHERE "companyId" = $1 AND "channelId" = $2 ORDER BY "sentAt" ASC, "createdAt" ASC LIMIT 500`,
        [cid, channelId],
      );
    }
    return this.safeQuery(
      `SELECT * FROM collab_messages WHERE "companyId" = $1 ORDER BY "sentAt" ASC, "createdAt" ASC LIMIT 500`,
      [cid],
    );
  }
}
