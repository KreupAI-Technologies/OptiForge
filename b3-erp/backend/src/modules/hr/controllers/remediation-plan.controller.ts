import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RemediationPlanService } from '../services/remediation-plan.service';
import { RemediationPlan } from '../entities/remediation-plan.entity';

@ApiTags('HR - Remediation Plans')
@Controller('hr/remediation-plans')
export class RemediationPlanController {
  constructor(private readonly service: RemediationPlanService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<RemediationPlan[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<RemediationPlan> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<RemediationPlan> & { companyId: string },
  ): Promise<RemediationPlan> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<RemediationPlan>,
  ): Promise<RemediationPlan> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
