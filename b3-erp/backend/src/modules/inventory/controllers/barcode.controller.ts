import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  BarcodeImportResult,
  BarcodeImportRow,
  BarcodeService,
} from '../services/barcode.service';
import { renderBarcodeLabelsPdf } from '../utils/barcode-label.util';

@ApiTags('Inventory - Barcodes')
@Controller('inventory/barcodes')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post('bulk-import')
  @ApiOperation({
    summary:
      'Bulk-import parsed barcode rows and attach them to serial-number records',
  })
  async bulkImport(
    @Body() body: BarcodeImportRow[] | { rows?: BarcodeImportRow[] },
  ): Promise<BarcodeImportResult> {
    // Accept either a bare array or a { rows: [...] } envelope.
    const rows = Array.isArray(body) ? body : (body?.rows ?? []);
    return this.barcodeService.bulkImport(rows);
  }

  @Get('labels')
  @ApiOperation({ summary: 'Generate a printable PDF label sheet for barcodes' })
  @ApiQuery({ name: 'ids', required: true, description: 'Comma-separated ids' })
  @ApiQuery({ name: 'format', required: false, description: 'pdf (default)' })
  async labels(
    @Query('ids') ids: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const idList = (ids ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const records = await this.barcodeService.findForLabels(idList);
    const buffer = await renderBarcodeLabelsPdf(
      records.map((r) => ({
        barcode: r.barcode || r.serialNumber || '',
        barcodeType: r.barcodeType || 'Code-128',
        itemCode: r.itemCode || '',
        itemName: r.itemName || '',
        serialNumber: r.serialNumber || '',
        location: r.locationName || r.warehouseName || '',
      })),
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="barcode-labels.pdf"',
    });
    return new StreamableFile(buffer);
  }
}
