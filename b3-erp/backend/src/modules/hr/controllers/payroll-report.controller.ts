import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PayrollReportService } from '../services/payroll-report.service';
import { PayrollReport } from '../entities/payroll-report.entity';

@ApiTags('HR - Payroll Reports')
@Controller('hr/payroll-reports')
export class PayrollReportController {
  constructor(private readonly service: PayrollReportService) {}

  @Get()
  @ApiOperation({ summary: 'Get payroll report line items' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('period') period?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ): Promise<PayrollReport[]> {
    return this.service.findAll({
      companyId,
      category,
      period,
      department,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payroll report row by ID' })
  findOne(@Param('id') id: string): Promise<PayrollReport> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a payroll report row' })
  create(
    @Body() body: Partial<PayrollReport> & { companyId?: string },
  ): Promise<PayrollReport> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payroll report row' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollReport>,
  ): Promise<PayrollReport> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payroll report row' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
