import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentAuditLogService } from '../services/document-audit-log.service';
import { DocumentAuditLog } from '../entities/document-audit-log.entity';

@ApiTags('HR - Document Audit Logs')
@Controller('hr/document-audit-logs')
export class DocumentAuditLogController {
  constructor(private readonly service: DocumentAuditLogService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('action') action?: string,
  ): Promise<DocumentAuditLog[]> {
    return this.service.findAll(companyId || 'company-1', action);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DocumentAuditLog> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<DocumentAuditLog> & { companyId: string },
  ): Promise<DocumentAuditLog> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }
}
