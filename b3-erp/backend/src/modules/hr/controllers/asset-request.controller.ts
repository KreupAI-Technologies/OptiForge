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
import { AssetRequestService } from '../services/asset-request.service';
import { AssetRequest } from '../entities/asset-request.entity';

@ApiTags('HR - Asset Requests')
@Controller('hr/asset-requests')
export class AssetRequestController {
  constructor(private readonly service: AssetRequestService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<AssetRequest[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetRequest> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetRequest> & { companyId: string },
  ): Promise<AssetRequest> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetRequest>,
  ): Promise<AssetRequest> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
