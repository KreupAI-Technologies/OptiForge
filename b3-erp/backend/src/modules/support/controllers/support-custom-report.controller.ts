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
import { SupportCustomReport } from '../entities/support-custom-report.entity';
import { SupportCustomReportService } from '../services/support-custom-report.service';

@ApiTags('Support Custom Reports')
@Controller('support/custom-reports')
export class SupportCustomReportController {
  constructor(private readonly service: SupportCustomReportService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupportCustomReport>,
  ): Promise<SupportCustomReport> {
    return this.service.create(companyId || 'company-1', data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('dataSource') dataSource?: string,
    @Query('isShared') isShared?: string,
  ): Promise<SupportCustomReport[]> {
    return this.service.findAll(companyId || 'company-1', {
      dataSource,
      isShared: isShared === undefined ? undefined : isShared === 'true',
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SupportCustomReport> {
    return this.service.findOne(companyId || 'company-1', id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SupportCustomReport>,
  ): Promise<SupportCustomReport> {
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
