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
import { SuccessionPlanService } from '../services/succession-plan.service';
import { SuccessionPlan } from '../entities/succession-plan.entity';

@ApiTags('HR - Succession Plans')
@Controller('hr/succession-plans')
export class SuccessionPlanController {
  constructor(private readonly service: SuccessionPlanService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SuccessionPlan[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  /** Computed analytics — must be declared before the ':id' route. */
  @Get('analytics')
  analytics(@Query('companyId') companyId: string) {
    return this.service.analytics(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SuccessionPlan> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SuccessionPlan> & { companyId: string; recordType: string },
  ): Promise<SuccessionPlan> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
      recordType: body.recordType || 'plan',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SuccessionPlan>,
  ): Promise<SuccessionPlan> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
