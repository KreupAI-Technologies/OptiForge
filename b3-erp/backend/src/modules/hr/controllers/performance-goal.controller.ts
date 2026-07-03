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
import { PerformanceGoalService } from '../services/performance-goal.service';
import { PerformanceGoal } from '../entities/performance-goal.entity';

@ApiTags('HR - Performance Goals')
@Controller('hr/performance-goals')
export class PerformanceGoalController {
  constructor(private readonly service: PerformanceGoalService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<PerformanceGoal[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PerformanceGoal> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<PerformanceGoal> & { companyId: string; recordType: string },
  ): Promise<PerformanceGoal> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
      recordType: body.recordType || 'my-goal',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<PerformanceGoal>,
  ): Promise<PerformanceGoal> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
