import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ProcurementNotificationService,
  CreateNotificationDto,
} from '../services/procurement-notification.service';

@Controller('procurement/notifications')
export class ProcurementNotificationController {
  constructor(private readonly service: ProcurementNotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('companyId') companyId = 'default',
    @Query('read') read?: string,
  ) {
    return this.service.findAll(companyId, read);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNotificationDto) {
    return this.service.create({ ...dto, companyId: dto.companyId || 'default' });
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
