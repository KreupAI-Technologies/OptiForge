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
import { MaterialCostRate } from '../entities/material-cost-rate.entity';
import { MaterialCostRateService } from '../services/material-cost-rate.service';

@Controller('estimation/material-costs')
export class MaterialCostRateController {
  constructor(
    private readonly materialCostRateService: MaterialCostRateService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<MaterialCostRate>,
  ): Promise<MaterialCostRate> {
    return this.materialCostRateService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<MaterialCostRate[]> {
    return this.materialCostRateService.findAll(companyId, {
      category,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<MaterialCostRate> {
    return this.materialCostRateService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<MaterialCostRate>,
  ): Promise<MaterialCostRate> {
    return this.materialCostRateService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.materialCostRateService.delete(companyId, id);
  }
}
