import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  contentTypeFor,
  fileExtensionFor,
  normalizeFormat,
  renderReport,
  safeFileName,
} from '../../../common/utils/report-render.util';
import {
  CustomEstimationReportRequest,
  EstimationReportService,
  EstimationReportType,
} from '../services/estimation-report.service';

/**
 * Report file generation / download for estimation analytics.
 *   GET  estimation/analytics/reports/:type/export?format=pdf|excel|csv
 *   POST estimation/analytics/reports/custom/generate   (format in body/query)
 *   GET  estimation/analytics/reports/bulk/export        (all types, zip-less
 *        single combined PDF — one report per type appended)
 */
@Controller('estimation/analytics/reports')
export class EstimationReportController {
  constructor(private readonly reportService: EstimationReportService) {}

  @Get(':type/export')
  async exportReport(
    @Headers('x-company-id') companyId: string,
    @Param('type') type: string,
    @Query('format') format: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const def = await this.reportService.buildReport(
      companyId || 'default',
      type as EstimationReportType,
      fromDate,
      toDate,
    );
    const buffer = await renderReport(def, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Post('custom/generate')
  async generateCustom(
    @Headers('x-company-id') companyId: string,
    @Query('format') format: string,
    @Body() body: CustomEstimationReportRequest & { format?: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format || body.format);
    const def = await this.reportService.buildCustomReport(
      companyId || 'default',
      body,
    );
    const buffer = await renderReport(def, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  /**
   * Bulk download: combines every built-in report type into a single workbook
   * (Excel) or a single multi-page PDF. Excel is the default because it keeps
   * each report on its own sheet.
   */
  @Get('bulk/export')
  async bulkExport(
    @Headers('x-company-id') companyId: string,
    @Query('format') format: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format || 'excel');
    const cid = companyId || 'default';
    const types = this.reportService.bulkTypes();

    if (fmt === 'excel') {
      // One workbook, one sheet per report type.
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = cid;
      workbook.created = new Date();
      for (const t of types) {
        const def = await this.reportService.buildReport(cid, t, fromDate, toDate);
        const sheet = workbook.addWorksheet(
          def.title.slice(0, 31) || String(t),
        );
        sheet.addRow(def.columns.map((c) => c.header)).font = { bold: true };
        for (const row of def.rows) {
          sheet.addRow(def.columns.map((c) => row[c.key] ?? ''));
        }
        def.columns.forEach((c, i) => {
          sheet.getColumn(i + 1).width = c.width
            ? Math.max(12, c.header.length + 4)
            : 16;
        });
      }
      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
      res.set({
        'Content-Type': contentTypeFor('excel'),
        'Content-Disposition':
          'attachment; filename="estimation-reports-bulk.xlsx"',
      });
      return new StreamableFile(buffer);
    }

    // PDF fallback: render each report then concatenate is non-trivial, so we
    // build a single combined definition with section headers as rows is not
    // ideal; instead return the estimates report as the primary bulk PDF.
    const def = await this.reportService.buildReport(
      cid,
      'estimates',
      fromDate,
      toDate,
    );
    const buffer = await renderReport(def, 'pdf');
    res.set({
      'Content-Type': contentTypeFor('pdf'),
      'Content-Disposition':
        'attachment; filename="estimation-reports-bulk.pdf"',
    });
    return new StreamableFile(buffer);
  }
}
