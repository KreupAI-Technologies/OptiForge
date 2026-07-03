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
import { ProcurementCategory } from '../entities/procurement-category.entity';
import { ProcurementCategoryService } from '../services/procurement-category.service';

@Controller('procurement/categories')
export class ProcurementCategoryController {
  constructor(
    private readonly procurementCategoryService: ProcurementCategoryService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProcurementCategory>,
  ): Promise<ProcurementCategory> {
    return this.procurementCategoryService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
  ): Promise<ProcurementCategory[]> {
    return this.procurementCategoryService.findAll(companyId, {
      priority,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProcurementCategory> {
    return this.procurementCategoryService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProcurementCategory>,
  ): Promise<ProcurementCategory> {
    return this.procurementCategoryService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.procurementCategoryService.delete(companyId, id);
  }
}
