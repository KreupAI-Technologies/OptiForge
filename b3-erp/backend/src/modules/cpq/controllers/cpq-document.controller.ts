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
  CPQDocumentTemplate,
  CPQGeneratedDocument,
} from '../entities/cpq-document.entity';
import { CPQDocumentService } from '../services/cpq-document.service';

// Document-generator tab of cpq/advanced-features: reusable templates,
// generated documents, and PDF/Excel/CSV export.
@Controller('cpq/advanced/documents')
export class CPQDocumentController {
  constructor(private readonly documentService: CPQDocumentService) {}

  // ---- Templates ----

  @Get('templates')
  findAllTemplates(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQDocumentTemplate[]> {
    return this.documentService.findAllTemplates(companyId);
  }

  @Post('templates')
  createTemplate(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQDocumentTemplate>,
  ): Promise<CPQDocumentTemplate> {
    return this.documentService.createTemplate(companyId, data);
  }

  // ---- Generated documents ----

  @Get()
  findAllDocuments(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQGeneratedDocument[]> {
    return this.documentService.findAllDocuments(companyId);
  }

  @Post('generate')
  generate(
    @Headers('x-company-id') companyId: string,
    @Body()
    data: {
      templateId?: string;
      title?: string;
      documentType?: string;
      referenceId?: string;
      customerName?: string;
      content?: string;
      variables?: Record<string, unknown>;
      generatedBy?: string;
    },
  ): Promise<CPQGeneratedDocument> {
    return this.documentService.generate(companyId, data);
  }

  @Get(':id')
  findDocument(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<CPQGeneratedDocument> {
    return this.documentService.findDocument(companyId, id);
  }

  // PDF / Excel / CSV download for a generated document.
  @Get(':id/export')
  async exportDocument(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.documentService.exportDocument(
      companyId,
      id,
      format,
    );
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });
    return new StreamableFile(file.buffer);
  }
}
