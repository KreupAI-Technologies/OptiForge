import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  contentTypeFor,
  fileExtensionFor,
  normalizeFormat,
  renderReport,
  safeFileName,
} from '../../common/utils/report-render.util';
import { ReportGenerationService } from './services/report-generation.service';

const DEFAULT_COMPANY_ID = 'default';

/**
 * Report rendering / execution + file download for the reports module.
 *   POST reports/custom/:id/run           -> run a saved custom report (rows JSON)
 *   GET  reports/custom/:id/export        -> download a saved custom report file
 *   GET  reports/financial/export         -> download a financial report file
 *
 * Declared before the base ReportsController so these static prefixes resolve
 * ahead of the generic reports routes.
 */
@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportGenerationController {
  constructor(private readonly generation: ReportGenerationService) {}

  @Post('custom/:id/run')
  @ApiOperation({ summary: 'Run a saved custom report and return its rows' })
  run(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.generation.run(id, companyId || DEFAULT_COMPANY_ID);
  }

  @Get('custom/:id/export')
  @ApiOperation({ summary: 'Download a saved custom report as a file' })
  async exportCustom(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const def = await this.generation.buildSavedDefinition(
      id,
      companyId || DEFAULT_COMPANY_ID,
    );
    const buffer = await renderReport(def, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Get('financial/export')
  @ApiOperation({ summary: 'Generate + download a financial report file' })
  async exportFinancial(
    @Query('companyId') companyId: string,
    @Query('format') format: string,
    @Query('reportKey') reportKey: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const def = await this.generation.buildFinancialDefinition(
      companyId || DEFAULT_COMPANY_ID,
      reportKey || undefined,
    );
    const buffer = await renderReport(def, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
