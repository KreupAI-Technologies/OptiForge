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
import { AssetItemService } from '../services/asset-item.service';
import { AssetItem } from '../entities/asset-item.entity';

@ApiTags('HR - Asset Items')
@Controller('hr/asset-items')
export class AssetItemController {
  constructor(private readonly service: AssetItemService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('assetClass') assetClass?: string,
  ): Promise<AssetItem[]> {
    return this.service.findAll(companyId || 'company-1', assetClass);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetItem> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetItem> & { companyId: string },
  ): Promise<AssetItem> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetItem>,
  ): Promise<AssetItem> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
