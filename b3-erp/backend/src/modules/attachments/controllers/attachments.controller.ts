import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { Attachment } from '../entities/attachment.entity';
import {
  AttachmentsService,
  UploadedFileLike,
} from '../services/attachments.service';

@ApiTags('Attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  /** Upload one file (multipart/form-data, field name "file"). */
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: UploadedFileLike,
    @Body()
    body: { entityType?: string; entityId?: string; uploadedBy?: string },
  ): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('No file provided (field name must be "file").');
    }
    const entityType = body?.entityType || 'generic';
    const entityId = body?.entityId || 'unassigned';
    return this.service.store(file, entityType, entityId, body?.uploadedBy);
  }

  /**
   * Parse an uploaded spreadsheet into JSON rows without persisting it.
   * Used by bulk-import flows (e.g. HR bulk punch).
   */
  @Post('parse-spreadsheet')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async parseSpreadsheet(
    @UploadedFile() file: UploadedFileLike,
  ): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
    if (!file) {
      throw new BadRequestException('No file provided (field name must be "file").');
    }
    return this.service.parseSpreadsheet(file);
  }

  /** List attachments for an owning record. */
  @Get()
  list(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ): Promise<Attachment[]> {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId query params are required.');
    }
    return this.service.list(entityType, entityId);
  }

  /** Stream the raw file with its stored content-type. */
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { attachment, absolutePath } = await this.service.getOne(id);
    res.set({
      'Content-Type': attachment.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
    });
    return new StreamableFile(createReadStream(absolutePath));
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
