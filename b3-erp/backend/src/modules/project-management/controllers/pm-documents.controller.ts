import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmDocumentsService } from '../services/pm-documents.service';
import { PmDocumentEntity } from '../entities/pm-document.entity';

@Controller('project-management/documents')
export class PmDocumentsController {
  constructor(private readonly service: PmDocumentsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmDocumentEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmDocumentEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
