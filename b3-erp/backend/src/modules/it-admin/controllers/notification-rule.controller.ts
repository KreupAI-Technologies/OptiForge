import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationRuleService } from '../services/notification-rule.service';
import { NotificationRule } from '../entities/notification-rule.entity';

@ApiTags('IT Admin - Notification Rules')
@Controller('it-admin/notification-rules')
export class NotificationRuleController {
  constructor(private readonly service: NotificationRuleService) {}

  @Get()
  @ApiOperation({ summary: 'List notification rules' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'channel', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('eventType') eventType?: string,
    @Query('channel') channel?: string,
    @Query('isActive') isActive?: string,
  ): Promise<NotificationRule[]> {
    return this.service.findAll({
      companyId,
      eventType,
      channel,
      isActive:
        isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification rule' })
  async findOne(@Param('id') id: string): Promise<NotificationRule> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create notification rule' })
  async create(
    @Body() data: Partial<NotificationRule>,
  ): Promise<NotificationRule> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification rule' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<NotificationRule>,
  ): Promise<NotificationRule> {
    return this.service.update(id, data);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle notification rule active flag' })
  async toggle(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean },
  ): Promise<NotificationRule> {
    return this.service.toggle(id, body?.isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification rule' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
