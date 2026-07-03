import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmDocumentApprovalsService } from '../services/pm-document-approvals.service';
import { PmDocumentApprovalEntity } from '../entities/pm-document-approval.entity';

@Controller('project-management/document-approvals')
export class PmDocumentApprovalsController {
  constructor(private readonly service: PmDocumentApprovalsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmDocumentApprovalEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmDocumentApprovalEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
