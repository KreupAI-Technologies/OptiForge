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
import { AssetInventoryService } from '../services/asset-inventory.service';
import { AssetInventory } from '../entities/asset-inventory.entity';

@ApiTags('HR - Asset Inventory')
@Controller('hr/asset-inventory')
export class AssetInventoryController {
  constructor(private readonly service: AssetInventoryService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<AssetInventory[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetInventory> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetInventory> & { companyId: string },
  ): Promise<AssetInventory> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetInventory>,
  ): Promise<AssetInventory> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
