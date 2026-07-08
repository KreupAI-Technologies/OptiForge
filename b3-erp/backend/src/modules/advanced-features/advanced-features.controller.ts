import { Controller, Get, Query } from '@nestjs/common';
import { AdvancedFeaturesService } from './services/advanced-features.service';

/**
 * Advanced Features read-side API.
 * Guarded by the global JwtAuthGuard (default-deny), matching neighbouring
 * modules — no @Public() annotation.
 *
 * Routes (global prefix /api/v1):
 *   GET /advanced-features/ai-insights          list of AI insights
 *   GET /advanced-features/ai-insights/stats     insight aggregate stats
 *   GET /advanced-features/ocr-documents         list of OCR documents
 *   GET /advanced-features/ocr-documents/stats   OCR aggregate stats
 */
@Controller('advanced-features')
export class AdvancedFeaturesController {
  constructor(private readonly service: AdvancedFeaturesService) {}

  @Get('ai-insights')
  listInsights(@Query('companyId') companyId = 'test') {
    return this.service.listInsights(companyId);
  }

  @Get('ai-insights/stats')
  insightStats(@Query('companyId') companyId = 'test') {
    return this.service.insightStats(companyId);
  }

  @Get('ocr-documents')
  listOcrDocuments(@Query('companyId') companyId = 'test') {
    return this.service.listOcrDocuments(companyId);
  }

  @Get('ocr-documents/stats')
  ocrStats(@Query('companyId') companyId = 'test') {
    return this.service.ocrStats(companyId);
  }
}
