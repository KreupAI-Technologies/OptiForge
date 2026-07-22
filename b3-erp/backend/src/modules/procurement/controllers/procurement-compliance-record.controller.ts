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
import { ProcurementComplianceRecord } from '../entities/procurement-compliance-record.entity';
import { ProcurementComplianceRecordService } from '../services/procurement-compliance-record.service';

@Controller('procurement/compliance-records')
export class ProcurementComplianceRecordController {
  constructor(
    private readonly service: ProcurementComplianceRecordService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementComplianceRecord>,
  ): Promise<ProcurementComplianceRecord> {
    return this.service.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ): Promise<ProcurementComplianceRecord[]> {
    return this.service.findAll(companyId, { status, supplierId });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementComplianceRecord> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementComplianceRecord>,
  ): Promise<ProcurementComplianceRecord> {
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
