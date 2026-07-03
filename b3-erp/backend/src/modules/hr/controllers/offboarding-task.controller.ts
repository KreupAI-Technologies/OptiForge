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
import { OffboardingTaskService } from '../services/offboarding-task.service';
import { OffboardingTask } from '../entities/offboarding-task.entity';

@ApiTags('HR - Offboarding Tasks')
@Controller('hr/offboarding-tasks')
export class OffboardingTaskController {
  constructor(private readonly service: OffboardingTaskService) {}

  @Get()
  @ApiOperation({ summary: 'Get all offboarding task records (filter by feature)' })
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
  ): Promise<OffboardingTask[]> {
    return this.service.findAll({ companyId, feature, status, department, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offboarding task by ID' })
  findOne(@Param('id') id: string): Promise<OffboardingTask> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an offboarding task record' })
  create(
    @Body() body: Partial<OffboardingTask> & { companyId?: string },
  ): Promise<OffboardingTask> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an offboarding task record' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<OffboardingTask>,
  ): Promise<OffboardingTask> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offboarding task record' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
