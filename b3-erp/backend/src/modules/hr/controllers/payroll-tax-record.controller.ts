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
import { PayrollTaxRecordService } from '../services/payroll-tax-record.service';
import { PayrollTaxRecord } from '../entities/payroll-tax-record.entity';

@ApiTags('HR - Payroll Tax Records')
@Controller('hr/tax-records')
export class PayrollTaxRecordController {
  constructor(private readonly service: PayrollTaxRecordService) {}

  @Get()
  @ApiOperation({ summary: 'Get TDS / declarations / Form-16 records' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'financialYear', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('financialYear') financialYear?: string,
    @Query('search') search?: string,
  ): Promise<PayrollTaxRecord[]> {
    return this.service.findAll({
      companyId,
      category,
      status,
      financialYear,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tax record by ID' })
  findOne(@Param('id') id: string): Promise<PayrollTaxRecord> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tax record' })
  create(
    @Body() body: Partial<PayrollTaxRecord> & { companyId?: string },
  ): Promise<PayrollTaxRecord> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tax record' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollTaxRecord>,
  ): Promise<PayrollTaxRecord> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tax record' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
