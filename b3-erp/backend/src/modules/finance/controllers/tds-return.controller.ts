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
  TdsReturnService,
  FileTdsReturnDto,
  CreateTdsChallanDto,
  Form16aDto,
} from '../services/tds-return.service';
import {
  contentTypeFor,
  fileExtensionFor,
  normalizeFormat,
  safeFileName,
} from '../../../common/utils/report-render.util';

@ApiTags('Finance - TDS Returns')
@Controller('finance/tds')
export class TdsReturnController {
  constructor(private readonly service: TdsReturnService) {}

  // ------------------------------------------------------------------ returns
  @Get('returns')
  @ApiOperation({ summary: 'List TDS returns' })
  @ApiQuery({ name: 'formType', required: false })
  @ApiQuery({ name: 'quarter', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findReturns(
    @Query('formType') formType?: string,
    @Query('quarter') quarter?: string,
    @Query('status') status?: string,
  ): Promise<any[]> {
    return this.service.findReturns({ formType, quarter, status });
  }

  @Get('returns/:id')
  @ApiOperation({ summary: 'Get a TDS return by id' })
  async findReturn(@Param('id') id: string): Promise<any> {
    return this.service.findReturn(id);
  }

  @Post('returns/file')
  @ApiOperation({ summary: 'File a TDS return (24Q/26Q/27Q/27EQ)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Filed return record (status Filed + acknowledgementNumber)',
  })
  async fileReturn(@Body() dto: FileTdsReturnDto): Promise<any> {
    return this.service.fileReturn(dto);
  }

  @Get('returns/:id/download')
  @ApiOperation({ summary: 'Download a TDS return as PDF or Excel' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'excel'] })
  async downloadReturn(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const { buffer, def } = await this.service.buildReturnDocument(id, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  // ----------------------------------------------------------------- challans
  @Get('challans')
  @ApiOperation({ summary: 'List TDS challans' })
  @ApiQuery({ name: 'section', required: false })
  @ApiQuery({ name: 'quarter', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findChallans(
    @Query('section') section?: string,
    @Query('quarter') quarter?: string,
    @Query('status') status?: string,
  ): Promise<any[]> {
    return this.service.findChallans({ section, quarter, status });
  }

  @Post('challans')
  @ApiOperation({ summary: 'Record a TDS challan' })
  async createChallan(@Body() dto: CreateTdsChallanDto): Promise<any> {
    return this.service.createChallan(dto);
  }

  @Get('challans/:id/download')
  @ApiOperation({ summary: 'Download a TDS challan receipt as PDF or Excel' })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'excel'] })
  async downloadChallan(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const fmt = normalizeFormat(format);
    const { buffer, def } = await this.service.buildChallanDocument(id, fmt);
    const filename = `${safeFileName(def.title)}.${fileExtensionFor(fmt)}`;
    res.set({
      'Content-Type': contentTypeFor(fmt),
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  // ---------------------------------------------------------------- Form 16A
  @Post('form-16a')
  @ApiOperation({ summary: 'Generate a Form-16A TDS certificate (PDF)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'PDF certificate' })
  async form16a(
    @Body() dto: Form16aDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, fileBase } = await this.service.buildForm16a(dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileBase}.pdf"`,
    });
    return new StreamableFile(buffer);
  }
}
