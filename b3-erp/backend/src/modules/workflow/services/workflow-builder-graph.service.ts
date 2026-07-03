import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowBuilderGraph } from '../entities/workflow-builder-graph.entity';

export interface SaveWorkflowBuilderGraphDto {
  name?: string;
  description?: string;
  nodes?: any;
  edges?: any;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable()
export class WorkflowBuilderGraphService {
  constructor(
    @InjectRepository(WorkflowBuilderGraph)
    private readonly repo: Repository<WorkflowBuilderGraph>,
  ) {}

  async findAll(): Promise<WorkflowBuilderGraph[]> {
    return this.repo.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<WorkflowBuilderGraph> {
    const graph = await this.repo.findOne({ where: { id } });
    if (!graph) {
      throw new NotFoundException(`Workflow builder graph ${id} not found`);
    }
    return graph;
  }

  async create(dto: SaveWorkflowBuilderGraphDto): Promise<WorkflowBuilderGraph> {
    const graph = new WorkflowBuilderGraph();
    graph.name = dto.name || 'Untitled Workflow';
    graph.description = dto.description ?? null;
    graph.nodes = dto.nodes ?? [];
    graph.edges = dto.edges ?? [];
    graph.status = dto.status || 'draft';
    graph.createdBy = dto.createdBy ?? null;
    graph.updatedBy = dto.updatedBy ?? dto.createdBy ?? null;
    return this.repo.save(graph);
  }

  async update(
    id: string,
    dto: SaveWorkflowBuilderGraphDto,
  ): Promise<WorkflowBuilderGraph> {
    const graph = await this.findOne(id);
    if (dto.name !== undefined) graph.name = dto.name;
    if (dto.description !== undefined) graph.description = dto.description;
    if (dto.nodes !== undefined) graph.nodes = dto.nodes;
    if (dto.edges !== undefined) graph.edges = dto.edges;
    if (dto.status !== undefined) graph.status = dto.status;
    if (dto.updatedBy !== undefined) graph.updatedBy = dto.updatedBy;
    return this.repo.save(graph);
  }
}
