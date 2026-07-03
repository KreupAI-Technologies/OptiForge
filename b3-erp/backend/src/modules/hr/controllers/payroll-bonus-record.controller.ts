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
import { PayrollBonusRecordService } from '../services/payroll-bonus-record.service';
import { PayrollBonusRecord } from '../entities/payroll-bonus-record.entity';

@ApiTags('HR - Payroll Bonus Records')
@Controller('hr/bonus-records')
export class PayrollBonusRecordController {
  constructor(private readonly service: PayrollBonusRecordService) {}

  @Get()
  @ApiOperation({ summary: 'Get annual / performance bonus records' })
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
  ): Promise<PayrollBonusRecord[]> {
    return this.service.findAll({
      companyId,
      category,
      status,
      financialYear,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bonus record by ID' })
  findOne(@Param('id') id: string): Promise<PayrollBonusRecord> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bonus record' })
  create(
    @Body() body: Partial<PayrollBonusRecord> & { companyId?: string },
  ): Promise<PayrollBonusRecord> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bonus record' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollBonusRecord>,
  ): Promise<PayrollBonusRecord> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bonus record' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
