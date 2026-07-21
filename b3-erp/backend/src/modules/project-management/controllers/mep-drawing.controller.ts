import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MepDrawingService } from '../services/mep-drawing.service';

@Controller('api/project-management/mep')
export class MepDrawingController {
  constructor(private readonly service: MepDrawingService) {}

  @Get()
  async list(@Query('projectId') projectId?: string) {
    const data = await this.service.list(projectId);
    return { success: true, data };
  }

  @Post()
  async create(
    @Body()
    body: {
      projectId: string;
      drawingName?: string;
      drawingNumber?: string;
      discipline?: string;
      status?: string;
      revision?: string;
      fileUrl?: string;
      sharedWith?: any;
      notes?: string;
      createdBy?: string;
    },
  ) {
    const data = await this.service.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      revision?: string;
      sharedWith?: any;
      drawingName?: string;
      drawingNumber?: string;
      discipline?: string;
      fileUrl?: string;
      notes?: string;
    },
  ) {
    const data = await this.service.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return { success: true, data };
  }
}
