import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingBudgetService } from '../services/training-budget.service';
import { TrainingBudget } from '../entities/training-budget.entity';
import { CreateTrainingBudgetDto } from '../dto/create-training-budget.dto';
import { UpdateTrainingBudgetDto } from '../dto/update-training-budget.dto';

@ApiTags('HR - Training Budgets')
@Controller('hr/training-budgets')
export class TrainingBudgetController {
  constructor(private readonly service: TrainingBudgetService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('fiscalYear') fiscalYear?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ): Promise<TrainingBudget[]> {
    return this.service.findAll(companyId || 'company-1', {
      fiscalYear,
      departmentId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TrainingBudget> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTrainingBudgetDto): Promise<TrainingBudget> {
    const { periodStart, periodEnd, ...rest } = body;
    return this.service.create({
      ...rest,
      ...(periodStart ? { periodStart: new Date(periodStart) } : {}),
      ...(periodEnd ? { periodEnd: new Date(periodEnd) } : {}),
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTrainingBudgetDto,
  ): Promise<TrainingBudget> {
    const { periodStart, periodEnd, ...rest } = body;
    return this.service.update(id, {
      ...rest,
      ...(periodStart ? { periodStart: new Date(periodStart) } : {}),
      ...(periodEnd ? { periodEnd: new Date(periodEnd) } : {}),
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
