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
import { WorkflowConfigTemplate } from '../entities/workflow-config-template.entity';
import { WorkflowConfigTemplateService } from '../services/workflow-config-template.service';

@Controller('workflow/config-templates')
export class WorkflowConfigTemplateController {
  constructor(
    private readonly configTemplateService: WorkflowConfigTemplateService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<WorkflowConfigTemplate>,
  ): Promise<WorkflowConfigTemplate> {
    return this.configTemplateService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ): Promise<WorkflowConfigTemplate[]> {
    return this.configTemplateService.findAll(companyId, { status, category });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<WorkflowConfigTemplate> {
    return this.configTemplateService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<WorkflowConfigTemplate>,
  ): Promise<WorkflowConfigTemplate> {
    return this.configTemplateService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.configTemplateService.delete(companyId, id);
  }
}
