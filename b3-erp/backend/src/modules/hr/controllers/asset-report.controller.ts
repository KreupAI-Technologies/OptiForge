import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssetReportService } from '../services/asset-report.service';

@ApiTags('HR - Asset Reports')
@Controller('hr/asset-reports')
export class AssetReportController {
  constructor(private readonly service: AssetReportService) {}

  @Get('register')
  register(@Query('companyId') companyId: string) {
    return this.service.register(companyId || 'company-1');
  }

  @Get('employee')
  byEmployee(@Query('companyId') companyId: string) {
    return this.service.byEmployee(companyId || 'company-1');
  }

  @Get('department')
  byDepartment(@Query('companyId') companyId: string) {
    return this.service.byDepartment(companyId || 'company-1');
  }

  @Get('costs')
  costs(@Query('companyId') companyId: string) {
    return this.service.costs(companyId || 'company-1');
  }

  @Get('allocation')
  allocation(@Query('companyId') companyId: string) {
    return this.service.allocation(companyId || 'company-1');
  }
}
