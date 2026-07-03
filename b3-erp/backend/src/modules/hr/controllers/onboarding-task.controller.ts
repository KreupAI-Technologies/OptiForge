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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OnboardingTaskService } from '../services/onboarding-task.service';
import { OnboardingTask } from '../entities/onboarding-task.entity';

@ApiTags('HR - Onboarding Tasks')
@Controller('hr/onboarding-tasks')
export class OnboardingTaskController {
  constructor(private readonly service: OnboardingTaskService) {}

  @Get()
  @ApiOperation({ summary: 'Get all onboarding task records (filter by feature)' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'feature', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('feature') feature?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ): Promise<OnboardingTask[]> {
    return this.service.findAll({ companyId, feature, status, department, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get onboarding task by ID' })
  findOne(@Param('id') id: string): Promise<OnboardingTask> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an onboarding task record' })
  create(
    @Body() body: Partial<OnboardingTask> & { companyId?: string },
  ): Promise<OnboardingTask> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an onboarding task record' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<OnboardingTask>,
  ): Promise<OnboardingTask> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an onboarding task record' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
