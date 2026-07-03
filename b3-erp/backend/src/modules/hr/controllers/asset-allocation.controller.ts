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
import { AssetAllocationService } from '../services/asset-allocation.service';
import { AssetAllocation } from '../entities/asset-allocation.entity';

@ApiTags('HR - Asset Allocations')
@Controller('hr/asset-allocations')
export class AssetAllocationController {
  constructor(private readonly service: AssetAllocationService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<AssetAllocation[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetAllocation> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetAllocation> & { companyId: string },
  ): Promise<AssetAllocation> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetAllocation>,
  ): Promise<AssetAllocation> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
