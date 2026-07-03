import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MarkupSetting } from '../entities/markup-setting.entity';
import { MarkupSettingService } from '../services/markup-setting.service';

@Controller('estimation/markup-settings')
export class MarkupSettingController {
  constructor(private readonly markupSettingService: MarkupSettingService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<MarkupSetting>,
  ): Promise<MarkupSetting> {
    return this.markupSettingService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<MarkupSetting[]> {
    return this.markupSettingService.findAll(companyId, { category, status });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<MarkupSetting> {
    return this.markupSettingService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<MarkupSetting>,
  ): Promise<MarkupSetting> {
    return this.markupSettingService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.markupSettingService.delete(companyId, id);
  }
}
