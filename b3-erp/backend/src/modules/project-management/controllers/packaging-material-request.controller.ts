import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { PackagingMaterialRequestService } from '../services/packaging-material-request.service';

@Controller('api/packaging/material-requests')
export class PackagingMaterialRequestController {
  constructor(private readonly service: PackagingMaterialRequestService) {}

  @Get()
  async list(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    const data = await this.service.list(projectId, status);
    return { success: true, data };
  }

  @Post()
  async create(
    @Body()
    body: {
      companyId?: string;
      projectId?: string;
      materialId: string;
      materialName: string;
      quantity?: number;
      unit?: string;
      requiredBy?: string;
      priority?: string;
      status?: string;
      requestedBy?: string;
      notes?: string;
    },
  ) {
    const data = await this.service.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: { status?: string; priority?: string; requiredBy?: string; notes?: string },
  ) {
    const data = await this.service.updateStatus(id, body);
    return { success: true, data };
  }
}
