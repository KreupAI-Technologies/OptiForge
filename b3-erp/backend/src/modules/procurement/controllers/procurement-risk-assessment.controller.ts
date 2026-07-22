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
import { ProcurementRiskAssessment } from '../entities/procurement-risk-assessment.entity';
import { ProcurementRiskAssessmentService } from '../services/procurement-risk-assessment.service';

@Controller('procurement/risk-assessments')
export class ProcurementRiskAssessmentController {
  constructor(
    private readonly service: ProcurementRiskAssessmentService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementRiskAssessment>,
  ): Promise<ProcurementRiskAssessment> {
    return this.service.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ): Promise<ProcurementRiskAssessment[]> {
    return this.service.findAll(companyId, {
      category,
      riskLevel,
      status,
      supplierId,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementRiskAssessment> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementRiskAssessment>,
  ): Promise<ProcurementRiskAssessment> {
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
