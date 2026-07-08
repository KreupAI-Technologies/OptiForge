import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupportOnboardingTask } from '../entities/support-onboarding-task.entity';
import { SupportOnboardingTaskService } from '../services/support-onboarding-task.service';

@ApiTags('Support Onboarding')
@Controller('support/onboarding/tasks')
export class SupportOnboardingTaskController {
  constructor(private readonly service: SupportOnboardingTaskService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<SupportOnboardingTask[]> {
    return this.service.findAll(companyId || 'company-1', { status, category });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SupportOnboardingTask> {
    return this.service.findOne(companyId || 'company-1', id);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupportOnboardingTask>,
  ): Promise<SupportOnboardingTask> {
    return this.service.create(companyId || 'company-1', data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SupportOnboardingTask>,
  ): Promise<SupportOnboardingTask> {
    return this.service.update(companyId || 'company-1', id, data);
  }
}
