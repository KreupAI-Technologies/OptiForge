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
import { SupportSoftwareAssetService } from '../services/support-software-asset.service';
import { SupportSoftwareAsset } from '../entities/support-software-asset.entity';

@ApiTags('Support Software Assets')
@Controller('support/assets/software')
export class SupportSoftwareAssetController {
  constructor(private readonly service: SupportSoftwareAssetService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
  ): Promise<SupportSoftwareAsset[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportSoftwareAsset> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportSoftwareAsset> & { companyId: string },
  ): Promise<SupportSoftwareAsset> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportSoftwareAsset>,
  ): Promise<SupportSoftwareAsset> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
