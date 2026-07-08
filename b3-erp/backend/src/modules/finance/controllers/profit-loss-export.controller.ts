import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { FinancialReportsService } from '../services/financial-reports.service';
import {
  ReportDefinition,
  ReportFormat,
  contentTypeFor,
  fileExtensionFor,
  normalizeFormat,
  renderReport,
  safeFileName,
} from '../../../common/utils/report-render.util';

/**
 * Profit & Loss document export. Builds a real PDF (pdfkit) or Excel (exceljs)
 * from the live P&L data produced by FinancialReportsService.
 *
 * Routes (all equivalent, to match existing frontend callers):
 *   GET /finance/profit-loss/export?format=pdf|excel
 *   GET /finance/profit-loss/export/pdf
 *   GET /finance/profit-loss/export/excel
 */
@ApiTags('Finance - Reports Export')
@Controller('finance/profit-loss')
export class ProfitLossExportController {
  constructor(private readonly reports: FinancialReportsService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export the Profit & Loss statement (pdf|excel)' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'excel'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'periodId', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'P&L document' })
  async export(
    @Res({ passthrough: true }) res: Response,
    @Query('format') format?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('periodId') periodId?: string,
  ): Promise<StreamableFile> {
    return this.build(res, normalizeFormat(format), {
      startDate,
      endDate,
      periodId,
    });
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export the Profit & Loss statement as PDF' })
  async exportPdf(
    @Res({ passthrough: true }) res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('periodId') periodId?: string,
  ): Promise<StreamableFile> {
    return this.build(res, 'pdf', { startDate, endDate, periodId });
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export the Profit & Loss statement as Excel' })
  async exportExcel(
    @Res({ passthrough: true }) res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('periodId') periodId?: string,
  ): Promise<StreamableFile> {
    return this.build(res, 'excel', { startDate, endDate, periodId });
  }

  private async build(
    res: Response,
    format: ReportFormat,
    params: { startDate?: string; endDate?: string; periodId?: string },
  ): Promise<StreamableFile> {
    const pl = await this.reports.getProfitLossStatement({
      startDate: params.startDate,
      endDate: params.endDate,
      periodId: params.periodId,
    });

    const period =
      params.startDate && params.endDate
        ? `${params.startDate} to ${params.endDate}`
        : 'All periods';

    const def: ReportDefinition = {
      title: 'Profit & Loss Statement',
      subtitle: period,
      companyLabel: 'ManufacturingOS',
      generatedAt: new Date(),
      columns: [
        { key: 'line', header: 'Line Item', width: 3 },
        { key: 'amount', header: 'Amount', width: 1.5, numeric: true },
      ],
      rows: [
        { line: 'Total Revenue', amount: pl.totalRevenue ?? 0 },
        { line: 'Cost of Goods Sold', amount: pl.totalCOGS ?? 0 },
        { line: 'Gross Profit', amount: pl.grossProfit ?? 0 },
        { line: 'Operating Expenses', amount: pl.totalExpenses ?? 0 },
        { line: 'Net Profit / (Loss)', amount: pl.netProfitLoss ?? 0 },
      ],
      summary: {
        'Total Revenue': pl.totalRevenue ?? 0,
        'Gross Profit': pl.grossProfit ?? 0,
        'Net Profit / (Loss)': pl.netProfitLoss ?? 0,
      },
    };

    const buffer = await renderReport(def, format);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(format)}`;
    res.set({
      'Content-Type': contentTypeFor(format),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
