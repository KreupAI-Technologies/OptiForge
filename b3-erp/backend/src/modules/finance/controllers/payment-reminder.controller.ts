import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentReminderService } from '../services/payment-reminder.service';
import { PaymentReminder } from '../entities/payment-reminder.entity';

@ApiTags('Finance - Reminders')
@Controller('finance/reminders')
export class PaymentReminderController {
  constructor(private readonly service: PaymentReminderService) {}

  @Get()
  @ApiOperation({ summary: 'List reminders (optionally by target)' })
  findAll(
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
  ): Promise<PaymentReminder[]> {
    return this.service.findAll(targetType, targetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reminder by id' })
  findOne(@Param('id') id: string): Promise<PaymentReminder> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Send/create a reminder' })
  create(@Body() dto: Partial<PaymentReminder>): Promise<PaymentReminder> {
    return this.service.create(dto);
  }
}
