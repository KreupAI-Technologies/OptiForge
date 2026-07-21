import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentRepositoryService } from '../services/document-repository.service';
import { HrDocument } from '../entities/hr-document.entity';

@ApiTags('HR - Document Repository')
@Controller('hr/document-repository')
export class DocumentRepositoryController {
  constructor(private readonly service: DocumentRepositoryService) {}

  @Get()
  browse(
    @Query('companyId') companyId: string,
    @Query('documentCategory') documentCategory?: string,
    @Query('documentType') documentType?: string,
    @Query('status') status?: string,
  ): Promise<HrDocument[]> {
    return this.service.browse(companyId || 'company-1', {
      category: documentCategory,
      documentType,
      status,
    });
  }

  @Get('search')
  search(
    @Query('companyId') companyId: string,
    @Query('q') q: string,
  ): Promise<HrDocument[]> {
    return this.service.search(companyId || 'company-1', q || '');
  }

  @Get('archived')
  archived(@Query('companyId') companyId: string): Promise<HrDocument[]> {
    return this.service.listArchived(companyId || 'company-1');
  }

  @Post()
  upload(
    @Body() body: Partial<HrDocument> & { companyId: string },
  ): Promise<HrDocument> {
    return this.service.upload({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Get(':id/download')
  download(
    @Param('id') id: string,
  ): Promise<{ available: boolean; fileUrl?: string; fileName?: string }> {
    return this.service.download(id);
  }

  @Post('archive/:id')
  archive(@Param('id') id: string): Promise<HrDocument> {
    return this.service.archive(id);
  }

  @Post('unarchive/:id')
  unarchive(@Param('id') id: string): Promise<HrDocument> {
    return this.service.unarchive(id);
  }
}
