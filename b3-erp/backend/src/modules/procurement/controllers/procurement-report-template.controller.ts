import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProcurementReportTemplate } from '../entities/procurement-report-template.entity';
import { ProcurementReportTemplateService } from '../services/procurement-report-template.service';

@Controller('procurement/report-templates')
export class ProcurementReportTemplateController {
  constructor(
    private readonly service: ProcurementReportTemplateService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementReportTemplate>,
  ): Promise<ProcurementReportTemplate> {
    return this.service.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('reportType') reportType?: string,
  ): Promise<ProcurementReportTemplate[]> {
    return this.service.findAll(companyId, { reportType });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementReportTemplate> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementReportTemplate>,
  ): Promise<ProcurementReportTemplate> {
    return this.service.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(companyId, id);
  }
}
