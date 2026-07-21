import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrainingReportService } from '../services/training-report.service';

@ApiTags('HR - Training Reports')
@Controller('hr/training-reports')
export class TrainingReportController {
  constructor(private readonly service: TrainingReportService) {}

  @Get('summary')
  getSummary(@Query('companyId') companyId: string) {
    return this.service.getSummary(companyId || 'company-1');
  }

  @Get('employee/:id')
  getEmployeeReport(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.getEmployeeReport(companyId || 'company-1', id);
  }

  @Get('department/:id')
  getDepartmentReport(
    @Query('companyId') companyId: string,
    @Param('id') id: string,
  ) {
    return this.service.getDepartmentReport(companyId || 'company-1', id);
  }

  @Get('hours')
  getHoursReport(@Query('companyId') companyId: string) {
    return this.service.getHoursReport(companyId || 'company-1');
  }
}
