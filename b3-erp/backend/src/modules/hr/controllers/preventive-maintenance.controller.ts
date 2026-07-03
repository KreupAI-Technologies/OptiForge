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
import { ApiTags } from '@nestjs/swagger';
import { PreventiveMaintenanceService } from '../services/preventive-maintenance.service';
import { PreventiveMaintenance } from '../entities/preventive-maintenance.entity';

@ApiTags('HR - Preventive Maintenance')
@Controller('hr/preventive-maintenance')
export class PreventiveMaintenanceController {
  constructor(private readonly service: PreventiveMaintenanceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('assetCategory') assetCategory?: string,
  ): Promise<PreventiveMaintenance[]> {
    return this.service.findAll(companyId || 'company-1', assetCategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PreventiveMaintenance> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<PreventiveMaintenance> & { companyId: string },
  ): Promise<PreventiveMaintenance> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<PreventiveMaintenance>,
  ): Promise<PreventiveMaintenance> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
