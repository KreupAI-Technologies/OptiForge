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
import { LaborCostRate } from '../entities/labor-cost-rate.entity';
import { LaborCostRateService } from '../services/labor-cost-rate.service';

@Controller('estimation/labor-costs')
export class LaborCostRateController {
  constructor(private readonly laborCostRateService: LaborCostRateService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<LaborCostRate>,
  ): Promise<LaborCostRate> {
    return this.laborCostRateService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ): Promise<LaborCostRate[]> {
    return this.laborCostRateService.findAll(companyId, { department, status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<LaborCostRate> {
    return this.laborCostRateService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<LaborCostRate>,
  ): Promise<LaborCostRate> {
    return this.laborCostRateService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.laborCostRateService.delete(companyId, id);
  }
}
