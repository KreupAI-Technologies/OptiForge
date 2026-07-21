import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { PmVendorShipmentService } from '../services/pm-vendor-shipment.service';
import { PmVendorShipmentEntity } from '../entities/pm-vendor-shipment.entity';

@Controller('api/project-management/vendor-shipments')
export class PmVendorShipmentController {
  constructor(private readonly service: PmVendorShipmentService) {}

  @Get()
  async list(@Query('projectId') projectId?: string, @Query('poId') poId?: string) {
    const data = await this.service.list(projectId, poId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: Partial<PmVendorShipmentEntity>) {
    const data = await this.service.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async updateTracking(
    @Param('id') id: string,
    @Body() body: Partial<PmVendorShipmentEntity> & { location?: string; event?: string },
  ) {
    const data = await this.service.updateTracking(id, body);
    return { success: true, data };
  }
}
