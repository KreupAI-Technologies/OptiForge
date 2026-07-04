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
import { PayrollLoanRecoveryService } from '../services/payroll-loan-recovery.service';
import { PayrollLoanRecovery } from '../entities/payroll-loan-recovery.entity';

@ApiTags('HR - Payroll Loan Recoveries')
@Controller('hr/loan-recoveries')
export class PayrollLoanRecoveryController {
  constructor(private readonly service: PayrollLoanRecoveryService) {}

  @Get()
  @ApiOperation({ summary: 'Get loan recovery / repayment records' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('search') search?: string,
  ): Promise<PayrollLoanRecovery[]> {
    return this.service.findAll({ companyId, status, method, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a loan recovery by ID' })
  findOne(@Param('id') id: string): Promise<PayrollLoanRecovery> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a loan recovery' })
  create(
    @Body() body: Partial<PayrollLoanRecovery> & { companyId?: string },
  ): Promise<PayrollLoanRecovery> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a loan recovery' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollLoanRecovery>,
  ): Promise<PayrollLoanRecovery> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loan recovery' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
