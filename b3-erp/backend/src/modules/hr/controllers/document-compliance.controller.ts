import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ComplianceRow,
  DocumentComplianceService,
} from '../services/document-compliance.service';

@ApiTags('HR - Document Compliance')
@Controller('hr/document-compliance')
export class DocumentComplianceController {
  constructor(private readonly service: DocumentComplianceService) {}

  @Get('tracking')
  tracking(
    @Query('companyId') companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('documentCategory') documentCategory?: string,
    @Query('complianceStatus') complianceStatus?: string,
  ): Promise<ComplianceRow[]> {
    return this.service.tracking(companyId || 'company-1', {
      employeeId,
      documentCategory,
      complianceStatus,
    });
  }

  @Get('missing')
  missing(@Query('companyId') companyId: string): Promise<ComplianceRow[]> {
    return this.service.missing(companyId || 'company-1');
  }

  @Get('expired')
  expired(@Query('companyId') companyId: string): Promise<ComplianceRow[]> {
    return this.service.expired(companyId || 'company-1');
  }

  @Get('expiring')
  expiring(
    @Query('companyId') companyId: string,
    @Query('withinDays') withinDays?: string,
  ): Promise<ComplianceRow[]> {
    return this.service.expiring(
      companyId || 'company-1',
      withinDays ? parseInt(withinDays, 10) : 30,
    );
  }

  @Post('reminder/:id')
  reminder(@Param('id') id: string): Promise<ComplianceRow> {
    return this.service.reminder(id);
  }

  @Post('resolve/:id')
  resolve(
    @Param('id') id: string,
    @Body() body: { resolvedBy?: string; notes?: string },
  ): Promise<ComplianceRow> {
    return this.service.resolve(id, body || {});
  }
}
