import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  StreamableFile,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  GstReturnService,
  ImportGstr2aDto,
  FileGstReturnDto,
} from '../services/gst-return.service';
import {
  contentTypeFor,
  fileExtensionFor,
  normalizeFormat,
  safeFileName,
} from '../../../common/utils/report-render.util';

@ApiTags('Finance - GST Returns')
@Controller('finance/gst')
export class GstReturnController {
  constructor(private readonly service: GstReturnService) {}

  @Get('returns')
  @ApiOperation({ summary: 'List GST return / GSTR-2A records' })
  @ApiQuery({ name: 'returnType', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of GST returns' })
  async findAll(
    @Query('returnType') returnType?: string,
    @Query('period') period?: string,
    @Query('status') status?: string,
  ): Promise<any[]> {
    return this.service.findAll({ returnType, period, status });
  }

  @Get('returns/:id')
  @ApiOperation({ summary: 'Get a GST return by id' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post('gstr-2a/import')
  @ApiOperation({ summary: 'Record / import a GSTR-2A dataset (JSON rows)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Imported record' })
  async importGstr2a(@Body() dto: ImportGstr2aDto): Promise<any> {
    return this.service.importGstr2a(dto);
  }

  @Post('returns/file')
  @ApiOperation({ summary: 'File a GST return (GSTR-1 / GSTR-3B)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Filed return record (status Filed + ackNo)',
  })
  async fileReturn(@Body() dto: FileGstReturnDto): Promise<any> {
    return this.service.fileReturn(dto);
  }

  @Get('returns/:id/download')
  @ApiOperation({ summary: 'Download a GST return as PDF or Excel' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'excel'] })
  async download(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const { buffer, def } = await this.service.buildDocument(id, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
