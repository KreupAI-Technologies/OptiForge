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
import { PerformanceImprovementPlanService } from '../services/performance-improvement-plan.service';
import { PerformanceImprovementPlan } from '../entities/performance-improvement-plan.entity';

@ApiTags('HR - Performance Improvement Plans')
@Controller('hr/performance-pips')
export class PerformanceImprovementPlanController {
  constructor(private readonly service: PerformanceImprovementPlanService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('employeeId') employeeId?: string,
    @Query('managerId') managerId?: string,
    @Query('status') status?: string,
  ): Promise<PerformanceImprovementPlan[]> {
    return this.service.findAll(companyId || 'company-1', {
      employeeId,
      managerId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PerformanceImprovementPlan> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<PerformanceImprovementPlan> & { companyId?: string },
  ): Promise<PerformanceImprovementPlan> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<PerformanceImprovementPlan>,
  ): Promise<PerformanceImprovementPlan> {
    return this.service.update(id, body);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body() body: { status: string; reviewNotes?: string },
  ): Promise<PerformanceImprovementPlan> {
    return this.service.transition(id, body.status, body.reviewNotes);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
