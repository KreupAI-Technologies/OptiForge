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
import { EstimationCategory } from '../entities/estimation-category.entity';
import { EstimationCategoryService } from '../services/estimation-category.service';

@Controller('estimation/categories')
export class EstimationCategoryController {
  constructor(
    private readonly estimationCategoryService: EstimationCategoryService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<EstimationCategory>,
  ): Promise<EstimationCategory> {
    return this.estimationCategoryService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<EstimationCategory[]> {
    return this.estimationCategoryService.findAll(companyId, { type, status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<EstimationCategory> {
    return this.estimationCategoryService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<EstimationCategory>,
  ): Promise<EstimationCategory> {
    return this.estimationCategoryService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.estimationCategoryService.delete(companyId, id);
  }
}
