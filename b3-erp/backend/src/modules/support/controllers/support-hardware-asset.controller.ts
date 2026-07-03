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
import { SupportHardwareAssetService } from '../services/support-hardware-asset.service';
import { SupportHardwareAsset } from '../entities/support-hardware-asset.entity';

@ApiTags('Support Hardware Assets')
@Controller('support/assets/hardware')
export class SupportHardwareAssetController {
  constructor(private readonly service: SupportHardwareAssetService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportHardwareAsset[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportHardwareAsset> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportHardwareAsset> & { companyId: string },
  ): Promise<SupportHardwareAsset> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportHardwareAsset>,
  ): Promise<SupportHardwareAsset> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
