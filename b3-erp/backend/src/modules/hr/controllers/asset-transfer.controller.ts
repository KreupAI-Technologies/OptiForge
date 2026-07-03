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
import { AssetTransferService } from '../services/asset-transfer.service';
import { AssetTransfer } from '../entities/asset-transfer.entity';

@ApiTags('HR - Asset Transfers')
@Controller('hr/asset-transfers')
export class AssetTransferController {
  constructor(private readonly service: AssetTransferService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<AssetTransfer[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetTransfer> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetTransfer> & { companyId: string },
  ): Promise<AssetTransfer> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetTransfer>,
  ): Promise<AssetTransfer> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
