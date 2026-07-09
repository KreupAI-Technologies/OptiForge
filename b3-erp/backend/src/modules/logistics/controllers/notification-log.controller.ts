import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  NotificationLogService,
  NotifyRequest,
} from '../services/notification-log.service';
import { NotificationLog } from '../entities/notification-log.entity';

@ApiTags('Logistics - Notifications')
@Controller('logistics/notifications')
export class NotificationLogController {
  constructor(private readonly service: NotificationLogService) {}

  @Post('notify')
  @ApiOperation({
    summary:
      'Record a logistics notification (site / transporter). Persists the record only; no external provider is called.',
  })
  async notify(@Body() body: NotifyRequest): Promise<NotificationLog> {
    return this.service.notify(body);
  }

  @Get()
  @ApiOperation({ summary: 'List recorded logistics notifications' })
  @ApiQuery({ name: 'audience', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'coordinationId', required: false })
  async findAll(
    @Query('audience') audience?: string,
    @Query('projectId') projectId?: string,
    @Query('coordinationId') coordinationId?: string,
  ): Promise<NotificationLog[]> {
    return this.service.findAll({ audience, projectId, coordinationId });
  }
}
