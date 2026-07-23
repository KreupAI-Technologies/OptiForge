import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProcurementQualityService } from '../services/procurement-quality.service';
import { ProcurementInspection } from '../entities/procurement-inspection.entity';
import { ProcurementInspectionTemplate } from '../entities/procurement-inspection-template.entity';
import { ProcurementNcr } from '../entities/procurement-ncr.entity';

// Quality Assurance endpoints for the procurement QualityAssurance UI.
@Controller('procurement/quality')
export class ProcurementQualityController {
  constructor(private readonly service: ProcurementQualityService) {}

  // ---- inspections ----
  @Get('inspections')
  findInspections(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
  ): Promise<ProcurementInspection[]> {
    return this.service.findInspections(companyId, { status });
  }

  @Post('inspections')
  createInspection(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    return this.service.createInspection(companyId, data);
  }

  @Patch('inspections/:id/results')
  recordResults(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    return this.service.recordResults(companyId, id, data);
  }

  @Patch('inspections/:id/reject')
  rejectInspection(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementInspection>,
  ): Promise<ProcurementInspection> {
    return this.service.rejectInspection(companyId, id, data);
  }

  // ---- templates ----
  @Get('templates')
  findTemplates(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
  ): Promise<ProcurementInspectionTemplate[]> {
    return this.service.findTemplates(companyId, { category });
  }

  @Post('templates')
  createTemplate(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementInspectionTemplate>,
  ): Promise<ProcurementInspectionTemplate> {
    return this.service.createTemplate(companyId, data);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementInspectionTemplate>,
  ): Promise<ProcurementInspectionTemplate> {
    return this.service.updateTemplate(companyId, id, data);
  }

  @Post('templates/:id/use')
  markTemplateUsed(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementInspectionTemplate> {
    return this.service.markTemplateUsed(companyId, id);
  }

  // ---- NCRs ----
  @Get('ncrs')
  findNcrs(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
  ): Promise<ProcurementNcr[]> {
    return this.service.findNcrs(companyId, { status });
  }

  @Post('ncrs')
  createNcr(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementNcr>,
  ): Promise<ProcurementNcr> {
    return this.service.createNcr(companyId, data);
  }
}
