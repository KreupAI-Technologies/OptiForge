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
import { ReportSchedule } from '../entities/report-schedule.entity';
import { ReportScheduleService } from '../services/report-schedule.service';

@Controller('estimation/report-schedules')
export class ReportScheduleController {
  constructor(private readonly reportScheduleService: ReportScheduleService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    return this.reportScheduleService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('isActive') isActive?: string,
    @Query('reportType') reportType?: string,
  ): Promise<ReportSchedule[]> {
    return this.reportScheduleService.findAll(companyId, {
      isActive: isActive === undefined ? undefined : isActive === 'true',
      reportType,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<ReportSchedule> {
    return this.reportScheduleService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    return this.reportScheduleService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.reportScheduleService.delete(companyId, id);
  }
}
