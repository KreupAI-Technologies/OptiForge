import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationSettingService } from '../services/notification-setting.service';
import { NotificationSetting } from '../entities/notification-setting.entity';

@ApiTags('IT Admin - Notification Settings')
@Controller('it-admin/notification-settings')
export class NotificationSettingController {
  constructor(private readonly service: NotificationSettingService) {}

  @Get()
  @ApiOperation({ summary: 'List notification settings' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<NotificationSetting[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Notification delivery metrics (computed)' })
  @ApiQuery({ name: 'companyId', required: false })
  async metrics(@Query('companyId') companyId?: string) {
    return this.service.metrics(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create notification setting' })
  async create(
    @Body() data: Partial<NotificationSetting>,
  ): Promise<NotificationSetting> {
    return this.service.create(data);
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Bulk upsert notification settings' })
  async bulkUpsert(
    @Body() items: Array<Partial<NotificationSetting>>,
  ): Promise<NotificationSetting[]> {
    return this.service.bulkUpsert(items);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification setting' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NotificationSetting>,
  ): Promise<NotificationSetting> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification setting' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
