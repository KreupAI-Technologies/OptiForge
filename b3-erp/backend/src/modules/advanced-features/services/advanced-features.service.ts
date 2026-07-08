import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Read-side service for the Advanced Features pages.
 *
 * Backs:
 *  - AI Insights dashboard  (ai_insights table)
 *  - OCR document processing (ocr_documents table)
 *
 * Every query is defensive: if a table is missing or empty the service falls
 * back to an empty list / zeroed stats so the endpoints always return a
 * render-safe payload.
 */
@Injectable()
export class AdvancedFeaturesService {
  private readonly logger = new Logger(AdvancedFeaturesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // AI Insights
  // -------------------------------------------------------------------------
  async listInsights(companyId: string) {
    try {
      const rows = await this.prisma.aiInsight.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
      return { data: rows, total: rows.length };
    } catch (err) {
      this.logger.warn(
        `listInsights failed, returning empty (${(err as Error)?.message ?? err})`,
      );
      return { data: [], total: 0 };
    }
  }

  async insightStats(companyId: string) {
    const empty = {
      total: 0,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      avgConfidence: 0,
    };
    try {
      const rows = await this.prisma.aiInsight.findMany({
        where: { companyId },
        select: { category: true, severity: true, confidence: true },
      });
      if (rows.length === 0) return empty;

      const byCategory: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      let confSum = 0;
      for (const r of rows) {
        byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
        const sev = r.severity ?? 'info';
        bySeverity[sev] = (bySeverity[sev] ?? 0) + 1;
        confSum += r.confidence ?? 0;
      }
      return {
        total: rows.length,
        byCategory,
        bySeverity,
        avgConfidence: Number((confSum / rows.length).toFixed(3)),
      };
    } catch (err) {
      this.logger.warn(
        `insightStats failed, returning empty (${(err as Error)?.message ?? err})`,
      );
      return empty;
    }
  }

  // -------------------------------------------------------------------------
  // OCR Documents
  // -------------------------------------------------------------------------
  async listOcrDocuments(companyId: string) {
    try {
      const rows = await this.prisma.ocrDocument.findMany({
        where: { companyId },
        orderBy: { uploadedAt: 'desc' },
      });
      return { data: rows, total: rows.length };
    } catch (err) {
      this.logger.warn(
        `listOcrDocuments failed, returning empty (${(err as Error)?.message ?? err})`,
      );
      return { data: [], total: 0 };
    }
  }

  async ocrStats(companyId: string) {
    const empty = {
      total: 0,
      byStatus: {} as Record<string, number>,
      completed: 0,
      processing: 0,
      queued: 0,
      failed: 0,
      avgConfidence: 0,
    };
    try {
      const rows = await this.prisma.ocrDocument.findMany({
        where: { companyId },
        select: { status: true, confidence: true },
      });
      if (rows.length === 0) return empty;

      const byStatus: Record<string, number> = {};
      let confSum = 0;
      let confCount = 0;
      for (const r of rows) {
        const st = r.status ?? 'queued';
        byStatus[st] = (byStatus[st] ?? 0) + 1;
        if (st === 'completed') {
          confSum += r.confidence ?? 0;
          confCount += 1;
        }
      }
      return {
        total: rows.length,
        byStatus,
        completed: byStatus['completed'] ?? 0,
        processing: byStatus['processing'] ?? 0,
        queued: byStatus['queued'] ?? 0,
        failed: byStatus['failed'] ?? 0,
        avgConfidence:
          confCount > 0 ? Number((confSum / confCount).toFixed(3)) : 0,
      };
    } catch (err) {
      this.logger.warn(
        `ocrStats failed, returning empty (${(err as Error)?.message ?? err})`,
      );
      return empty;
    }
  }
}
