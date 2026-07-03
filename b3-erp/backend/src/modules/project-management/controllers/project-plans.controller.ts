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
import { ProjectPlanEntity } from '../entities/project-plan.entity';
import { ProjectPlansService } from '../services/project-plans.service';

@Controller('project-management/project-plans')
export class ProjectPlansController {
  constructor(private readonly projectPlansService: ProjectPlansService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ProjectPlanEntity>,
  ): Promise<ProjectPlanEntity> {
    return this.projectPlansService.create(companyId || 'default', data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ): Promise<ProjectPlanEntity[]> {
    return this.projectPlansService.findAll(companyId || 'default', {
      status,
      priority,
      search,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ProjectPlanEntity> {
    return this.projectPlansService.findOne(companyId || 'default', id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ProjectPlanEntity>,
  ): Promise<ProjectPlanEntity> {
    return this.projectPlansService.update(companyId || 'default', id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.projectPlansService.delete(companyId || 'default', id);
  }
}
