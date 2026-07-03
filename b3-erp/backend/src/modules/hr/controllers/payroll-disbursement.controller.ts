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
import { PayrollDisbursementService } from '../services/payroll-disbursement.service';
import { PayrollDisbursement } from '../entities/payroll-disbursement.entity';

@ApiTags('HR - Payroll Disbursements')
@Controller('hr/payroll-disbursements')
export class PayrollDisbursementController {
  constructor(private readonly service: PayrollDisbursementService) {}

  @Get()
  @ApiOperation({ summary: 'Get payroll disbursement / verification rows' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('period') period?: string,
    @Query('search') search?: string,
  ): Promise<PayrollDisbursement[]> {
    return this.service.findAll({ companyId, category, status, period, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a disbursement row by ID' })
  findOne(@Param('id') id: string): Promise<PayrollDisbursement> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a disbursement row' })
  create(
    @Body() body: Partial<PayrollDisbursement> & { companyId?: string },
  ): Promise<PayrollDisbursement> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a disbursement row' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<PayrollDisbursement>,
  ): Promise<PayrollDisbursement> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a disbursement row' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
