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
import { OverheadCost } from '../entities/overhead-cost.entity';
import { OverheadCostService } from '../services/overhead-cost.service';

@Controller('estimation/overhead-costs')
export class OverheadCostController {
  constructor(private readonly overheadCostService: OverheadCostService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<OverheadCost>,
  ): Promise<OverheadCost> {
    return this.overheadCostService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<OverheadCost[]> {
    return this.overheadCostService.findAll(companyId, { category, status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<OverheadCost> {
    return this.overheadCostService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<OverheadCost>,
  ): Promise<OverheadCost> {
    return this.overheadCostService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.overheadCostService.delete(companyId, id);
  }
}
