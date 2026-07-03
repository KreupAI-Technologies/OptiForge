import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import {
  WorkflowBuilderGraphService,
  SaveWorkflowBuilderGraphDto,
} from '../services/workflow-builder-graph.service';
import { WorkflowBuilderGraph } from '../entities/workflow-builder-graph.entity';

/**
 * Backs the visual workflow builder (ReactFlow canvas) at
 * frontend `/admin/workflows/builder`.
 *
 * Served under `/api/v1/workflow/workflow-definitions`.
 */
@Controller('workflow/workflow-definitions')
export class WorkflowBuilderGraphController {
  constructor(
    private readonly service: WorkflowBuilderGraphService,
  ) {}

  // Static routes before ':id'
  @Get()
  async findAll(): Promise<WorkflowBuilderGraph[]> {
    return this.service.findAll();
  }

  @Post()
  async create(
    @Body() dto: SaveWorkflowBuilderGraphDto,
  ): Promise<WorkflowBuilderGraph> {
    return this.service.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WorkflowBuilderGraph> {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: SaveWorkflowBuilderGraphDto,
  ): Promise<WorkflowBuilderGraph> {
    return this.service.update(id, dto);
  }
}
