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
import { AssetReturnService } from '../services/asset-return.service';
import { AssetReturn } from '../entities/asset-return.entity';

@ApiTags('HR - Asset Returns')
@Controller('hr/asset-returns')
export class AssetReturnController {
  constructor(private readonly service: AssetReturnService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<AssetReturn[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetReturn> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetReturn> & { companyId: string },
  ): Promise<AssetReturn> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetReturn>,
  ): Promise<AssetReturn> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
