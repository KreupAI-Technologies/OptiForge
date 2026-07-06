import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  // --- Data-subject requests (GDPR) ---
  @Get('data-requests')
  findAllDataRequests(@Query('companyId') companyId?: string) {
    return this.service.findAllDataRequests(companyId);
  }

  @Get('data-requests/summary')
  dataRequestSummary(@Query('companyId') companyId?: string) {
    return this.service.dataRequestSummary(companyId);
  }

  @Get('data-requests/:id')
  findDataRequestById(@Param('id') id: string) {
    return this.service.findDataRequestById(id);
  }

  @Post('data-requests')
  createDataRequest(@Body() data: any) {
    return this.service.createDataRequest(data);
  }

  @Put('data-requests/:id')
  updateDataRequest(@Param('id') id: string, @Body() data: any) {
    return this.service.updateDataRequest(id, data);
  }

  @Delete('data-requests/:id')
  deleteDataRequest(@Param('id') id: string) {
    return this.service.deleteDataRequest(id);
  }

  // --- Regulatory reports ---
  @Get('reports')
  findAllReports(
    @Query('companyId') companyId?: string,
    @Query('reportType') reportType?: string,
  ) {
    return this.service.findAllReports(companyId, reportType);
  }

  @Get('reports/:id')
  findReportById(@Param('id') id: string) {
    return this.service.findReportById(id);
  }

  @Post('reports')
  createReport(@Body() data: any) {
    return this.service.createReport(data);
  }

  @Put('reports/:id')
  updateReport(@Param('id') id: string, @Body() data: any) {
    return this.service.updateReport(id, data);
  }

  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.service.deleteReport(id);
  }
}
