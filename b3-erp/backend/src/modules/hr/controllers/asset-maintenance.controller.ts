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
import { AssetMaintenanceService } from '../services/asset-maintenance.service';
import { AssetMaintenance } from '../entities/asset-maintenance.entity';

@ApiTags('HR - Asset Maintenance')
@Controller('hr/asset-maintenance')
export class AssetMaintenanceController {
  constructor(private readonly service: AssetMaintenanceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<AssetMaintenance[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetMaintenance> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetMaintenance> & { companyId: string },
  ): Promise<AssetMaintenance> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetMaintenance>,
  ): Promise<AssetMaintenance> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
