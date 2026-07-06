import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OvertimeSettingsService } from '../services/overtime-settings.service';

@ApiTags('HR - OvertimeSettings')
@Controller('hr/overtime-settings')
export class OvertimeSettingsController {
  constructor(private readonly service: OvertimeSettingsService) {}

  @Get('rates')
  findAllRates(@Query('companyId') companyId?: string) {
    return this.service.findAllRates(companyId);
  }

  @Post('rates')
  createRate(@Body() body: any) {
    return this.service.createRate(body);
  }

  @Put('rates/:id')
  updateRate(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRate(id, body);
  }

  @Delete('rates/:id')
  deleteRate(@Param('id') id: string) {
    return this.service.deleteRate(id);
  }

  @Get()
  getSettings(@Query('companyId') companyId?: string) {
    return this.service.getSettings(companyId);
  }

  @Put()
  upsertSettings(@Body() body: any) {
    return this.service.upsertSettings(body);
  }
}
