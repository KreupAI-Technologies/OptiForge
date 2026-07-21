import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ProductionJobsService } from '../services/production-jobs.service';
import { PmProductionJobEntity } from '../entities/pm-production-job.entity';

@Controller('api/production/jobs')
export class ProductionJobsController {
  constructor(private readonly service: ProductionJobsService) {}

  @Get()
  async list(
    @Query('projectId') projectId?: string,
    @Query('operationType') operationType?: string,
  ) {
    const data = await this.service.listJobs(projectId, operationType);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: Partial<PmProductionJobEntity>) {
    const data = await this.service.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: Partial<PmProductionJobEntity>,
  ) {
    const data = await this.service.updateStatus(id, body);
    return { success: true, data };
  }
}
