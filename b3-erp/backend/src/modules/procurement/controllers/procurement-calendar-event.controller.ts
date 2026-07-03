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
import {
  ProcurementCalendarEventService,
  UpsertCalendarEventDto,
} from '../services/procurement-calendar-event.service';

@Controller('procurement/calendar-events')
export class ProcurementCalendarEventController {
  constructor(private readonly service: ProcurementCalendarEventService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('companyId') companyId = 'default',
    @Query('type') type?: string,
  ) {
    return this.service.findAll(companyId, type);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: UpsertCalendarEventDto) {
    return this.service.create({ ...dto, companyId: dto.companyId || 'default' });
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<UpsertCalendarEventDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
