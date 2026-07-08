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
import { ApiTags } from '@nestjs/swagger';
import { SupportReportSchedule } from '../entities/support-report-schedule.entity';
import { SupportReportScheduleService } from '../services/support-report-schedule.service';

@ApiTags('Support Report Schedules')
@Controller('support/report-schedules')
export class SupportReportScheduleController {
  constructor(private readonly service: SupportReportScheduleService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupportReportSchedule>,
  ): Promise<SupportReportSchedule> {
    return this.service.create(companyId || 'company-1', data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('isActive') isActive?: string,
    @Query('reportType') reportType?: string,
  ): Promise<SupportReportSchedule[]> {
    return this.service.findAll(companyId || 'company-1', {
      isActive: isActive === undefined ? undefined : isActive === 'true',
      reportType,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SupportReportSchedule> {
    return this.service.findOne(companyId || 'company-1', id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SupportReportSchedule>,
  ): Promise<SupportReportSchedule> {
    return this.service.update(companyId || 'company-1', id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(companyId || 'company-1', id);
  }
}
