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
import { WorkflowStageSetting } from '../entities/workflow-stage-setting.entity';
import { WorkflowStageSettingService } from '../services/workflow-stage-setting.service';

@Controller('estimation/workflow-stages')
export class WorkflowStageSettingController {
  constructor(
    private readonly workflowStageSettingService: WorkflowStageSettingService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<WorkflowStageSetting>,
  ): Promise<WorkflowStageSetting> {
    return this.workflowStageSettingService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
  ): Promise<WorkflowStageSetting[]> {
    return this.workflowStageSettingService.findAll(companyId, { status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<WorkflowStageSetting> {
    return this.workflowStageSettingService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<WorkflowStageSetting>,
  ): Promise<WorkflowStageSetting> {
    return this.workflowStageSettingService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.workflowStageSettingService.delete(companyId, id);
  }
}
